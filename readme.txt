# Local-LLM-Dashboard 要件定義書

## 1. 概要

### 1.1 プロジェクト名

Local-LLM-Dashboard

### 1.2 目的

Local-LLM-Dashboard は、ローカル実行可能なLLMやopen-weight LLMの最新動向を収集・整理・可視化する公開ダッシュボードである。

Hugging Face、Ollama、OpenRouterなどの情報源から、モデルの人気度、更新状況、配布形式、コンテキスト長、ライセンス、用途、モデルサイズなどを定期的に収集し、第三者が見ても「今どのローカルLLMが注目されているのか」「どのモデルを試す価値がありそうか」を把握できるようにする。

本システムは、個人のローカル環境を読み取るためのものではない。
公開情報をもとに、ローカルLLMの動向を俯瞰できる情報ダッシュボードとして設計する。

---

## 2. コンセプト

### 2.1 一言でいうと

ローカルLLM / open-weight LLM のための公開レーダー。

### 2.2 目指す体験

利用者がサイトを開いたときに、以下がすぐ分かる状態を目指す。

* 今注目されているローカルLLMは何か
* 最近公開・更新されたモデルは何か
* Hugging Face上で急上昇しているモデルは何か
* GGUFやOllamaなど、ローカル実行しやすい形式があるか
* どのモデルがコード生成・日本語・RAG・軽量用途に向いていそうか
* モデルごとのサイズ、ライセンス、更新日、人気度はどうか
* 試す候補をどう絞ればよいか

### 2.3 重要な方針

このダッシュボードは、個人最適化ではなく公開価値を重視する。

そのため、以下は行わない。

* 利用者のPCスペックを読み取らない
* ローカルにインストールされたOllamaモデルを取得しない
* 個人環境でのtokens/secをランキングに使わない
* 個人のベンチ結果を中心にしない
* Streamlitのようなローカル実行前提のUIにしない

代わりに、以下を重視する。

* 公開情報ベースの比較
* 誰でも見られるGitHub Pagesでの公開
* GitHub Actionsによる定期更新
* JSONデータとしての再利用性
* モデル比較の分かりやすさ
* 注目モデルの発見しやすさ
* 情報源と更新日時の明示

---

## 3. ゴール

### 3.1 達成したいこと

本システムで達成したいことは以下である。

* ローカルLLM / open-weight LLM候補を定期収集する
* Hugging Face上の人気度、更新日、タグ、ライセンスなどを取得する
* Ollamaライブラリ上で利用可能なモデル情報を取得または整理する
* OpenRouterからモデルの補助情報を取得する
* GGUF対応、Ollama対応、モデルサイズ、用途タグなどで絞り込めるようにする
* 「注目度」「急上昇」「新着」「用途別おすすめ候補」を可視化する
* GitHub Pagesで公開する
* GitHub Actionsで日次更新する
* 収集データをJSONとして公開し、サイト表示に利用する
* 更新履歴を蓄積し、人気度や更新状況の推移を見られるようにする

### 3.2 達成しないこと

初期段階では以下は対象外とする。

* 個人PCのOllama環境読み取り
* ローカルベンチマーク実行
* 利用者ごとのパーソナライズ
* モデルの自動ダウンロード
* モデルの自動実行
* モデルの自動評価・自動採点
* Streamlitによるローカルダッシュボード
* ログイン機能
* ユーザー投稿機能
* コメント機能
* 商用利用可否の法的保証
* 外部サイトの規約に反するスクレイピング

---

## 4. 想定ユーザー

### 4.1 主な利用者

* ローカルLLMを試したい開発者
* Hugging Faceでモデル探しをしている人
* Ollama / LM Studio / llama.cpp 系のモデルを追っている人
* open-weight LLMの動向を追いたい人
* AI関連の技術ブログや情報収集をしている人
* RAGやエージェント用途でローカルLLMを検討している人
* モデル選定の入口が欲しい人

### 4.2 利用シーン

* 「最近強いローカルLLMって何？」を調べたい
* 「今伸びているGGUFモデル」を見たい
* 「日本語対応っぽいモデル」を探したい
* 「コード生成向けのopen-weightモデル」を探したい
* 「Ollamaで使えそうなモデル」を探したい
* 「モデルサイズ別に候補を比較したい」
* 「この1週間で話題になったモデル」を見たい

---

## 5. システム構成

### 5.1 全体構成

```text
GitHub Actions
    ↓ 定期実行
Python Collectors
    ↓
Public Data JSON
    ↓
Static Frontend Build
    ↓
GitHub Pages
```

### 5.2 構成イメージ

```text
Local-LLM-Dashboard/
├─ collectors/
│  ├─ huggingface_collector.py
│  ├─ ollama_library_collector.py
│  ├─ openrouter_collector.py
│  └─ model_normalizer.py
├─ data/
│  ├─ latest/
│  │  ├─ models.json
│  │  ├─ rising.json
│  │  ├─ new_models.json
│  │  ├─ families.json
│  │  └─ metadata.json
│  ├─ history/
│  │  └─ YYYY-MM-DD.json
│  └─ snapshots/
├─ src/
│  ├─ components/
│  ├─ pages/
│  ├─ lib/
│  └─ App.tsx
├─ public/
├─ scripts/
│  ├─ collect_all.py
│  ├─ build_dataset.py
│  └─ detect_changes.py
├─ .github/
│  └─ workflows/
│     ├─ collect.yml
│     └─ deploy.yml
├─ package.json
├─ requirements.txt
└─ README.md
```

---

## 6. 技術選定

### 6.1 フロントエンド

GitHub Pagesで公開するため、静的サイトとしてビルドできる構成にする。

候補：

* Vite + React + TypeScript
* Astro
* Next.js static export
* SvelteKit static adapter

初期案では、**Vite + React + TypeScript** を採用する。

理由：

* GitHub Pagesと相性がよい
* 静的JSONを読み込むだけのダッシュボードに向いている
* インタラクティブなフィルターやテーブルを実装しやすい
* 個人開発ポートフォリオとしても見栄えがよい

### 6.2 データ収集

Pythonを使用する。

理由：

* Hugging Face Hub APIを扱いやすい
* JSON加工がしやすい
* GitHub Actionsで動かしやすい
* 後から分析処理を追加しやすい

Hugging Face HubにはAPIとPythonクライアントがあり、モデル一覧取得にも利用できる。

### 6.3 定期実行

GitHub Actionsを使用する。

GitHub Actionsはスケジュール実行に対応しており、GitHub PagesはブランチへのpushまたはActionsワークフローから公開できる。

### 6.4 公開

GitHub Pagesを使用する。

GitHub Pagesは静的ファイルを公開できるため、ビルド済みのHTML/CSS/JSとJSONデータを配信する構成に適している。

---

## 7. データ収集要件

## 7.1 Hugging Face Collector

### 7.1.1 目的

Hugging FaceからローカルLLM候補となるモデル情報を取得する。

### 7.1.2 主な収集対象

* GGUF対応モデル
* text-generationモデル
* instructモデル
* chatモデル
* coderモデル
* japanese / multilingualモデル
* 主要モデルファミリの派生モデル

### 7.1.3 検索クエリ例

```text
GGUF
Qwen GGUF
Llama GGUF
Gemma GGUF
DeepSeek GGUF
Mistral GGUF
Phi GGUF
Japanese GGUF
Coder GGUF
Instruct GGUF
```

### 7.1.4 取得項目

| 項目            | 説明                |
| ------------- | ----------------- |
| source        | 情報源               |
| model_id      | Hugging FaceモデルID |
| author        | 作者・組織             |
| downloads     | ダウンロード数           |
| likes         | Like数             |
| last_modified | 最終更新日時            |
| tags          | タグ                |
| pipeline_tag  | タスク種別             |
| library_name  | ライブラリ名            |
| license       | ライセンス             |
| has_gguf      | GGUF対応有無          |
| model_family  | 推定モデルファミリ         |
| model_size    | 推定モデルサイズ          |
| quantization  | 推定量子化形式           |
| use_cases     | 推定用途              |
| model_url     | モデルURL            |
| collected_at  | 収集日時              |

### 7.1.5 注意点

Hugging Faceの更新日はREADMEやメタデータ更新でも変化する可能性がある。
そのため、「新規モデル」と「更新モデル」は分けて扱う。

---

## 7.2 Ollama Library Collector

### 7.2.1 目的

Ollamaで利用可能なモデル情報を取得または管理する。

### 7.2.2 取得方針

Ollama公式ライブラリの情報を対象にする。
ただし、安定したAPIが利用できない場合は、以下のどちらかで対応する。

* 手動管理のモデルカタログを持つ
* 取得可能な範囲のみ自動収集する

### 7.2.3 取得項目

| 項目           | 説明             |
| ------------ | -------------- |
| model_name   | Ollama上のモデル名   |
| family       | モデルファミリ        |
| tags         | 利用可能なタグ        |
| sizes        | 利用可能なサイズ       |
| pulls        | Pull数が取得できる場合  |
| updated_at   | 更新日時が取得できる場合   |
| ollama_url   | OllamaライブラリURL |
| collected_at | 収集日時           |

### 7.2.4 注意点

Ollama連携は「利用者のローカル環境」ではなく「公開ライブラリ情報」のみを対象とする。

---

## 7.3 OpenRouter Collector

### 7.3.1 目的

OpenRouterからモデルの補助情報を取得する。

OpenRouterは、API提供状況、コンテキスト長、価格、アーキテクチャなどの情報を補完するために利用する。OpenRouterはモデル一覧と各モデルのプロパティを取得するAPIを提供している。

### 7.3.2 取得項目

| 項目             | 説明                |
| -------------- | ----------------- |
| model_id       | OpenRouter上のモデルID |
| name           | モデル名              |
| description    | 説明                |
| context_length | コンテキスト長           |
| pricing        | 価格情報              |
| architecture   | アーキテクチャ           |
| top_provider   | 主なプロバイダー          |
| created        | 作成日時がある場合         |
| collected_at   | 収集日時              |

### 7.3.3 利用方法

OpenRouter情報は、ローカルLLMの直接ランキングではなく、補助情報として表示する。

例：

* コンテキスト長の参考
* APIでも試せるかどうか
* 同名モデルの識別
* モデル説明の補完

---

## 8. データ加工要件

## 8.1 モデル名正規化

同じモデルでも情報源ごとに表記が異なるため、可能な範囲で正規化する。

例：

```text
Qwen/Qwen3-8B-GGUF
qwen3:8b
qwen/qwen3-8b
```

これらを完全一致させるのは難しいため、初期段階では以下の粒度で正規化する。

* model_family
* model_size
* quantization
* source_model_id
* display_name

### 8.1.1 正規化項目

| 項目              | 説明                                           |
| --------------- | -------------------------------------------- |
| display_name    | 表示用モデル名                                      |
| model_family    | Qwen / Llama / Gemma / Mistral / DeepSeek など |
| model_size      | 7B / 8B / 14B / 32B / 70B など                 |
| quantization    | Q4 / Q5 / Q8 / FP16 など                       |
| is_instruct     | instruct系か                                   |
| is_coder        | coder系か                                      |
| is_japanese     | Japanese関連か                                  |
| is_multilingual | multilingual関連か                              |
| is_reasoning    | reasoning系か                                  |
| is_moe          | MoE系か                                        |
| base_model      | 推定ベースモデル                                     |

---

## 8.2 用途タグ付け

モデルカードやタグ、モデル名から用途を推定する。

### 8.2.1 用途カテゴリ

| 用途          | 判定例                               |
| ----------- | --------------------------------- |
| General     | chat, instruct                    |
| Coding      | coder, code, coding               |
| Japanese    | japanese, ja, multilingual        |
| Reasoning   | reasoning, r1, thinking           |
| RAG         | long-context, embedding以外の長文対応モデル |
| Lightweight | 1B, 3B, 4B, 7B, 8B                |
| Vision      | vision, vl, multimodal            |
| MoE         | moe, mixture-of-experts           |

### 8.2.2 注意点

用途タグは推定であり、断定しない。
UI上では「推定タグ」として表示する。

---

## 8.3 注目度スコア

### 8.3.1 目的

第三者が見たときに、どのモデルが現在注目されているかを分かりやすくする。

### 8.3.2 スコア名

```text
Radar Score
```

### 8.3.3 スコア構成

```text
Radar Score =
  popularity_score
+ growth_score
+ recency_score
+ local_availability_score
+ metadata_quality_score
```

### 8.3.4 各スコアの内容

| スコア                      | 内容                                |
| ------------------------ | --------------------------------- |
| popularity_score         | downloads / likes / pulls などの人気度  |
| growth_score             | 前回比または7日間の増加率                     |
| recency_score            | 新規公開・直近更新                         |
| local_availability_score | GGUF / Ollama / llama.cpp関連の扱いやすさ |
| metadata_quality_score   | ライセンス、モデルサイズ、タグ、説明などの明確さ          |

### 8.3.5 注意点

Radar Scoreは、性能の絶対評価ではない。
「今注目されていて、ローカルLLMとして試しやすそうなモデル」を示すための指標とする。

---

## 8.4 急上昇判定

### 8.4.1 条件

以下のいずれかを満たす場合、急上昇候補とする。

* downloadsが前回比で一定以上増加
* likesが前回比で一定以上増加
* 初回検出から7日以内に一定以上の人気を獲得
* GGUF版が新たに登場
* Ollamaライブラリに追加された
* 主要モデルファミリの新バージョンが登場

### 8.4.2 初期しきい値

```text
downloads_growth_rate >= 30%
likes_growth_rate >= 30%
new_model_window_days <= 7
```

---

## 9. データ出力要件

GitHub Pages上で扱いやすいように、収集結果はJSONとして出力する。

### 9.1 latest/models.json

全モデルの最新一覧。

### 9.2 latest/rising.json

急上昇モデル一覧。

### 9.3 latest/new_models.json

新規検出モデル一覧。

### 9.4 latest/families.json

モデルファミリ別集計。

### 9.5 latest/summary.json

トップページ表示用のサマリー。

### 9.6 history/YYYY-MM-DD.json

日次スナップショット。

### 9.7 metadata.json

収集日時、データ件数、収集元、バージョンなど。

---

## 10. UI要件

## 10.1 Home

### 目的

サイト訪問者が、現在のローカルLLM動向をすぐ把握できるようにする。

### 表示内容

* 今日の注目モデル
* Radar Score上位モデル
* 急上昇モデル
* 新規検出モデル
* モデルファミリ別トレンド
* 最終更新日時
* データ収集元

---

## 10.2 Model Explorer

### 目的

モデルを検索・絞り込み・比較できるようにする。

### 表示内容

* モデル名
* 作者
* モデルファミリ
* サイズ
* downloads
* likes
* 最終更新日
* GGUF対応
* Ollama対応
* ライセンス
* 推定用途
* Radar Score
* モデルURL

### フィルター

* モデルファミリ
* サイズ
* GGUF対応
* Ollama対応
* 用途
* ライセンス
* downloads下限
* likes下限
* 新着のみ
* 急上昇のみ

---

## 10.3 Rising Models

### 目的

直近で伸びているモデルを確認できるようにする。

### 表示内容

* モデル名
* downloads増加数
* downloads増加率
* likes増加数
* likes増加率
* 初回検出日
* 最終更新日
* Radar Score
* 情報源リンク

---

## 10.4 New Models

### 目的

新しく検出されたモデルを一覧化する。

### 表示内容

* モデル名
* 作者
* 初回検出日
* 最終更新日
* GGUF対応
* 推定ファミリ
* 推定サイズ
* 推定用途
* downloads
* likes

---

## 10.5 Family Trends

### 目的

モデルファミリごとの勢いを把握できるようにする。

### 表示内容

* Qwen
* Llama
* Gemma
* DeepSeek
* Mistral
* Phi
* その他

表示する指標：

* モデル数
* 新規モデル数
* 合計downloads
* 合計likes
* 平均Radar Score
* 急上昇モデル数

---

## 10.6 Model Detail

### 目的

個別モデルの情報を詳しく確認できるようにする。

### 表示内容

* モデル名
* 説明
* 作者
* 情報源
* モデルファミリ
* サイズ
* 量子化
* ライセンス
* タグ
* downloads推移
* likes推移
* 関連モデル
* Hugging Faceリンク
* Ollamaリンク
* OpenRouterリンクがある場合

---

## 11. 公開要件

### 11.1 公開先

GitHub Pagesで公開する。

### 11.2 URL

初期想定：

```text
https://<github-user>.github.io/Local-LLM-Dashboard/
```

### 11.3 公開方式

GitHub Actionsで静的サイトをビルドし、GitHub Pagesにデプロイする。

### 11.4 更新頻度

初期設定では1日1回更新する。

### 11.5 タイムゾーン

表示上の更新日時は日本時間で分かるようにする。

---

## 12. GitHub Actions要件

## 12.1 collect.yml

### 目的

定期的にモデル情報を収集し、JSONデータを更新する。

### トリガー

* schedule
* workflow_dispatch

### 実行内容

* Python環境セットアップ
* 依存関係インストール
* Hugging Face収集
* Ollama公開ライブラリ情報の収集または更新
* OpenRouter収集
* データ正規化
* 差分検知
* JSON出力
* 更新があればcommit & push

---

## 12.2 deploy.yml

### 目的

静的サイトをビルドしてGitHub Pagesに公開する。

### トリガー

* mainブランチへのpush
* workflow_dispatch

### 実行内容

* Node.js環境セットアップ
* 依存関係インストール
* フロントエンドビルド
* GitHub Pagesへデプロイ

---

## 13. セキュリティ要件

### 13.1 シークレット管理

以下はGitHub Secretsで管理する。

* OpenRouter API Key
* 必要に応じたHugging Face Token

### 13.2 公開してはいけないもの

* APIキー
* GitHub Secrets
* 内部ログの詳細
* 失敗時の認証情報を含むエラー
* private repository由来の情報

### 13.3 収集ポリシー

* 公開APIまたは利用が許可された公開情報のみを使う
* 無理なスクレイピングはしない
* robots.txtや利用規約に反する収集はしない
* 収集頻度を上げすぎない
* 取得元リンクを明示する

---

## 14. 非機能要件

## 14.1 パフォーマンス

* GitHub Pages上で軽快に表示できること
* 初期表示で巨大JSONを読み込みすぎないこと
* 必要に応じて一覧用JSONと詳細用JSONを分ける
* テーブルの検索・フィルターが重くならないこと

## 14.2 保守性

* Collectorごとにファイルを分ける
* 正規化ロジックを独立させる
* スコアリングロジックを独立させる
* データスキーマをREADMEに明記する

## 14.3 拡張性

将来的に以下を追加できる構成にする。

* Artificial Analysis
* LM Arena
* Papers with Code
* llama.cpp関連情報
* LM Studio対応情報
* Reddit LocalLLaMAの手動キュレーション
* 週次レポート生成
* RSS配信

## 14.4 信頼性

* 各データに収集日時を付与する
* 各データに情報源を付与する
* スコアの意味を明示する
* 推定値は推定と分かるように表示する
* ライセンス情報は参考表示とし、最終確認は公式モデルカードへ誘導する

---

## 15. MVPスコープ

### 15.1 MVPで実装するもの

* Vite + React + TypeScriptの静的サイト
* GitHub Pages公開
* GitHub Actionsによる日次収集
* Hugging Faceモデル収集
* OpenRouterモデル収集
* 手動管理または限定的なOllama公開モデルカタログ
* JSONデータ生成
* モデル一覧ページ
* 急上昇モデルページ
* 新規モデルページ
* モデルファミリ集計
* Radar Score
* 最終更新日時表示
* 情報源リンク表示

### 15.2 MVPで実装しないもの

* ローカル環境読み取り
* ローカルベンチマーク
* Streamlit
* ログイン
* ユーザーごとの保存機能
* モデル自動実行
* 自動ダウンロード
* 高度な性能評価
* コメント機能
* 投稿機能

---

## 16. 画面一覧

| 画面             | 目的               |
| -------------- | ---------------- |
| Home           | 現在の注目モデルを俯瞰する    |
| Model Explorer | モデルを検索・比較する      |
| Rising Models  | 急上昇モデルを見る        |
| New Models     | 新規検出モデルを見る       |
| Family Trends  | モデルファミリ別の勢いを見る   |
| Model Detail   | 個別モデルの詳細を見る      |
| About          | データ収集方法とスコア説明を見る |

---

## 17. データスキーマ案

### 17.1 model item

```json
{
  "id": "Qwen/Qwen3-8B-GGUF",
  "display_name": "Qwen3 8B GGUF",
  "source": "huggingface",
  "sources": {
    "huggingface": "https://huggingface.co/Qwen/Qwen3-8B-GGUF",
    "ollama": null,
    "openrouter": null
  },
  "author": "Qwen",
  "model_family": "Qwen",
  "model_size": "8B",
  "quantization": "GGUF",
  "license": "apache-2.0",
  "downloads": 100000,
  "likes": 500,
  "last_modified": "2026-07-01T00:00:00Z",
  "first_seen_at": "2026-07-02T00:00:00Z",
  "last_seen_at": "2026-07-02T00:00:00Z",
  "has_gguf": true,
  "has_ollama": false,
  "context_length": null,
  "use_cases": ["General", "Multilingual"],
  "tags": ["gguf", "text-generation", "instruct"],
  "radar_score": 82.4,
  "is_new": true,
  "is_rising": false,
  "collected_at": "2026-07-02T00:00:00Z"
}
```

---

## 18. Radar Score仕様

### 18.1 スコアの目的

Radar Scoreは、モデルの性能ランキングではなく、公開情報から見た注目度を表す。

### 18.2 初期計算式

```text
Radar Score =
  popularity_score * 0.35
+ growth_score * 0.25
+ recency_score * 0.15
+ local_availability_score * 0.15
+ metadata_quality_score * 0.10
```

### 18.3 popularity_score

downloads、likes、Ollama pullsなどから算出する。

### 18.4 growth_score

前回収集時点との差分から算出する。

### 18.5 recency_score

初回検出日、最終更新日から算出する。

### 18.6 local_availability_score

以下を加点する。

* GGUF対応
* Ollama対応
* llama.cpp関連タグ
* 量子化モデル
* 小〜中規模モデルサイズ

### 18.7 metadata_quality_score

以下を加点する。

* ライセンスが明記されている
* モデルサイズが推定できる
* 用途タグがある
* モデルカードが存在する
* 情報源リンクがある

---

## 19. GitHub Actions設計

### 19.1 日次収集ワークフロー

```yaml
name: Collect model data

on:
  schedule:
    - cron: "0 21 * * *"
  workflow_dispatch:

jobs:
  collect:
    runs-on: ubuntu-latest

    permissions:
      contents: write

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"

      - name: Install Python dependencies
        run: pip install -r requirements.txt

      - name: Collect model data
        env:
          OPENROUTER_API_KEY: ${{ secrets.OPENROUTER_API_KEY }}
          HF_TOKEN: ${{ secrets.HF_TOKEN }}
        run: python scripts/collect_all.py

      - name: Commit updated data
        run: |
          git config user.name "github-actions"
          git config user.email "github-actions@github.com"
          git add data/
          git diff --cached --quiet || git commit -m "Update model data"
          git push
```

### 19.2 Pagesデプロイワークフロー

```yaml
name: Deploy GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "22"

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages

    steps:
      - uses: actions/deploy-pages@v4
```

---

## 20. 実装優先順位

### Phase 1: 公開ダッシュボード基盤

* Vite + React + TypeScript作成
* GitHub Pagesデプロイ設定
* Home画面作成
* JSON読み込み処理作成

### Phase 2: データ収集基盤

* Hugging Face Collector
* OpenRouter Collector
* データ正規化
* JSON出力
* GitHub Actions日次実行

### Phase 3: モデル探索UI

* Model Explorer
* フィルター
* ソート
* モデルカード
* 情報源リンク

### Phase 4: トレンド可視化

* Rising Models
* New Models
* Family Trends
* Radar Score
* 前回比の差分表示

### Phase 5: 信頼性・説明性

* Aboutページ
* スコア算出方法の説明
* データ収集元の説明
* 注意書き
* 最終更新日時表示

### Phase 6: 拡張

* Ollama公開カタログ連携
* Artificial Analysisの手動キュレーション
* LM Arenaリンク
* RSS出力
* 週次Markdownレポート

---

## 21. 成功基準

MVP時点で以下を満たせば成功とする。

* GitHub Pagesで公開されている
* 毎日GitHub Actionsでデータが更新される
* Hugging Face由来のローカルLLM候補が一覧表示される
* モデル名、作者、downloads、likes、更新日、GGUF有無が確認できる
* モデルファミリや用途で絞り込める
* 急上昇モデルが確認できる
* 新規検出モデルが確認できる
* Radar Scoreの意味が説明されている
* 各モデルの情報源リンクから一次情報に移動できる
* 第三者が見ても「今どのローカルLLMが注目されているか」が分かる

---

## 22. 注意書き

本ダッシュボードは、公開情報をもとにローカルLLM / open-weight LLMの動向を整理するものである。

Radar Scoreは性能の絶対評価ではない。
また、ライセンスや商用利用可否は参考情報として表示し、最終判断は各モデルの公式モデルカードやライセンス文書を確認する必要がある。

モデルの性能、ライセンス、配布形式、対応ツールは変わる可能性があるため、各モデルの詳細ページには必ず情報源リンクを表示する。
