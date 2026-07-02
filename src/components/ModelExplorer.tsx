import React, { useState, useMemo } from 'react';
import type { ModelItem } from '../types';
import { Search, ArrowUpDown, Download, Heart } from 'lucide-react';

interface ModelExplorerProps {
  models: ModelItem[] | null;
  onSelectModel: (model: ModelItem) => void;
}

export const ModelExplorer: React.FC<ModelExplorerProps> = ({ models, onSelectModel }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFamily, setSelectedFamily] = useState('All');
  const [selectedSize, setSelectedSize] = useState('All');
  const [selectedUseCase, setSelectedUseCase] = useState('All');
  const [selectedFormat, setSelectedFormat] = useState('All'); // All, GGUF, Ollama, Both
  const [sortBy, setSortBy] = useState('radar_score'); // radar_score, downloads, likes, last_modified
  const [displayLimit, setDisplayLimit] = useState(30);

  // Filter Categories
  const families = ['All', 'Llama', 'Qwen', 'Gemma', 'DeepSeek', 'Mistral', 'Phi', 'SmolLM', 'Other'];
  const useCases = ['All', 'General', 'Coding', 'Japanese', 'Reasoning', 'RAG', 'Lightweight', 'Vision', 'MoE'];
  const sizes = ['All', '0.1B-3B', '4B-9B', '10B-20B', '21B-72B', '73B+'];

  // Size filtering logic
  const parseSizeNum = (sizeStr: string): number => {
    try {
      const match = sizeStr.match(/(\d+(?:\.\d+)?)/);
      if (match) return parseFloat(match[1]);
    } catch {}
    return 0;
  };

  const filteredAndSortedModels = useMemo(() => {
    if (!models) return [];

    let result = [...models];

    // 1. Search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (m) =>
          m.id.toLowerCase().includes(term) ||
          m.display_name.toLowerCase().includes(term) ||
          m.author.toLowerCase().includes(term)
      );
    }

    // 2. Family filter
    if (selectedFamily !== 'All') {
      result = result.filter((m) => m.model_family === selectedFamily);
    }

    // 3. Use Case filter
    if (selectedUseCase !== 'All') {
      result = result.filter((m) => m.use_cases.includes(selectedUseCase));
    }

    // 4. Format filter
    if (selectedFormat === 'GGUF') {
      result = result.filter((m) => m.has_gguf);
    } else if (selectedFormat === 'Ollama') {
      result = result.filter((m) => m.has_ollama);
    } else if (selectedFormat === 'Both') {
      result = result.filter((m) => m.has_gguf && m.has_ollama);
    }

    // 5. Size range filter
    if (selectedSize !== 'All') {
      result = result.filter((m) => {
        const num = parseSizeNum(m.model_size);
        if (num === 0) return false;
        
        if (selectedSize === '0.1B-3B') return num >= 0.1 && num <= 3.9;
        if (selectedSize === '4B-9B') return num >= 4.0 && num <= 9.9;
        if (selectedSize === '10B-20B') return num >= 10.0 && num <= 20.9;
        if (selectedSize === '21B-72B') return num >= 21.0 && num <= 72.9;
        if (selectedSize === '73B+') return num >= 73.0;
        return true;
      });
    }

    // 6. Sorting
    result.sort((a, b) => {
      if (sortBy === 'downloads') return b.downloads - a.downloads;
      if (sortBy === 'likes') return b.likes - a.likes;
      if (sortBy === 'last_modified') {
        const dateA = a.last_modified ? new Date(a.last_modified).getTime() : 0;
        const dateB = b.last_modified ? new Date(b.last_modified).getTime() : 0;
        return dateB - dateA;
      }
      return b.radar_score - a.radar_score; // Default: radar_score
    });

    return result;
  }, [models, searchTerm, selectedFamily, selectedUseCase, selectedFormat, selectedSize, sortBy]);

  const displayedModels = useMemo(() => {
    return filteredAndSortedModels.slice(0, displayLimit);
  }, [filteredAndSortedModels, displayLimit]);

  if (!models) {
    return <div style={styles.loading}>Loading Models Catalog...</div>;
  }

  return (
    <div style={styles.container}>
      {/* Page Header */}
      <div style={styles.header}>
        <h2 style={styles.pageTitle}>Model <span className="text-gradient">Explorer</span></h2>
        <p style={styles.pageSub}>
          データベースに登録されている全モデルを検索・比較できます。
        </p>
      </div>

      {/* Control Panel (Search, Filter, Sort) */}
      <div style={styles.controlPanel} className="glass-panel">
        {/* Search */}
        <div style={styles.searchRow}>
          <div style={styles.searchWrapper}>
            <Search size={18} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by ID, Author, Name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setDisplayLimit(30);
              }}
              style={styles.searchInput}
            />
          </div>
          
          <div style={styles.sortWrapper}>
            <ArrowUpDown size={16} style={{ color: 'var(--text-muted)' }} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={styles.select}
            >
              <option value="radar_score">Sort: Radar Score</option>
              <option value="downloads">Sort: Downloads</option>
              <option value="likes">Sort: Likes</option>
              <option value="last_modified">Sort: Recently Updated</option>
            </select>
          </div>
        </div>

        {/* Filters */}
        <div style={styles.filterGrid}>
          {/* Family */}
          <div style={styles.filterGroup}>
            <span style={styles.filterLabel}>Family</span>
            <select
              value={selectedFamily}
              onChange={(e) => {
                setSelectedFamily(e.target.value);
                setDisplayLimit(30);
              }}
              style={styles.select}
            >
              {families.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {/* Size */}
          <div style={styles.filterGroup}>
            <span style={styles.filterLabel}>Model Size</span>
            <select
              value={selectedSize}
              onChange={(e) => {
                setSelectedSize(e.target.value);
                setDisplayLimit(30);
              }}
              style={styles.select}
            >
              {sizes.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Use Case */}
          <div style={styles.filterGroup}>
            <span style={styles.filterLabel}>Use Case</span>
            <select
              value={selectedUseCase}
              onChange={(e) => {
                setSelectedUseCase(e.target.value);
                setDisplayLimit(30);
              }}
              style={styles.select}
            >
              {useCases.map((uc) => (
                <option key={uc} value={uc}>{uc}</option>
              ))}
            </select>
          </div>

          {/* Format / Availability */}
          <div style={styles.filterGroup}>
            <span style={styles.filterLabel}>Format</span>
            <select
              value={selectedFormat}
              onChange={(e) => {
                setSelectedFormat(e.target.value);
                setDisplayLimit(30);
              }}
              style={styles.select}
            >
              <option value="All">All Formats</option>
              <option value="GGUF">GGUF Only</option>
              <option value="Ollama">Ollama Only</option>
              <option value="Both">Both GGUF & Ollama</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Meta info */}
      <div style={styles.metaRow}>
        <span>Found <strong>{filteredAndSortedModels.length}</strong> matching models</span>
      </div>

      {/* Models Grid */}
      <div className="dashboard-grid">
        {displayedModels.map((model) => (
          <div
            key={model.id}
            onClick={() => onSelectModel(model)}
            style={styles.card}
            className="glass-panel"
          >
            {/* Top row */}
            <div style={styles.cardHeader}>
              <span className="badge badge-purple">{model.model_family}</span>
              <div style={styles.scoreBadge}>
                {model.radar_score}
              </div>
            </div>

            {/* Name & ID */}
            <h4 style={styles.cardTitle} title={model.display_name}>
              {model.display_name}
            </h4>
            <p style={styles.cardAuthor}>by {model.author}</p>

            {/* Tags / Formats */}
            <div style={styles.formatRow}>
              {model.has_gguf && <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>GGUF</span>}
              {model.has_ollama && <span className="badge badge-purple" style={{ fontSize: '0.65rem', background: 'rgba(124, 58, 237, 0.1)', color: '#a78bfa' }}>Ollama</span>}
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
              <div style={{ ...styles.footerStat, marginLeft: 'auto' }}>
                <span style={styles.licenseLabel}>{model.license}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {filteredAndSortedModels.length > displayLimit && (
        <div style={styles.loadMoreWrapper}>
          <button
            onClick={() => setDisplayLimit((prev) => prev + 30)}
            className="btn-secondary"
            style={styles.loadMoreBtn}
          >
            Load More Models
          </button>
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
  controlPanel: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
    marginBottom: '20px',
  },
  searchRow: {
    display: 'flex',
    gap: '16px',
    '@media (max-width: 768px)': {
      flexDirection: 'column' as const,
    }
  },
  searchWrapper: {
    flex: 1,
    position: 'relative' as const,
  },
  searchIcon: {
    position: 'absolute' as const,
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted)',
  },
  searchInput: {
    width: '100%',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '10px',
    padding: '12px 16px 12px 42px',
    color: '#fff',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'all 0.2s',
    ':focus': {
      borderColor: 'var(--accent-secondary)',
      background: 'rgba(255, 255, 255, 0.04)',
    }
  },
  sortWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '240px',
    '@media (max-width: 768px)': {
      width: '100%',
    }
  },
  filterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '16px',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  filterLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
    fontWeight: '600',
    letterSpacing: '0.05em',
  },
  select: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '10px',
    padding: '10px 14px',
    color: '#fff',
    fontSize: '0.9rem',
    outline: 'none',
    cursor: 'pointer',
    width: '100%',
    ':focus': {
      borderColor: 'var(--accent-primary)',
    }
  },
  metaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
    marginBottom: '16px',
    padding: '0 4px',
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
  formatRow: {
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
  licenseLabel: {
    fontSize: '0.75rem',
    background: 'rgba(255, 255, 255, 0.02)',
    padding: '2px 6px',
    borderRadius: '4px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  loadMoreWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '36px',
    marginBottom: '24px',
  },
  loadMoreBtn: {
    padding: '12px 32px',
  }
};
