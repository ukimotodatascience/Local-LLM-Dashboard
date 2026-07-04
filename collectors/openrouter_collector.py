import requests
from datetime import datetime


class OpenRouterCollector:
    """OpenRouter APIからモデル情報を収集するコレクター。
    コンテキスト長や価格情報などの補助情報を取得するために利用します。
    """

    def __init__(self, api_key=None):
        self.api_key = api_key
        self.headers = {}
        if api_key:
            self.headers["Authorization"] = f"Bearer {api_key}"

    def collect(self):
        print("Starting OpenRouter data collection...")
        url = "https://openrouter.ai/api/v1/models"
        try:
            response = requests.get(url, headers=self.headers, timeout=30)
            if response.status_code == 200:
                data = response.json()
                models = data.get("data", [])
                results = []

                for m in models:
                    model_id = m.get("id")
                    if not model_id:
                        continue

                    # pricing情報の抽出
                    pricing_raw = m.get("pricing") or {}
                    pricing = {
                        "prompt": str(pricing_raw.get("prompt", 0)),
                        "completion": str(pricing_raw.get("completion", 0)),
                    }

                    # architecture情報の抽出
                    arch_raw = m.get("architecture") or {}
                    architecture = (
                        arch_raw.get("tokenizer")
                        or arch_raw.get("instruct_type")
                        or "unknown"
                    )

                    results.append(
                        {
                            "source": "openrouter",
                            "model_id": model_id,
                            "name": m.get("name"),
                            "description": m.get("description"),
                            "context_length": m.get("context_length"),
                            "pricing": pricing,
                            "architecture": architecture,
                            "collected_at": datetime.utcnow().isoformat() + "Z",
                        }
                    )

                print(f"Successfully collected {len(results)} models from OpenRouter.")
                return results
            else:
                print(f"OpenRouter API returned status {response.status_code}")
                return []
        except Exception as e:
            print(f"Error collecting OpenRouter models: {e}")
            return []


if __name__ == "__main__":
    collector = OpenRouterCollector()
    data = collector.collect()
    if data:
        print(f"Sample: {data[0]}")
