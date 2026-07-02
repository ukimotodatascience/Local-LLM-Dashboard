import os
import sys
import json
from datetime import datetime

# パスの解決 (プロジェクトルートをインポートパスに追加)
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from collectors.huggingface_collector import HuggingFaceCollector
from collectors.openrouter_collector import OpenRouterCollector
from collectors.ollama_library_collector import OllamaLibraryCollector
from collectors.model_normalizer import ModelNormalizer


def load_previous_models(data_dir):
    """前回のモデル一覧データをロードする"""
    models_file = os.path.join(data_dir, "latest", "models.json")
    if os.path.exists(models_file):
        try:
            with open(models_file, "r", encoding="utf-8") as f:
                models_list = json.load(f)
                # リストをIDキーの辞書に変換
                return {m["id"]: m for m in models_list}
        except Exception as e:
            print(f"Warning: Failed to load previous models: {e}")
    return {}


def build_family_trends(models):
    """モデルファミリ別の集計データを生成する"""
    families = {}
    for m in models:
        fam = m.get("model_family", "Other")
        if fam not in families:
            families[fam] = {
                "family": fam,
                "model_count": 0,
                "new_model_count": 0,
                "rising_model_count": 0,
                "total_downloads": 0,
                "total_likes": 0,
                "radar_scores": [],
            }

        f_data = families[fam]
        f_data["model_count"] += 1
        if m.get("is_new"):
            f_data["new_model_count"] += 1
        if m.get("is_rising"):
            f_data["rising_model_count"] += 1
        f_data["total_downloads"] += m.get("downloads", 0)
        f_data["total_likes"] += m.get("likes", 0)
        f_data["radar_scores"].append(m.get("radar_score", 0.0))

    # 平均値の計算と整形
    result = []
    for fam, data in families.items():
        scores = data["radar_scores"]
        avg_score = sum(scores) / len(scores) if scores else 0.0
        del data["radar_scores"]
        data["avg_radar_score"] = round(avg_score, 1)
        result.append(data)

    # モデルカウント順にソート
    result.sort(key=lambda x: x["model_count"], reverse=True)
    return result


def main():
    # 実行ディレクトリ等の準備
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(base_dir, "data")
    latest_dir = os.path.join(data_dir, "latest")
    history_dir = os.path.join(data_dir, "history")

    os.makedirs(latest_dir, exist_ok=True)
    os.makedirs(history_dir, exist_ok=True)

    # 環境変数からトークン等の取得
    hf_token = os.environ.get("HF_TOKEN")
    or_api_key = os.environ.get("OPENROUTER_API_KEY")

    # 前回のデータのロード
    previous_models = load_previous_models(data_dir)
    print(f"Loaded {len(previous_models)} historical models for delta analysis.")

    # データ収集
    hf_collector = HuggingFaceCollector(token=hf_token)
    or_collector = OpenRouterCollector(api_key=or_api_key)
    ol_collector = OllamaLibraryCollector()

    hf_data = hf_collector.collect()
    # P1指摘対応: Hugging Faceの取得失敗時に既存データを空上書きして全損させないためのバリデーション
    if not hf_data or len(hf_data) < 20:
        print(
            "Error: Hugging Face dataset is empty or unexpectedly small. Aborting collection to prevent data loss."
        )
        sys.exit(1)

    or_data = or_collector.collect()
    ol_data = ol_collector.collect()

    # データ正規化と統合
    normalizer = ModelNormalizer(previous_models=previous_models)
    normalized_models = normalizer.normalize_all(hf_data, or_data, ol_data)

    # フィルタリングされたサブセット
    # P2指摘対応: 急上昇モデルは全体のradar_score順ではなく、成長率(growth_rate)順でソートする
    rising_models = [m for m in normalized_models if m.get("is_rising")]
    rising_models.sort(key=lambda x: x.get("growth_rate", 0.0), reverse=True)

    new_models = [m for m in normalized_models if m.get("is_new")]

    # ファミリ別トレンドの構築
    family_trends = build_family_trends(normalized_models)

    # サマリー情報の作成
    total_downloads = sum(m.get("downloads", 0) for m in normalized_models)
    total_likes = sum(m.get("likes", 0) for m in normalized_models)

    summary = {
        "total_models": len(normalized_models),
        "total_downloads": total_downloads,
        "total_likes": total_likes,
        "top_rising_models": rising_models[:5],
        "top_new_models": new_models[:5],
        "top_radar_models": normalized_models[:5],
    }

    # メタデータ
    collected_at = datetime.utcnow().isoformat() + "Z"
    metadata = {
        "collected_at": collected_at,
        "data_version": "1.0.0",
        "total_count": len(normalized_models),
        "sources": [
            {"name": "Hugging Face API", "status": "success", "count": len(hf_data)},
            {
                "name": "OpenRouter API",
                "status": "success" if or_data else "skipped/failed",
                "count": len(or_data),
            },
            {"name": "Ollama Catalog", "status": "success", "count": len(ol_data)},
        ],
    }

    # ファイル書き出し
    files_to_write = {
        os.path.join(latest_dir, "models.json"): normalized_models,
        os.path.join(latest_dir, "rising.json"): rising_models,
        os.path.join(latest_dir, "new_models.json"): new_models,
        os.path.join(latest_dir, "families.json"): family_trends,
        os.path.join(latest_dir, "summary.json"): summary,
        os.path.join(latest_dir, "metadata.json"): metadata,
    }

    # 日次スナップショットファイル
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    files_to_write[os.path.join(history_dir, f"{today_str}.json")] = normalized_models

    print("Writing JSON outputs...")
    for filepath, content in files_to_write.items():
        try:
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(content, f, ensure_ascii=False, indent=2)
            print(f"Wrote: {os.path.basename(filepath)}")
        except Exception as e:
            print(f"Error writing file {filepath}: {e}")
            sys.exit(1)

    print("Data collection and generation pipeline completed successfully.")


if __name__ == "__main__":
    main()
