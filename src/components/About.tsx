import React from 'react';
import { Shield, BookOpen, Layers, Cpu, CheckCircle } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.pageTitle}>About <span className="text-gradient">Radar</span></h2>
        <p style={styles.pageSub}>
          Local-LLM-Dashboard (LLM Radar) の目的、仕組み、および Radar Score について解説します。
        </p>
      </div>

      {/* Intro section */}
      <section style={styles.section} className="glass-panel">
        <h3 style={styles.sectionTitle}>
          <BookOpen size={20} color="#a78bfa" style={{ marginRight: '8px' }} />
          プロジェクトの目的
        </h3>
        <p style={styles.text}>
          Local-LLM-Dashboard は、ローカル実行可能あるいは open-weight で提供されている最新の大規模言語モデル（LLM）の動向を俯瞰するための公開ダッシュボードです。
          <br /><br />
          現在、Hugging FaceやOllama、OpenRouterなどの様々なプラットフォームで日々新しいモデルがリリースされています。本プロジェクトは、これらのプラットフォームの公開情報（ダウンロード数、Like数、タグ、更新日等）を集約し、<strong>「今どのモデルが注目されているのか」「どれがローカル環境で試しやすいのか」</strong>を直感的に発見できるようにすることを目指しています。
        </p>
      </section>

      {/* Radar Score Explanation */}
      <section style={styles.section} className="glass-panel">
        <h3 style={styles.sectionTitle}>
          <Cpu size={20} color="#06b6d4" style={{ marginRight: '8px' }} />
          Radar Score 仕様
        </h3>
        <p style={{ ...styles.text, marginBottom: '16px' }}>
          <strong>Radar Score</strong> は、モデル単体のベンチマーク性能ではなく、<strong>「注目度」「コミュニティでの人気」「ローカル環境での扱いやすさ」</strong>を総合的に評価した独自の指標（最大100点）です。以下の5つの要素から計算されます。
        </p>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>評価項目</th>
                <th style={styles.th}>比重</th>
                <th style={styles.th}>算出内容</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={styles.td}><strong>Popularity (人気度)</strong></td>
                <td style={styles.td}>35%</td>
                <td style={styles.td}>Hugging Face等でのダウンロード数およびLike数の対数スケール。規模に応じた評価。</td>
              </tr>
              <tr>
                <td style={styles.td}><strong>Growth (成長率)</strong></td>
                <td style={styles.td}>25%</td>
                <td style={styles.td}>前回データ収集時からのダウンロード数・Like数の増加率。トレンドを検知。</td>
              </tr>
              <tr>
                <td style={styles.td}><strong>Recency (新しさ)</strong></td>
                <td style={styles.td}>15%</td>
                <td style={styles.td}>最終更新日からの経過日数。30日以内であれば満点（100点）とし、日数の経過で減点。</td>
              </tr>
              <tr>
                <td style={styles.td}><strong>Local Availability (扱いやすさ)</strong></td>
                <td style={styles.td}>15%</td>
                <td style={styles.td}>GGUF形式の有無（+50点）、Ollamaライブラリ登録状況（+50点）の加算。</td>
              </tr>
              <tr>
                <td style={styles.td}><strong>Metadata Quality (情報の質)</strong></td>
                <td style={styles.td}>10%</td>
                <td style={styles.td}>ライセンスの明記、モデルサイズ推定可能、用途タグ登録などのメタデータの充実度。</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Data Sources */}
      <section style={styles.section} className="glass-panel">
        <h3 style={styles.sectionTitle}>
          <Layers size={20} color="#10b981" style={{ marginRight: '8px' }} />
          データ収集元について
        </h3>
        <ul style={styles.list}>
          <li style={styles.listItem}>
            <CheckCircle size={16} color="#10b981" style={{ marginRight: '8px', flexShrink: 0 }} />
            <span><strong>Hugging Face API</strong>: モデルID、ダウンロード数、Like数、更新日時、ライセンス、GGUFタグ等のコア情報を毎日取得。</span>
          </li>
          <li style={styles.listItem}>
            <CheckCircle size={16} color="#10b981" style={{ marginRight: '8px', flexShrink: 0 }} />
            <span><strong>OpenRouter API</strong>: API提供状況、コンテキスト長、価格情報、アーキテクチャ名を取得して詳細画面にマージ。</span>
          </li>
          <li style={styles.listItem}>
            <CheckCircle size={16} color="#10b981" style={{ marginRight: '8px', flexShrink: 0 }} />
            <span><strong>Ollama Library Catalog</strong>: Ollamaで容易に取得・実行できるモデル（`llama3`, `qwen2.5`等）のカタログ情報とマッピング。</span>
          </li>
        </ul>
      </section>

      {/* Disclaimer */}
      <section style={{ ...styles.section, ...styles.disclaimerSec }} className="glass-panel">
        <h3 style={{ ...styles.sectionTitle, color: '#ef4444' }}>
          <Shield size={20} color="#ef4444" style={{ marginRight: '8px' }} />
          免責事項・注意事項
        </h3>
        <p style={styles.text}>
          本ダッシュボードに掲載されているデータは、各APIから自動収集された公開情報に基づいています。
          <br /><br />
          特に<strong>ライセンス情報（商用利用の可否等）やサイズ、用途タグ</strong>は、モデルIDやタグからの推測値が含まれています。これらの正確性・安全性を当サイトが保証するものではありません。ビジネスや本番環境で利用される際は、必ず各モデル詳細に提示されている<strong>公式リンク（Hugging Face等）の一次ドキュメントを確認</strong>してください。
        </p>
      </section>
    </div>
  );
};

const styles = {
  container: {
    padding: '8px 0',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
  },
  header: {
    marginBottom: '8px',
  },
  pageTitle: {
    fontSize: '2.2rem',
    fontWeight: '800',
    color: '#fff',
    marginBottom: '8px',
  },
  pageSub: {
    fontSize: '1rem',
    color: 'var(--text-secondary)',
  },
  section: {
    padding: '28px',
  },
  sectionTitle: {
    fontSize: '1.2rem',
    color: '#fff',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '8px',
  },
  text: {
    fontSize: '0.95rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.7',
  },
  tableWrapper: {
    overflowX: 'auto' as const,
    marginTop: '16px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    textAlign: 'left' as const,
  },
  th: {
    padding: '12px 16px',
    background: 'rgba(255, 255, 255, 0.02)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    color: '#fff',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  td: {
    padding: '14px 16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    verticalAlign: 'top',
  },
  list: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  listItem: {
    display: 'flex',
    alignItems: 'flex-start',
    fontSize: '0.95rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
  },
  disclaimerSec: {
    borderLeft: '4px solid #ef4444',
    background: 'rgba(239, 68, 68, 0.02)',
  }
};
