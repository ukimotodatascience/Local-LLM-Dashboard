import React from 'react';
import type { ModelItem } from '../types';
import { Download, Heart, Sparkles, Calendar } from 'lucide-react';

interface NewModelsProps {
  models: ModelItem[] | null;
  onSelectModel: (model: ModelItem) => void;
}

export const NewModels: React.FC<NewModelsProps> = ({ models, onSelectModel }) => {
  if (!models) {
    return <div style={styles.loading}>Loading New Releases...</div>;
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Unknown';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.pageTitle}><span className="text-gradient">New</span> Releases</h2>
        <p style={styles.pageSub}>
          過去7日以内にデータベースに新しく検出・登録されたモデルの一覧です。
        </p>
      </div>

      {/* Models Grid */}
      <div className="dashboard-grid">
        {models.map((model) => (
          <div
            key={model.id}
            onClick={() => onSelectModel(model)}
            style={styles.card}
            className="glass-panel"
          >
            {/* Top row */}
            <div style={styles.cardHeader}>
              <div style={styles.newBadge}>
                <Sparkles size={12} style={{ marginRight: '4px' }} /> NEW RELEASE
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
                <Download size={14} />
                <span>{(model.downloads / 1000).toFixed(0)}k</span>
              </div>
              <div style={styles.footerStat}>
                <Heart size={14} />
                <span>{model.likes}</span>
              </div>
              <div style={styles.dateLabel}>
                <Calendar size={12} style={{ marginRight: '4px' }} />
                <span>{formatDate(model.first_seen_at)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {models.length === 0 && (
        <div style={styles.empty}>
          直近7日間で新しく追加されたモデルはありません。
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
  newBadge: {
    fontSize: '0.7rem',
    fontWeight: '700',
    color: '#a78bfa',
    background: 'rgba(167, 139, 250, 0.1)',
    border: '1px solid rgba(167, 139, 250, 0.2)',
    padding: '4px 8px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
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
  dateLabel: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.75rem',
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
