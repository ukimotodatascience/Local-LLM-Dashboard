import React, { useMemo } from 'react';
import type { FamilyTrendItem } from '../types';
import { Cpu, Download, Heart, Sparkles, TrendingUp } from 'lucide-react';

interface FamilyTrendsProps {
  trends: FamilyTrendItem[] | null;
}

export const FamilyTrends: React.FC<FamilyTrendsProps> = ({ trends }) => {
  if (!trends) {
    return <div style={styles.loading}>Loading Family Trends...</div>;
  }

  // Find max values for visualization bars
  const maxDownloads = useMemo(() => {
    return Math.max(...trends.map((t) => t.total_downloads), 1);
  }, [trends]);

  const maxModelCount = useMemo(() => {
    return Math.max(...trends.map((t) => t.model_count), 1);
  }, [trends]);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.pageTitle}>Family <span className="text-gradient">Trends</span></h2>
        <p style={styles.pageSub}>
          モデルファミリー（Qwen, Llama, Gemma等）ごとの登録モデル数やコミュニティでの人気度の勢力図です。
        </p>
      </div>

      {/* Grid of family cards */}
      <div style={styles.grid}>
        {trends.map((trend) => {
          const downloadPercentage = (trend.total_downloads / maxDownloads) * 100;
          const countPercentage = (trend.model_count / maxModelCount) * 100;

          return (
            <div key={trend.family} style={styles.card} className="glass-panel">
              {/* Title & Average Score */}
              <div style={styles.cardHeader}>
                <h3 style={styles.familyTitle}>{trend.family}</h3>
                <div style={styles.scoreBadge} className="glow-animation">
                  <span style={styles.scoreLabel}>AVG RADAR</span>
                  <span style={styles.scoreVal}>{trend.avg_radar_score}</span>
                </div>
              </div>

              {/* Stats Rows */}
              <div className="family-trends-grid">
                {/* Models Count */}
                <div style={styles.statBox}>
                  <div style={styles.statHeader}>
                    <Cpu size={16} color="#a78bfa" />
                    <span style={styles.statName}>Models Count</span>
                    <span style={styles.statValue}>{trend.model_count}</span>
                  </div>
                  <div style={styles.progressBarBg}>
                    <div
                      style={{
                        ...styles.progressBarFill,
                        width: `${countPercentage}%`,
                        background: 'linear-gradient(90deg, #7c3aed, #a78bfa)'
                      }}
                    />
                  </div>
                </div>

                {/* Downloads */}
                <div style={styles.statBox}>
                  <div style={styles.statHeader}>
                    <Download size={16} color="#06b6d4" />
                    <span style={styles.statName}>Downloads</span>
                    <span style={styles.statValue}>{trend.total_downloads.toLocaleString()}</span>
                  </div>
                  <div style={styles.progressBarBg}>
                    <div
                      style={{
                        ...styles.progressBarFill,
                        width: `${downloadPercentage}%`,
                        background: 'linear-gradient(90deg, #06b6d4, #22d3ee)'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Mini Tags */}
              <div style={styles.tagsRow}>
                {trend.rising_model_count > 0 && (
                  <div style={{ ...styles.miniTag, background: 'rgba(6, 182, 212, 0.1)', color: '#67e8f9', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                    <TrendingUp size={12} style={{ marginRight: '4px' }} />
                    <span>{trend.rising_model_count} Rising</span>
                  </div>
                )}
                {trend.new_model_count > 0 && (
                  <div style={{ ...styles.miniTag, background: 'rgba(167, 139, 250, 0.1)', color: '#c084fc', border: '1px solid rgba(167, 139, 250, 0.2)' }}>
                    <Sparkles size={12} style={{ marginRight: '4px' }} />
                    <span>{trend.new_model_count} New</span>
                  </div>
                )}
                <div style={{ ...styles.miniTag, background: 'rgba(244, 114, 182, 0.08)', color: '#f472b6', border: '1px solid rgba(244, 114, 182, 0.15)' }}>
                  <Heart size={12} style={{ marginRight: '4px' }} />
                  <span>{trend.total_likes.toLocaleString()} Likes</span>
                </div>
              </div>
            </div>
          );
        })}
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
  grid: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
    marginTop: '20px',
  },
  card: {
    padding: '24px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '12px',
  },
  familyTitle: {
    fontSize: '1.4rem',
    color: '#fff',
    fontWeight: '700',
  },
  scoreBadge: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    background: 'rgba(124, 58, 237, 0.1)',
    border: '1px solid rgba(124, 58, 237, 0.3)',
    borderRadius: '10px',
    padding: '8px 16px',
    minWidth: '100px',
  },
  scoreLabel: {
    fontSize: '0.65rem',
    color: '#c084fc',
    fontWeight: '600',
    letterSpacing: '0.05em',
  },
  scoreVal: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: '#fff',
    fontFamily: 'var(--font-display)',
    marginTop: '2px',
  },

  statBox: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  statHeader: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.85rem',
  },
  statName: {
    color: 'var(--text-secondary)',
    marginLeft: '8px',
    fontWeight: '500',
  },
  statValue: {
    color: '#fff',
    marginLeft: 'auto',
    fontWeight: '700',
  },
  progressBarBg: {
    width: '100%',
    height: '6px',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '9999px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '9999px',
    transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  tagsRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '10px',
  },
  miniTag: {
    display: 'flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '600',
  }
};
