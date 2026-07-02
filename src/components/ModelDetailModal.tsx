import React from 'react';
import { X, ExternalLink, Calendar, Download, Heart, Shield, Layers, Cpu, Globe, MessageSquare } from 'lucide-react';
import type { ModelItem } from '../types';

interface ModelDetailModalProps {
  model: ModelItem | null;
  onClose: () => void;
}

export const ModelDetailModal: React.FC<ModelDetailModalProps> = ({ model, onClose }) => {
  if (!model) return null;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Unknown';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()} className="glass-panel">
        {/* Header */}
        <div style={styles.header}>
          <div>
            <span className="badge badge-purple" style={{ marginBottom: '8px' }}>
              {model.model_family}
            </span>
            <h2 style={styles.title}>{model.display_name}</h2>
            <p style={styles.author}>by {model.author}</p>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Content Grid */}
        <div style={styles.contentGrid}>
          {/* Main Info */}
          <div style={styles.leftCol}>
            {model.description && (
              <div style={styles.section}>
                <h4 style={styles.sectionTitle}>
                  <MessageSquare size={16} /> Description
                </h4>
                <p style={styles.descriptionText}>{model.description}</p>
              </div>
            )}

            <div style={styles.section}>
              <h4 style={styles.sectionTitle}>
                <Layers size={16} /> Details
              </h4>
              <div style={styles.detailsGrid}>
                <div style={styles.detailCard}>
                  <span style={styles.detailLabel}>Model ID</span>
                  <span style={styles.detailValue} title={model.id}>{model.id}</span>
                </div>
                <div style={styles.detailCard}>
                  <span style={styles.detailLabel}>Size</span>
                  <span style={styles.detailValue}>{model.model_size}</span>
                </div>
                <div style={styles.detailCard}>
                  <span style={styles.detailLabel}>Quantization</span>
                  <span style={styles.detailValue}>{model.quantization}</span>
                </div>
                <div style={styles.detailCard}>
                  <span style={styles.detailLabel}>License</span>
                  <span style={styles.detailValue}>{model.license}</span>
                </div>
              </div>
            </div>

            {/* Context & API Pricing if available */}
            {(model.context_length || model.pricing) && (
              <div style={styles.section}>
                <h4 style={styles.sectionTitle}>
                  <Cpu size={16} /> API Availability & Context
                </h4>
                <div style={styles.detailsGrid}>
                  {model.context_length && (
                    <div style={styles.detailCard}>
                      <span style={styles.detailLabel}>Context Length</span>
                      <span style={styles.detailValue}>
                        {(model.context_length / 1000).toFixed(0)}k tokens
                      </span>
                    </div>
                  )}
                  {model.pricing && (
                    <div style={styles.detailCard}>
                      <span style={styles.detailLabel}>Pricing (1M tokens)</span>
                      <span style={{ ...styles.detailValue, fontSize: '0.85rem' }}>
                        Input: ${parseFloat(model.pricing.prompt) * 1000000} <br />
                        Output: ${parseFloat(model.pricing.completion) * 1000000}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tags */}
            <div style={styles.section}>
              <h4 style={styles.sectionTitle}>
                <Globe size={16} /> Use Cases & Tags
              </h4>
              <div style={styles.tagContainer}>
                {model.use_cases.map((uc) => (
                  <span key={uc} className="badge badge-cyan" style={styles.tagBadge}>
                    {uc}
                  </span>
                ))}
              </div>
              <div style={styles.smallTags}>
                {model.tags.slice(0, 15).map((t) => (
                  <span key={t} style={styles.tag}>
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar / Stats */}
          <div style={styles.rightCol}>
            {/* Score Box */}
            <div style={styles.scoreBox} className="glow-animation">
              <span style={styles.scoreLabel}>Radar Score</span>
              <span style={styles.scoreValue}>{model.radar_score}</span>
              <p style={styles.scoreSub}>ローカル実行・注目度指標</p>
            </div>

            {/* Stats list */}
            <div style={styles.statList}>
              <div style={styles.statItem}>
                <div style={styles.statIcon}><Download size={18} /></div>
                <div>
                  <div style={styles.statVal}>{model.downloads.toLocaleString()}</div>
                  <div style={styles.statLbl}>Downloads</div>
                </div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statIcon}><Heart size={18} /></div>
                <div>
                  <div style={styles.statVal}>{model.likes.toLocaleString()}</div>
                  <div style={styles.statLbl}>Likes</div>
                </div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statIcon}><Calendar size={18} /></div>
                <div>
                  <div style={styles.statVal}>{formatDate(model.last_modified)}</div>
                  <div style={styles.statLbl}>Last Modified</div>
                </div>
              </div>
            </div>

            {/* Links */}
            <div style={styles.linksSection}>
              <h4 style={styles.linksTitle}>External Links</h4>
              {model.sources.huggingface && (
                <a
                  href={model.sources.huggingface}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.linkButton}
                  className="btn-primary"
                >
                  Hugging Face Model <ExternalLink size={14} />
                </a>
              )}
              {model.sources.ollama && (
                <a
                  href={model.sources.ollama}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ ...styles.linkButton, ...styles.ollamaBtn }}
                  className="btn-secondary"
                >
                  Ollama Library <ExternalLink size={14} />
                </a>
              )}
              {model.sources.openrouter && (
                <a
                  href={model.sources.openrouter}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.linkButton}
                  className="btn-secondary"
                >
                  OpenRouter API <ExternalLink size={14} />
                </a>
              )}
            </div>

            {/* License Note */}
            <div style={styles.licenseNote}>
              <Shield size={14} style={{ marginRight: '6px', flexShrink: 0 }} />
              <span>
                ライセンス（<strong>{model.license}</strong>）は参考情報です。商用利用などの最終判断は、公式モデルカード等をご確認ください。
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(3, 5, 10, 0.85)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    width: '100%',
    maxWidth: '960px',
    maxHeight: '90vh',
    overflowY: 'auto' as const,
    padding: '32px',
    display: 'flex',
    flexDirection: 'column' as const,
    position: 'relative' as const,
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    paddingBottom: '20px',
    marginBottom: '24px',
  },
  title: {
    fontSize: '1.8rem',
    color: '#fff',
    fontWeight: '700',
    lineHeight: 1.2,
  },
  author: {
    fontSize: '0.95rem',
    color: 'var(--text-secondary)',
    marginTop: '4px',
  },
  closeBtn: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: 'none',
    color: 'var(--text-secondary)',
    padding: '8px',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    ':hover': {
      background: 'rgba(255, 255, 255, 0.1)',
      color: '#fff',
    }
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 300px',
    gap: 32,
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
    }
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 28,
  },
  rightCol: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 24,
  },
  section: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 12,
  },
  sectionTitle: {
    fontSize: '1rem',
    color: '#fff',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '6px',
  },
  descriptionText: {
    fontSize: '0.95rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: 16,
  },
  detailCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    padding: '12px 16px',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 4,
  },
  detailLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  detailValue: {
    fontSize: '0.95rem',
    color: '#fff',
    fontWeight: '500',
    wordBreak: 'break-all' as const,
  },
  tagContainer: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  tagBadge: {
    fontSize: '0.8rem',
    padding: '6px 12px',
  },
  smallTags: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 6,
    marginTop: '6px',
  },
  tag: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  scoreBox: {
    background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
    border: '1px solid rgba(124, 58, 237, 0.3)',
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center' as const,
    boxShadow: '0 0 15px rgba(124, 58, 237, 0.1)',
  },
  scoreLabel: {
    fontSize: '0.8rem',
    color: '#c084fc',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    fontWeight: '600',
  },
  scoreValue: {
    fontSize: '3.2rem',
    color: '#fff',
    fontWeight: '800',
    margin: '8px 0',
    fontFamily: 'var(--font-display)',
    lineHeight: 1,
  },
  scoreSub: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
  },
  statList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 16,
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    borderRadius: '12px',
    padding: '16px',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  statIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.03)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-secondary)',
  },
  statVal: {
    fontSize: '1rem',
    color: '#fff',
    fontWeight: '600',
  },
  statLbl: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  linksSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 10,
  },
  linksTitle: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    fontWeight: '600',
  },
  linkButton: {
    width: '100%',
    justifyContent: 'center',
    padding: '12px',
    textDecoration: 'none',
    fontSize: '0.9rem',
  },
  ollamaBtn: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  licenseNote: {
    display: 'flex',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
    background: 'rgba(239, 68, 68, 0.03)',
    border: '1px solid rgba(239, 68, 68, 0.1)',
    padding: '12px',
    borderRadius: '8px',
  }
};
