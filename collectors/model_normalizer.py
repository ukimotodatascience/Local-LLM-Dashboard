import re
import math
from datetime import datetime
from dateutil import parser as date_parser


class ModelNormalizer:
    """異なるデータソースから収集されたモデル情報を統合・正規化し、
    共通のスキーマとRadar Scoreを算出するクラス。
    """

    def __init__(self, previous_models=None):
        # 過去のモデルデータ（差分計算や急上昇判定用）
        # {model_id: model_dict}
        self.previous_models = previous_models or {}
        self.current_time = datetime.utcnow()

    def normalize_all(self, hf_models, or_models, ol_models):
        """Hugging Face, OpenRouter, Ollamaの全データをマージ・正規化する"""
        normalized_list = []

        # 1. Hugging Faceモデルをベースとして初期化
        for hf in hf_models:
            model_id = hf["model_id"]

            # モデル名等のパース
            parsed = self._parse_model_info(model_id, hf.get("tags", []))

            # Ollama対応状況の推定・紐付け
            has_ollama, ollama_url = self._match_ollama(
                model_id, parsed["family"], parsed["size"], ol_models
            )

            # OpenRouterの補助情報の紐付け
            or_info = self._match_openrouter(
                model_id, parsed["family"], parsed["size"], or_models
            )

            # 用途タグ付け
            use_cases = self._determine_use_cases(
                model_id, hf.get("tags", []), parsed["size"]
            )

            # 過去の履歴データの参照
            prev_model = self.previous_models.get(model_id, {})
            first_seen_at = prev_model.get("first_seen_at")
            if not first_seen_at:
                first_seen_at = hf.get("collected_at")

            # 成長率の計算
            downloads = hf["downloads"]
            growth_rate = 0.0
            if prev_model:
                prev_dl = prev_model.get("downloads", 0)
                prev_likes = prev_model.get("likes", 0)
                dl_growth = (downloads - prev_dl) / prev_dl if prev_dl > 0 else 0.0
                likes_growth = (
                    (hf["likes"] - prev_likes) / prev_likes if prev_likes > 0 else 0.0
                )
                growth_rate = max(dl_growth, likes_growth)

            # メタデータ構築
            item = {
                "id": model_id,
                "display_name": parsed["display_name"],
                "source": "huggingface",
                "sources": {
                    "huggingface": hf["model_url"],
                    "ollama": ollama_url,
                    "openrouter": or_info.get("model_url"),
                },
                "author": hf["author"],
                "model_family": parsed["family"],
                "model_size": parsed["size"],
                "quantization": parsed["quantization"],
                "license": hf["license"] or or_info.get("license") or "unknown",
                "downloads": hf["downloads"],
                "likes": hf["likes"],
                "last_modified": hf["last_modified"],
                "first_seen_at": first_seen_at,
                "last_seen_at": hf["collected_at"],
                "has_gguf": hf["has_gguf"],
                "has_ollama": has_ollama,
                "context_length": or_info.get("context_length"),
                "pricing": or_info.get("pricing"),
                "description": or_info.get("description"),
                "use_cases": use_cases,
                "tags": hf.get("tags", []),
                "growth_rate": growth_rate,
                "collected_at": hf["collected_at"],
            }

            # スコアリングと急上昇・新規判定
            item["radar_score"] = self._calculate_radar_score(item, prev_model)
            item["is_new"] = self._determine_is_new(item)
            item["is_rising"] = self._determine_is_rising(item, prev_model)

            normalized_list.append(item)

        # スコア順にソート
        normalized_list.sort(key=lambda x: x["radar_score"], reverse=True)
        return normalized_list

    def _parse_model_info(self, model_id, tags):
        """モデルIDやタグから、ファミリー、サイズ、量子化などの情報を抽出する"""
        parts = model_id.split("/")
        name = parts[-1] if len(parts) > 1 else model_id

        # 1. 推定ファミリーの特定
        family = "Other"
        family_map = {
            "qwen": "Qwen",
            "llama": "Llama",
            "gemma": "Gemma",
            "deepseek": "DeepSeek",
            "mistral": "Mistral",
            "phi": "Phi",
            "smollm": "SmolLM",
            "command-r": "Command-R",
            "nemotron": "Nemotron",
            "exallama": "Llama",
        }
        model_id_lower = model_id.lower()
        for kw, fam in family_map.items():
            if kw == "phi":
                # phiは独立した単語境界でマッチする（dolphin等の部分一致を防止）
                if re.search(r"(?:^|[^a-zA-Z])phi(?:[^a-zA-Z]|$)", model_id_lower):
                    family = fam
                    break
            elif kw in model_id_lower:
                family = fam
                break

        # 2. 推定モデルサイズの特定 (例: 7b, 8b, 1.5b, 70b, 500m)
        size = "unknown"
        # P2指摘対応: 1B未満のMillionパラメータ(M)モデルサイズも抽出できるように [bBmM] をサポート
        size_match = re.search(
            r"(?:^|[^a-zA-Z])(\d+(?:\.\d+)?)[bBmM](?:[^a-zA-Z]|$)", name
        )
        if size_match:
            unit = name[size_match.start(0) : size_match.end(0)].lower()
            if "m" in unit:
                size = f"{size_match.group(1).upper()}M"
            else:
                size = f"{size_match.group(1).upper()}B"
        else:
            # タグから探す
            for t in tags:
                tag_match = re.search(r"^(\d+(?:\.\d+)?)[bBmM]$", str(t))
                if tag_match:
                    unit = str(t).lower()
                    if "m" in unit:
                        size = f"{tag_match.group(1).upper()}M"
                    else:
                        size = f"{tag_match.group(1).upper()}B"
                    break

        # 3. 量子化形式の特定
        quant = "FP16"  # デフォルト
        if "gguf" in model_id_lower or "gguf" in tags:
            quant = "GGUF"
            # P2指摘対応: GGUFファイル名等に含まれる Q-level (Q8_0, Q4_K_M 等) をパースして反映
            q_match = re.search(
                r"(?:^|[^a-zA-Z])(q\d(?:_[a-zA-Z\d_]+)?|iq\d(?:_[a-zA-Z\d_]+)?)(?:[^a-zA-Z\d_]|$)",
                model_id_lower,
            )
            if q_match:
                quant = f"GGUF ({q_match.group(1).upper()})"
            else:
                for t in tags:
                    t_str = str(t).lower()
                    qt_match = re.search(
                        r"^(q\d(?:_[a-zA-Z\d_]+)?|iq\d(?:_[a-zA-Z\d_]+)?)$",
                        t_str,
                    )
                    if qt_match:
                        quant = f"GGUF ({qt_match.group(1).upper()})"
                        break
        elif "gptq" in model_id_lower or "gptq" in tags:
            quant = "GPTQ"
        elif "awq" in model_id_lower or "awq" in tags:
            quant = "AWQ"
        elif "exl2" in model_id_lower:
            quant = "EXL2"
        else:
            for t in tags:
                if "quantized" in str(t).lower():
                    quant = "Quantized"
                    break

        # 4. 表示名の整形
        # Qwen/Qwen2.5-7B-Instruct-GGUF -> Qwen2.5 7B Instruct GGUF
        display_name = name.replace("-", " ").replace("_", " ")
        # 重複するワードを整理（例: Qwen Qwen2.5 -> Qwen2.5）
        display_name = " ".join(dict.fromkeys(display_name.split()))

        return {
            "display_name": display_name,
            "family": family,
            "size": size,
            "quantization": quant,
        }

    def _match_ollama(self, model_id, family, size, ol_models):
        """Ollamaカタログとのマッチングを行い、対応状況とURLを返す"""
        model_id_lower = model_id.lower()

        # P2指摘対応: カタログ名が長い（より具体的）ものを優先して一致判定するため、モデル名文字数の降順でソート
        sorted_ol_models = sorted(
            ol_models, key=lambda x: len(x["model_name"]), reverse=True
        )

        for ol in sorted_ol_models:
            ol_name = ol["model_name"]

            # 1. カタログモデル名がモデルIDに含まれるか (例: "llama3.2" in "meta-llama/Llama-3.2-3B")
            if ol_name in model_id_lower:
                if size != "unknown":
                    ol_sizes = [s.upper() for s in ol.get("sizes", [])]
                    if size in ol_sizes:
                        return True, ol["ollama_url"]
                else:
                    return True, ol["ollama_url"]

            # 2. ファミリーとサイズが正確に合致し、かつモデルIDにファミリー名が含まれる場合
            if ol["family"] == family and size != "unknown":
                ol_sizes = [s.upper() for s in ol.get("sizes", [])]
                if size in ol_sizes:
                    if family.lower() in model_id_lower:
                        return True, ol["ollama_url"]

        return False, None

    def _match_openrouter(self, model_id, family, size, or_models):
        """OpenRouterモデル情報とのマッチング"""
        if family == "Other" or size == "unknown":
            return {}

        model_id_lower = model_id.lower()
        fam_key = family.lower()
        # size が 500M などの場合はMを考慮
        size_key = size.lower().replace("b", "").replace("m", "")

        for or_m in or_models:
            or_id = or_m["model_id"].lower()

            # ファミリー名が含まれ、かつサイズが一致することを必須とする
            if fam_key in or_id:
                or_size_match = re.search(
                    r"(?:^|[^a-zA-Z])(\d+(?:\.\d+)?)[bBmM](?:[^a-zA-Z]|$)", or_id
                )
                if or_size_match:
                    or_size = or_size_match.group(1)
                    if or_size == size_key:
                        # P2指摘対応: 特性バリアントの整合性確認 (coder, vision/vl などの有無が一致すること)
                        is_coder_hf = "coder" in model_id_lower
                        is_coder_or = "coder" in or_id
                        if is_coder_hf != is_coder_or:
                            continue

                        is_vl_hf = "vl" in model_id_lower or "vision" in model_id_lower
                        is_vl_or = "vl" in or_id or "vision" in or_id
                        if is_vl_hf != is_vl_or:
                            continue

                        # P2指摘対応: 世代バージョンの整合性確認 (例: qwen2.5 と qwen3, llama3.1 と llama3 などのミスマッチ防止)
                        versions = ["2.5", "3.1", "3.2", "3", "4"]
                        hf_versions = [v for v in versions if v in model_id_lower]
                        or_versions = [v for v in versions if v in or_id]
                        if hf_versions and or_versions:
                            if not (set(hf_versions) & set(or_versions)):
                                continue

                        # 指導データかどうかの整合性も考慮
                        is_instruct_hf = (
                            "instruct" in model_id_lower
                            or "chat" in model_id_lower
                            or "it" in model_id_lower
                        )
                        is_instruct_or = "instruct" in or_id or "chat" in or_id

                        if is_instruct_hf == is_instruct_or:
                            return {
                                "context_length": or_m.get("context_length"),
                                "pricing": or_m.get("pricing"),
                                "description": or_m.get("description"),
                                "license": or_m.get("license"),
                                "model_url": f"https://openrouter.ai/models/{or_m['model_id']}",
                            }

        return {}

    def _determine_use_cases(self, model_id, tags, size):
        """モデルID、タグ、サイズから用途を推定する"""
        use_cases = []
        model_id_lower = model_id.lower()
        tags_lower = [str(t).lower() for t in tags]

        # 1. Coding
        coder_kws = ["coder", "code", "coding", "instruct-code", "developer"]
        if any(kw in model_id_lower for kw in coder_kws) or "code" in tags_lower:
            use_cases.append("Coding")

        # 2. Japanese
        # P2指摘対応: 部分一致による誤判定 (Ministral や Janus -> ja など) を防ぐため、単語境界および完全タグ一致でチェック
        has_ja_keyword = (
            "japanese" in model_id_lower
            or "nihongo" in model_id_lower
            or re.search(r"(?:^|[^a-zA-Z])ja(?:[^a-zA-Z]|$)", model_id_lower)
            or "japanese" in tags_lower
            or "ja" in tags_lower
        )
        if has_ja_keyword:
            use_cases.append("Japanese")

        # 3. Reasoning
        reasoning_kws = ["reasoning", "r1", "thinking", "math", "cot", "deepseek-r"]
        if (
            any(kw in model_id_lower for kw in reasoning_kws)
            or "reasoning" in tags_lower
        ):
            use_cases.append("Reasoning")

        # 4. RAG / Long-context
        rag_kws = ["long-context", "rag", "128k", "32k", "embedding"]
        if (
            any(kw in model_id_lower for kw in rag_kws)
            or "rag" in tags_lower
            or "long-context" in tags_lower
        ):
            use_cases.append("RAG")

        # 5. Lightweight
        if size != "unknown":
            try:
                # P2指摘対応: 500MなどのMillion単位モデルをLightweightに含め、B単位は9B以下を対象にする
                if "M" in size:
                    use_cases.append("Lightweight")
                else:
                    num_size = float(size.replace("B", ""))
                    if num_size <= 9.0:
                        use_cases.append("Lightweight")
            except ValueError:
                pass

        # 6. Vision / Multimodal
        vision_kws = ["vision", "vl", "multimodal", "image"]
        if (
            any(kw in model_id_lower for kw in vision_kws)
            or "multimodal" in tags_lower
            or "vision" in tags_lower
        ):
            use_cases.append("Vision")

        # 7. MoE (Mixture of Experts)
        moe_kws = ["moe", "mixture-of-experts", "expert"]
        if any(kw in model_id_lower for kw in moe_kws) or "moe" in tags_lower:
            use_cases.append("MoE")

        # 8. General (Chat / Instruct)
        chat_kws = ["chat", "instruct", "conversational", "it"]
        if (
            any(kw in model_id_lower for kw in chat_kws)
            or "text-generation" in tags_lower
            or len(use_cases) == 0
        ):
            use_cases.append("General")

        return list(set(use_cases))

    def _calculate_radar_score(self, item, prev_model):
        """Radar Scoreを算出する"""

        # 1. Popularity Score (35%)
        # ダウンロード数とLike数を対数スケールで0-100に正規化
        downloads = item["downloads"]
        likes = item["likes"]

        # 最大値を定義してスケール
        max_dl_log = math.log10(1000000 + 1)  # 1M downloads
        max_likes_log = math.log10(10000 + 1)  # 10K likes

        dl_score = min(100.0, (math.log10(downloads + 1) / max_dl_log) * 100.0)
        likes_score = min(100.0, (math.log10(likes + 1) / max_likes_log) * 100.0)

        popularity_score = dl_score * 0.7 + likes_score * 0.3

        # 2. Growth Score (25%)
        # item 内に格納済みの growth_rate を利用
        growth_rate = item.get("growth_rate", 0.0)
        growth_score = min(100.0, growth_rate * 333.3)

        # 3. Recency Score (15%)
        # 最終更新日時からの経過時間に基づく
        recency_score = 0.0
        last_mod_str = item["last_modified"]
        if last_mod_str:
            try:
                last_mod = date_parser.isoparse(last_mod_str).replace(tzinfo=None)
                days_diff = (self.current_time - last_mod).days
                # 30日以内なら100点、そこから1日ごとに減点（50日以上で0点）
                recency_score = max(0.0, 100.0 - max(0, days_diff - 30) * 5.0)
            except Exception:
                recency_score = 50.0
        else:
            recency_score = 50.0

        # 4. Local Availability Score (15%)
        # GGUF対応、Ollama対応、量子化で加点
        local_score = 0.0
        if item["has_gguf"]:
            local_score += 50.0
        if item["has_ollama"]:
            local_score += 50.0

        # 5. Metadata Quality Score (10%)
        # ライセンス、サイズ、用途タグ、説明の明確さ
        meta_score = 0.0
        if item["license"] and item["license"] != "unknown":
            meta_score += 30.0
        if item["model_size"] != "unknown":
            meta_score += 35.0
        if len(item["use_cases"]) > 0:
            meta_score += 35.0

        # 総合スコアの計算
        radar_score = (
            popularity_score * 0.35
            + growth_score * 0.25
            + recency_score * 0.15
            + local_score * 0.15
            + meta_score * 0.10
        )

        return round(radar_score, 1)

    def _determine_is_new(self, item):
        """新規検出モデルかどうかの判定（7日以内）"""
        first_seen_str = item["first_seen_at"]
        if first_seen_str:
            try:
                first_seen = date_parser.isoparse(first_seen_str).replace(tzinfo=None)
                days_diff = (self.current_time - first_seen).days
                return days_diff <= 7
            except Exception:
                return False
        return True

    def _determine_is_rising(self, item, prev_model):
        """急上昇モデルかどうかの判定"""
        # 条件：ダウンロード数またはLike数の前回比増加率が30%以上
        if prev_model:
            prev_dl = prev_model.get("downloads", 0)
            prev_likes = prev_model.get("likes", 0)

            dl_growth = (item["downloads"] - prev_dl) / prev_dl if prev_dl > 0 else 0.0
            likes_growth = (
                (item["likes"] - prev_likes) / prev_likes if prev_likes > 0 else 0.0
            )

            if dl_growth >= 0.30 or likes_growth >= 0.30:
                return True
        else:
            # 初回実行時は、ダウンロード数が多く、かつ更新が新しいものを急上昇と見なす
            # downloadsが10万以上かつ最終更新が30日以内
            if item["downloads"] >= 100000 and item["radar_score"] >= 75.0:
                return True

        return False
