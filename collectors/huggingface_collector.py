import requests
from datetime import datetime


class HuggingFaceCollector:
    """Hugging Face APIからローカルLLM候補のモデル情報を収集するコレクター"""

    def __init__(self, token=None):
        self.token = token
        self.headers = {}
        if token:
            self.headers["Authorization"] = f"Bearer {token}"

    def collect(self):
        models_map = {}

        # 検索条件の定義
        # GGUFモデルおよび主要モデルファミリーのモデルを収集する
        queries = [
            {"tags": "gguf", "limit": 100},
            {"search": "gguf", "limit": 100},
            {"search": "qwen", "tags": "text-generation", "limit": 50},
            {"search": "llama", "tags": "text-generation", "limit": 50},
            {"search": "gemma", "tags": "text-generation", "limit": 50},
            {"search": "deepseek", "tags": "text-generation", "limit": 50},
            {"search": "mistral", "tags": "text-generation", "limit": 30},
            {"search": "phi", "tags": "text-generation", "limit": 30},
        ]

        print("Starting Hugging Face data collection...")
        for q in queries:
            try:
                params = {"sort": "downloads", "direction": -1, "full": "true", **q}
                response = requests.get(
                    "https://huggingface.co/api/models",
                    params=params,
                    headers=self.headers,
                    timeout=30,
                )
                if response.status_code == 200:
                    data = response.json()
                    for model in data:
                        model_id = model.get("id")
                        if not model_id:
                            continue

                        # P2指摘対応: 非LLMモデル (音声認識、画像分類、埋め込み等) の早期除外
                        pipeline_tag = model.get("pipeline_tag")
                        tags = model.get("tags") or []
                        has_gguf = (
                            "gguf" in tags
                            or "gguf" in model_id.lower()
                            or any("gguf" in str(t).lower() for t in tags)
                        )

                        is_llm = False
                        if pipeline_tag in ["text-generation", "conversational"]:
                            is_llm = True
                        elif not pipeline_tag and has_gguf:
                            id_lower = model_id.lower()
                            non_llm_kws = [
                                "whisper",
                                "embedding",
                                "sentence-transformer",
                                "vit-",
                                "nsfw-",
                                "stable-diffusion",
                                "wav2vec2",
                                "phishing",
                            ]
                            if not any(kw in id_lower for kw in non_llm_kws):
                                is_llm = True

                        if not is_llm:
                            continue

                        # 重複は後続でマージされ、ダウンロード数が多いクエリの結果が優先されるように上書きするか、保持する
                        # downloads や likes が多い方を優先して保持
                        existing = models_map.get(model_id)
                        if not existing or model.get("downloads", 0) > existing.get(
                            "downloads", 0
                        ):
                            models_map[model_id] = model
                else:
                    # P1指摘対応: 一部のクエリ失敗でもFatalなエラーとして例外を送出する
                    raise RuntimeError(
                        f"HF API returned status {response.status_code} for query {q}"
                    )
            except Exception as e:
                # P1指摘対応: 例外発生時もFatalとして再送出する
                print(f"Error collecting Hugging Face models for query {q}: {e}")
                raise e

        results = []
        for model_id, m in models_map.items():
            # ライセンス情報の抽出
            license_info = None
            card_data = m.get("cardData") or {}
            if isinstance(card_data, dict):
                license_info = card_data.get("license")

            # tagsからlicenseを探す（cardDataにない場合）
            tags = m.get("tags") or []
            if not license_info:
                for tag in tags:
                    if isinstance(tag, str) and tag.startswith("license:"):
                        license_info = tag.replace("license:", "")
                        break

            # ライセンス情報がリストの場合は文字列にする
            if isinstance(license_info, list) and len(license_info) > 0:
                license_info = license_info[0]
            elif isinstance(license_info, list):
                license_info = None

            # GGUF対応有無の判定
            # タグに 'gguf' が含まれるか、モデルID名に 'gguf' が含まれるか
            has_gguf = (
                "gguf" in tags
                or "gguf" in model_id.lower()
                or any("gguf" in str(t).lower() for t in tags)
            )

            # P2指摘対応: 非LLMモデル (音声認識、画像分類、埋め込み、画像検出等) の除外
            pipeline_tag = m.get("pipeline_tag")
            is_llm = False
            if pipeline_tag in ["text-generation", "conversational"]:
                is_llm = True
            elif not pipeline_tag and has_gguf:
                # pipeline_tagが未定義でもGGUFであり、かつ非LLMの特定キーワードがモデルIDに含まれなければ許可
                id_lower = model_id.lower()
                non_llm_kws = [
                    "whisper",
                    "embedding",
                    "sentence-transformer",
                    "vit-",
                    "nsfw-",
                    "stable-diffusion",
                ]
                if not any(kw in id_lower for kw in non_llm_kws):
                    is_llm = True

            if not is_llm:
                continue

            # 最終更新日時
            last_modified_str = m.get("lastModified")

            results.append(
                {
                    "source": "huggingface",
                    "model_id": model_id,
                    "author": m.get("author")
                    or (model_id.split("/")[0] if "/" in model_id else "unknown"),
                    "downloads": m.get("downloads", 0),
                    "likes": m.get("likes", 0),
                    "last_modified": last_modified_str,
                    "tags": [str(t) for t in tags],
                    "pipeline_tag": m.get("pipeline_tag"),
                    "library_name": m.get("library_name"),
                    "license": str(license_info) if license_info else None,
                    "has_gguf": has_gguf,
                    "model_url": f"https://huggingface.co/{model_id}",
                    "collected_at": datetime.utcnow().isoformat() + "Z",
                }
            )

        print(f"Successfully collected {len(results)} unique models from Hugging Face.")
        return results


if __name__ == "__main__":
    collector = HuggingFaceCollector()
    data = collector.collect()
    if data:
        print(f"Sample: {data[0]}")
