# Local-LLM-Dashboard

ローカル実行可能なLLMやopen-weight LLMの最新動向を収集・整理・可視化する公開ダッシュボードプロジェクトです。

Hugging Face、Ollama、OpenRouterなどの情報源から、モデルの人気度、更新状況、配布形式、コンテキスト長、ライセンス、用途、モデルサイズなどを定期的に自動収集し、俯瞰して比較できるダッシュボードを提供します。

---

## 📖 ドキュメント

- **[要件定義書](docs/requirements.md)**: プロジェクトの詳細な目的、コンセプト、システム構成、要件などの仕様はこちらを参照してください。

---

## 🛠️ プロジェクト構成

```text
Local-LLM-Dashboard/
├── collectors/          # データ収集スクリプト (Python)
│   ├── huggingface_collector.py
│   ├── ollama_library_collector.py
│   └── openrouter_collector.py
├── data/                # 収集したJSONデータの保存先
│   ├── latest/          # 最新のデータ
│   └── history/         # 履歴データ
├── docs/                # 設計・仕様ドキュメント
│   └── requirements.md  # 要件定義書
├── src/                 # フロントエンドソースコード (React + TypeScript)
├── scripts/             # タスク実行用スクリプト
├── AGENTS.md            # エージェント開発ガイドライン
└── README.md            # 本ファイル
```

---

## 🚀 開発の準備

### 1. Python環境の構築 (データ収集側)

本プロジェクトでは、パッケージ管理および仮想環境に [uv](https://github.com/astral-sh/uv) を使用することを推奨しています。

```bash
# 仮想環境の作成
uv venv

# 仮想環境のアクティベート
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# 依存関係のインストール
uv pip install -r requirements.txt
```

### 2. フロントエンドの起動 (ダッシュボード表示側)

```bash
# パッケージのインストール
npm install

# 開発サーバーの起動
npm run dev
```

---

## 🤖 エージェント開発について

AIエージェントが本リポジトリで作業する際は、[AGENTS.md](AGENTS.md) に定義されたガイドラインを必ず遵守してください。また、コミット前には `pre-commit` による品質チェックを実行してください。
