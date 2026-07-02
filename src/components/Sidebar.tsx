import React from 'react';
import { Home, Compass, TrendingUp, Sparkles, BarChart2, Info, ShieldAlert, Cpu, X } from 'lucide-react';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  metadata: { collected_at: string } | null;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, metadata, isOpen, onClose }) => {
  const menuItems = [
    { id: 'home', label: 'Home', icon: <Home size={18} /> },
    { id: 'explorer', label: 'Model Explorer', icon: <Compass size={18} /> },
    { id: 'rising', label: 'Rising Models', icon: <TrendingUp size={18} /> },
    { id: 'new', label: 'New Models', icon: <Sparkles size={18} /> },
    { id: 'trends', label: 'Family Trends', icon: <BarChart2 size={18} /> },
    { id: 'about', label: 'About Radar', icon: <Info size={18} /> },
  ];

  const formatLastUpdated = (dateStr: string | undefined) => {
    if (!dateStr) return 'Loading...';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ja-JP', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Tokyo'
      }) + ' JST';
    } catch {
      return 'Unknown';
    }
  };

  return (
    <aside style={styles.sidebar} className={isOpen ? 'active' : ''}>
      {/* Mobile Close Button */}
      <button onClick={onClose} className="mobile-close-btn" aria-label="Close sidebar">
        <X size={20} />
      </button>
      {/* Brand Logo */}
      <div style={styles.brand}>
        <div style={styles.logoIcon}>
          <Cpu size={24} color="#06b6d4" />
        </div>
        <div>
          <h1 style={styles.brandTitle} className="text-gradient">LLM Radar</h1>
          <span style={styles.brandSub}>Local & Open Weight</span>
        </div>
      </div>

      {/* Nav List */}
      <nav style={styles.nav}>
        <ul style={styles.ul}>
          {menuItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActivePage(item.id);
                    onClose();
                  }}
                  style={{
                    ...styles.navLink,
                    ...(isActive ? styles.navLinkActive : {}),
                  }}
                >
                  <span style={isActive ? { color: '#06b6d4' } : {}}>{item.icon}</span>
                  <span style={styles.linkLabel}>{item.label}</span>
                  {isActive && <div style={styles.activeIndicator} />}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Meta */}
      <div style={styles.footer} className="glass-panel">
        <div style={styles.metaRow}>
          <span style={styles.metaLabel}>Last Update</span>
          <span style={styles.metaVal}>{formatLastUpdated(metadata?.collected_at)}</span>
        </div>
        <div style={{ ...styles.metaRow, marginTop: '8px', display: 'flex', gap: '6px', alignItems: 'center' }}>
          <ShieldAlert size={12} color="var(--text-muted)" />
          <span style={styles.disclaimer}>Demo & Public Info Only</span>
        </div>
      </div>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: 'var(--sidebar-width)',
    height: '100vh',
    position: 'fixed' as const,
    top: 0,
    left: 0,
    backgroundColor: 'rgba(6, 9, 19, 0.6)',
    borderRight: '1px solid rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '24px 16px',
    zIndex: 100,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '8px 12px 24px 12px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  logoIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'rgba(6, 182, 212, 0.1)',
    border: '1px solid rgba(6, 182, 212, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: '1.25rem',
    fontWeight: '800',
    letterSpacing: '-0.02em',
    lineHeight: '1.1',
  },
  brandSub: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  nav: {
    flex: 1,
    marginTop: '24px',
  },
  ul: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 6,
  },
  navLink: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    background: 'none',
    border: 'none',
    borderRadius: '10px',
    color: 'var(--text-secondary)',
    fontSize: '0.925rem',
    fontWeight: '500',
    cursor: 'pointer',
    textAlign: 'left' as const,
    transition: 'all 0.2s ease',
    position: 'relative' as const,
    overflow: 'hidden',
    ':hover': {
      background: 'rgba(255, 255, 255, 0.03)',
      color: '#fff',
    }
  },
  navLinkActive: {
    background: 'rgba(124, 58, 237, 0.08)',
    border: '1px solid rgba(124, 58, 237, 0.15)',
    color: '#fff',
    fontWeight: '600',
  },
  linkLabel: {
    flex: 1,
  },
  activeIndicator: {
    width: '4px',
    height: '16px',
    borderRadius: '9999px',
    background: 'var(--accent-primary)',
    position: 'absolute' as const,
    right: '12px',
    boxShadow: '0 0 10px var(--accent-primary)',
  },
  footer: {
    padding: '16px',
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    borderRadius: '12px',
  },
  metaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
  },
  metaLabel: {
    color: 'var(--text-muted)',
  },
  metaVal: {
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  disclaimer: {
    fontSize: '0.65rem',
    color: 'var(--text-muted)',
  }
};
