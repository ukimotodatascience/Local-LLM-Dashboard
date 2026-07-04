import React from 'react';
import type { ModelItem } from '../types';
import { Download, Heart, TrendingUp } from 'lucide-react';

interface RisingModelsProps {
  models: ModelItem[] | null;
  onSelectModel: (model: ModelItem) => void;
}

export const RisingModels: React.FC<RisingModelsProps> = ({ models, onSelectModel }) => {
  if (!models) {
    return <div style={styles.loading}>Loading Rising Trends...</div>;
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.pageTitle}><span className="text-gradient">Rising</span> Models</h2>
        <p style={styles.pageSub}>
          直近でダウンロード数やLike数が急上昇し、コミュニティでの注目度が高まっているモデルの一覧です。
        </p>
      </div>

      {/* Models Grid */}
      <div className="dashboard-grid">
        {models.map((model, idx) => (
          <div
            key={model.id}
            onClick={() => onSelectModel(model)}
            style={styles.card}
            className="glass-panel"
          >
            {/* Top row */}
            <div style={styles.cardHeader}>
              <div style={styles.rankBadge}>
                RANK #{idx + 1}
              </div>
              <div style={styles.scoreBadge}>
                {model.radar_score}
              </div>
            </div>

            {/* Name & ID */}
            <h4 style={styles.cardTitle} title={model.display_name}>
              {model.display_name}
            </h4>
            <p style={styles.cardAuthor}>by {model.author}</p>

            {/* Meta */}
            <div style={styles.metaRow}>
              <span className="badge badge-purple">{model.model_family}</span>
              <span style={styles.sizeBadge}>{model.model_size}</span>
            </div>

            {/* Stats Footer */}
            <div style={styles.cardFooter}>
              <div style={styles.footerStat}>
                <Download size={14} color="var(--accent-secondary)" />
                <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                  {model.downloads.toLocaleString()}
                </span>
              </div>
              <div style={styles.footerStat}>
                <Heart size={14} color="#f472b6" />
                <span>{model.likes}</span>
              </div>
              <div style={styles.trendIndicator}>
                <TrendingUp size={14} style={{ marginRight: '4px' }} />
                <span>RISING</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {models.length === 0 && (
        <div style={styles.empty}>
          現在、急上昇判定を満たすモデルはありません。次回の自動収集をお待ちください。
        </div>
      )}
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
    marginBottom: '28px',
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
  card: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column' as const,
    cursor: 'pointer',
    height: '100%',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
  },
  rankBadge: {
    fontSize: '0.7rem',
    fontWeight: '700',
    color: '#06b6d4',
    background: 'rgba(6, 182, 212, 0.1)',
    border: '1px solid rgba(6, 182, 212, 0.2)',
    padding: '4px 8px',
    borderRadius: '6px',
    letterSpacing: '0.05em',
  },
  scoreBadge: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#fff',
    background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
    padding: '4px 8px',
    borderRadius: '6px',
  },
  cardTitle: {
    fontSize: '1.1rem',
    color: '#fff',
    fontWeight: '600',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  cardAuthor: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    marginTop: '2px',
    marginBottom: '14px',
  },
  metaRow: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
    marginBottom: '16px',
    marginTop: 'auto',
  },
  sizeBadge: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    marginLeft: 'auto',
    fontWeight: '600',
    background: 'rgba(255, 255, 255, 0.03)',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  cardFooter: {
    display: 'flex',
    gap: '12px',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '12px',
    alignItems: 'center',
    color: 'var(--text-muted)',
    fontSize: '0.8rem',
  },
  footerStat: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  trendIndicator: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    color: '#06b6d4',
    fontSize: '0.75rem',
    fontWeight: '700',
    letterSpacing: '0.05em',
  },
  empty: {
    padding: '48px',
    textAlign: 'center' as const,
    color: 'var(--text-muted)',
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    borderRadius: '12px',
  }
};
