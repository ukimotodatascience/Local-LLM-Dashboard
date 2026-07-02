from datetime import datetime

class OllamaLibraryCollector:
    """Ollama公式ライブラリ情報を管理・提供するコレクター。
    公式の安定したAPIが存在しないため、主要モデルのメタデータを定義し、
    Hugging Face等のデータと統合する際に利用します。
    """
    
    def __init__(self):
        # Ollama公式ライブラリに存在する主要なモデルの一覧
        self.catalog = [
            {
                "model_name": "llama3.3",
                "family": "Llama",
                "tags": ["latest", "70b"],
                "sizes": ["70B"],
                "description": "State-of-the-art 70B model from Meta, built for high-quality dialog and reasoning.",
                "ollama_url": "https://ollama.com/library/llama3.3"
            },
            {
                "model_name": "llama3.2",
                "family": "Llama",
                "tags": ["1b", "3b", "latest"],
                "sizes": ["1B", "3B"],
                "description": "Meta's lightweight 1B and 3B models, optimized for local and mobile devices.",
                "ollama_url": "https://ollama.com/library/llama3.2"
            },
            {
                "model_name": "llama3.1",
                "family": "Llama",
                "tags": ["8b", "70b", "405b"],
                "sizes": ["8B", "70B", "405B"],
                "description": "Meta's highly capable model family in sizes 8B, 70B, and 405B.",
                "ollama_url": "https://ollama.com/library/llama3.1"
            },
            {
                "model_name": "llama3",
                "family": "Llama",
                "tags": ["8b", "70b"],
                "sizes": ["8B", "70B"],
                "description": "Meta's previous generation open LLM, highly popular for standard tasks.",
                "ollama_url": "https://ollama.com/library/llama3"
            },
            {
                "model_name": "deepseek-r1",
                "family": "DeepSeek",
                "tags": ["1.5b", "7b", "8b", "14b", "32b", "70b", "671b", "latest"],
                "sizes": ["1.5B", "7B", "8B", "14B", "32B", "70B", "671B"],
                "description": "DeepSeek's first generation reasoning models, featuring chain-of-thought capabilities.",
                "ollama_url": "https://ollama.com/library/deepseek-r1"
            },
            {
                "model_name": "deepseek-v3",
                "family": "DeepSeek",
                "tags": ["671b", "latest"],
                "sizes": ["671B"],
                "description": "DeepSeek's flagship Mixture-of-Experts (MoE) language model.",
                "ollama_url": "https://ollama.com/library/deepseek-v3"
            },
            {
                "model_name": "qwen2.5",
                "family": "Qwen",
                "tags": ["0.5b", "1.5b", "3b", "7b", "14b", "32b", "72b", "latest"],
                "sizes": ["0.5B", "1.5B", "3B", "7B", "14B", "32B", "72B"],
                "description": "Alibaba's Qwen2.5 LLM family, offering excellent performance across languages.",
                "ollama_url": "https://ollama.com/library/qwen2.5"
            },
            {
                "model_name": "qwen2.5-coder",
                "family": "Qwen",
                "tags": ["1.5b", "7b", "32b", "latest"],
                "sizes": ["1.5B", "7B", "32B"],
                "description": "Specialized coding models from Alibaba, matching top proprietary models.",
                "ollama_url": "https://ollama.com/library/qwen2.5-coder"
            },
            {
                "model_name": "gemma2",
                "family": "Gemma",
                "tags": ["2b", "9b", "27b", "latest"],
                "sizes": ["2B", "9B", "27B"],
                "description": "Google's lightweight state-of-the-art open models built from Gemini technology.",
                "ollama_url": "https://ollama.com/library/gemma2"
            },
            {
                "model_name": "mistral",
                "family": "Mistral",
                "tags": ["7b", "latest"],
                "sizes": ["7B"],
                "description": "7B dense Transformer model from Mistral AI, fast and highly customizable.",
                "ollama_url": "https://ollama.com/library/mistral"
            },
            {
                "model_name": "mistral-nemo",
                "family": "Mistral",
                "tags": ["12b", "latest"],
                "sizes": ["12B"],
                "description": "12B model built in collaboration with NVIDIA, featuring 128k context window.",
                "ollama_url": "https://ollama.com/library/mistral-nemo"
            },
            {
                "model_name": "phi4",
                "family": "Phi",
                "tags": ["14b", "latest"],
                "sizes": ["14B"],
                "description": "Microsoft's Phi-4, a 14B parameter state-of-the-art language model.",
                "ollama_url": "https://ollama.com/library/phi4"
            },
            {
                "model_name": "phi3",
                "family": "Phi",
                "tags": ["3.8b", "14b", "latest"],
                "sizes": ["3.8B", "14B"],
                "description": "Microsoft's Phi-3 family of lightweight open models.",
                "ollama_url": "https://ollama.com/library/phi3"
            },
            {
                "model_name": "smollm2",
                "family": "SmolLM",
                "tags": ["135m", "360m", "1.7b", "latest"],
                "sizes": ["0.1B", "0.4B", "1.7B"],
                "description": "Hugging Face's extremely lightweight models for local on-device use.",
                "ollama_url": "https://ollama.com/library/smollm2"
            },
            {
                "model_name": "codegemma",
                "family": "Gemma",
                "tags": ["2b", "7b", "latest"],
                "sizes": ["2B", "7B"],
                "description": "Gemma-based models fine-tuned specifically for coding and code execution tasks.",
                "ollama_url": "https://ollama.com/library/codegemma"
            }
        ]

    def collect(self):
        print("Loading Ollama Library catalog data...")
        results = []
        collected_at = datetime.utcnow().isoformat() + "Z"
        
        for item in self.catalog:
            results.append({
                "source": "ollama",
                "model_name": item["model_name"],
                "family": item["family"],
                "tags": item["tags"],
                "sizes": item["sizes"],
                "description": item["description"],
                "ollama_url": item["ollama_url"],
                "collected_at": collected_at
            })
            
        print(f"Loaded {len(results)} Ollama library entries.")
        return results

if __name__ == "__main__":
    collector = OllamaLibraryCollector()
    data = collector.collect()
    print(f"Sample: {data[0]}")
