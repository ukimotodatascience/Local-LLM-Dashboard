import React from 'react';
import type { ModelItem, SummaryData } from '../types';
import { Download, Heart, TrendingUp, Sparkles, Cpu, ChevronRight } from 'lucide-react';

interface HomeProps {
  summary: SummaryData | null;
  onSelectModel: (model: ModelItem) => void;
  setActivePage: (page: string) => void;
}

export const Home: React.FC<HomeProps> = ({ summary, onSelectModel, setActivePage }) => {
  if (!summary) {
    return <div style={styles.loading}>Loading Dashboard Data...</div>;
  }

  return (
    <div style={styles.container}>
      {/* Welcome Banner */}
      <header style={styles.header}>
        <h2 style={styles.welcomeTitle}>Discover The Best <span className="text-gradient">Local LLMs</span></h2>
        <p style={styles.welcomeSub}>
          ローカル環境で動作する open-weight モデルの最新ダウンロード動向、Ollama・GGUFの対応状況、注目度スコアを可視化する公開レーダーです。
        </p>
      </header>

      {/* Stats Summary Panel */}
      <section style={styles.statsPanel}>
        <div style={styles.statCard} className="glass-panel">
          <div style={styles.statIcon}><Cpu size={24} color="#a78bfa" /></div>
          <div>
            <div style={styles.statVal}>{summary.total_models}</div>
            <div style={styles.statLabel}>Total Models Tracked</div>
          </div>
        </div>
        <div style={styles.statCard} className="glass-panel">
          <div style={styles.statIcon}><Download size={24} color="#22d3ee" /></div>
          <div>
            <div style={styles.statVal}>{summary.total_downloads.toLocaleString()}</div>
            <div style={styles.statLabel}>Combined Downloads</div>
          </div>
        </div>
        <div style={styles.statCard} className="glass-panel">
          <div style={styles.statIcon}><Heart size={24} color="#f472b6" /></div>
          <div>
            <div style={styles.statVal}>{summary.total_likes.toLocaleString()}</div>
            <div style={styles.statLabel}>Accumulated Likes</div>
          </div>
        </div>
      </section>

      {/* Main Highlights Grid */}
      <div style={styles.grid}>
        {/* Left Column: Top Radar Models */}
        <section style={styles.mainCol}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>
              <Cpu size={20} color="#a78bfa" style={{ marginRight: '8px' }} />
              Top Radar Score Models
            </h3>
            <button style={styles.viewAllBtn} onClick={() => setActivePage('explorer')}>
              Explore all <ChevronRight size={16} />
            </button>
          </div>
          <div style={styles.list}>
            {summary.top_radar_models.slice(0, 3).map((model, idx) => (
              <div
                key={model.id}
                onClick={() => onSelectModel(model)}
                style={styles.heroCard}
                className="glass-panel"
              >
                <div style={styles.heroRank}>#{idx + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span className="badge badge-purple">{model.model_family}</span>
                    {model.has_gguf && <span className="badge badge-cyan">GGUF</span>}
                  </div>
                  <h4 style={styles.heroName}>{model.display_name}</h4>
                  <p style={styles.heroAuthor}>by {model.author}</p>
                </div>
                <div style={styles.heroScoreWrapper}>
                  <span style={styles.heroScoreLabel}>Radar Score</span>
                  <span style={styles.heroScoreVal}>{model.radar_score}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right Column: Mini Widgets (Rising & New) */}
        <aside style={styles.sideCol}>
          {/* Rising Widget */}
          <div style={styles.widget} className="glass-panel">
            <div style={styles.widgetHeader}>
              <h4 style={styles.widgetTitle}>
                <TrendingUp size={18} color="#06b6d4" style={{ marginRight: '6px' }} />
                Rising Trends
              </h4>
              <button style={styles.widgetLink} onClick={() => setActivePage('rising')}>View</button>
            </div>
            <div style={styles.widgetList}>
              {summary.top_rising_models.slice(0, 3).map((model) => (
                <div key={model.id} onClick={() => onSelectModel(model)} style={styles.widgetItem}>
                  <div>
                    <div style={styles.widgetItemName}>{model.display_name}</div>
                    <div style={styles.widgetItemSub}>{model.model_family} • {model.model_size}</div>
                  </div>
                  <span style={styles.widgetItemScore}>{model.radar_score}</span>
                </div>
              ))}
            </div>
          </div>

          {/* New Releases Widget */}
          <div style={styles.widget} className="glass-panel">
            <div style={styles.widgetHeader}>
              <h4 style={styles.widgetTitle}>
                <Sparkles size={18} color="#a78bfa" style={{ marginRight: '6px' }} />
                New Releases
              </h4>
              <button style={styles.widgetLink} onClick={() => setActivePage('new')}>View</button>
            </div>
            <div style={styles.widgetList}>
              {summary.top_new_models.slice(0, 3).map((model) => (
                <div key={model.id} onClick={() => onSelectModel(model)} style={styles.widgetItem}>
                  <div>
                    <div style={styles.widgetItemName}>{model.display_name}</div>
                    <div style={styles.widgetItemSub}>{model.model_family} • {model.model_size}</div>
                  </div>
                  <span style={{ ...styles.widgetItemScore, color: '#a78bfa' }}>NEW</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '8px 0',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '60vh',
    fontSize: '1.2rem',
    color: 'var(--text-secondary)',
  },
  header: {
    marginBottom: '32px',
  },
  welcomeTitle: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#fff',
    marginBottom: '12px',
  },
  welcomeSub: {
    fontSize: '1.05rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    maxWidth: '800px',
  },
  statsPanel: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
    marginBottom: '36px',
  },
  statCard: {
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statVal: {
    fontSize: '1.6rem',
    fontWeight: '700',
    color: '#fff',
    lineHeight: '1.2',
  },
  statLabel: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    marginTop: '2px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 320px',
    gap: '28px',
    '@media (max-width: 960px)': {
      gridTemplateColumns: '1fr',
    }
  },
  mainCol: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  sideCol: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
  },
  viewAllBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--accent-secondary)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  list: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  heroCard: {
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    cursor: 'pointer',
    position: 'relative' as const,
  },
  heroRank: {
    fontSize: '2rem',
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.08)',
    fontFamily: 'var(--font-display)',
    width: '40px',
  },
  heroName: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#fff',
    marginTop: '6px',
  },
  heroAuthor: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
  },
  heroScoreWrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-end',
  },
  heroScoreLabel: {
    fontSize: '0.7rem',
    color: '#c084fc',
    textTransform: 'uppercase' as const,
    fontWeight: '600',
  },
  heroScoreVal: {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: '#fff',
    fontFamily: 'var(--font-display)',
  },
  widget: {
    padding: '20px',
  },
  widgetHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '10px',
    marginBottom: '14px',
  },
  widgetTitle: {
    fontSize: '0.95rem',
    color: '#fff',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
  },
  widgetLink: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '0.75rem',
    cursor: 'pointer',
    ':hover': {
      color: '#fff',
    }
  },
  widgetList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  widgetItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 10px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background 0.2s',
    ':hover': {
      background: 'rgba(255, 255, 255, 0.02)',
    }
  },
  widgetItemName: {
    fontSize: '0.85rem',
    color: '#fff',
    fontWeight: '600',
    maxWidth: '180px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  widgetItemSub: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    marginTop: '2px',
  },
  widgetItemScore: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#06b6d4',
  }
};
