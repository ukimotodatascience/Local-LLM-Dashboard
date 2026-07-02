import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Home } from './components/Home';
import { ModelExplorer } from './components/ModelExplorer';
import { RisingModels } from './components/RisingModels';
import { NewModels } from './components/NewModels';
import { FamilyTrends } from './components/FamilyTrends';
import { About } from './components/About';
import { ModelDetailModal } from './components/ModelDetailModal';
import type { ModelItem, FamilyTrendItem, SummaryData, MetadataData } from './types';
import { ShieldAlert } from 'lucide-react';

function App() {
  const [activePage, setActivePage] = useState<string>('home');
  const [models, setModels] = useState<ModelItem[] | null>(null);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [rising, setRising] = useState<ModelItem[] | null>(null);
  const [newModels, setNewModels] = useState<ModelItem[] | null>(null);
  const [trends, setTrends] = useState<FamilyTrendItem[] | null>(null);
  const [metadata, setMetadata] = useState<MetadataData | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelItem | null>(null);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Relative fetch paths to work seamlessly in both local and GitHub Pages deployments
        const [
          modelsRes,
          summaryRes,
          risingRes,
          newRes,
          trendsRes,
          metaRes
        ] = await Promise.all([
          fetch('./data/latest/models.json'),
          fetch('./data/latest/summary.json'),
          fetch('./data/latest/rising.json'),
          fetch('./data/latest/new_models.json'),
          fetch('./data/latest/families.json'),
          fetch('./data/latest/metadata.json')
        ]);

        if (!modelsRes.ok || !summaryRes.ok) {
          throw new Error('Failed to load JSON datasets. Make sure collectors have run.');
        }

        const [
          modelsData,
          summaryData,
          risingData,
          newData,
          trendsData,
          metaData
        ] = await Promise.all([
          modelsRes.json(),
          summaryRes.json(),
          risingRes.json(),
          newRes.json(),
          trendsRes.json(),
          metaRes.json()
        ]);

        setModels(modelsData);
        setSummary(summaryData);
        setRising(risingData);
        setNewModels(newData);
        setTrends(trendsData);
        setMetadata(metaData);
        setError(null);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'An error occurred while loading dashboard dataset.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSelectModel = (model: ModelItem) => {
    setSelectedModel(model);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div style={styles.centerBox}>
          <div style={styles.spinner} />
          <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Loading LLM Radar Dashboard...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="glass-panel" style={{ ...styles.centerBox, padding: '40px', maxWidth: '600px', margin: '100px auto' }}>
          <ShieldAlert size={48} color="var(--error)" />
          <h3 style={{ marginTop: '16px', color: '#fff' }}>Dataset Loading Error</h3>
          <p style={{ marginTop: '12px', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: '1.6' }}>
            {error}
            <br />
            <br />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              If you are in development, run the collection script first:<br />
              <code>uv run scripts/collect_all.py</code>
            </span>
          </p>
        </div>
      );
    }

    switch (activePage) {
      case 'home':
        return (
          <Home
            summary={summary}
            onSelectModel={handleSelectModel}
            setActivePage={setActivePage}
          />
        );
      case 'explorer':
        return (
          <ModelExplorer
            models={models}
            onSelectModel={handleSelectModel}
          />
        );
      case 'rising':
        return (
          <RisingModels
            models={rising}
            onSelectModel={handleSelectModel}
          />
        );
      case 'new':
        return (
          <NewModels
            models={newModels}
            onSelectModel={handleSelectModel}
          />
        );
      case 'trends':
        return <FamilyTrends trends={trends} />;
      case 'about':
        return <About />;
      default:
        return <Home summary={summary} onSelectModel={handleSelectModel} setActivePage={setActivePage} />;
    }
  };

  return (
    <div style={styles.appContainer}>
      {/* Sidebar Navigation */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        metadata={metadata}
      />

      {/* Main Content Pane */}
      <main style={styles.mainContent}>
        {renderContent()}
      </main>

      {/* Model Detail Popup Modal */}
      {selectedModel && (
        <ModelDetailModal
          model={selectedModel}
          onClose={() => setSelectedModel(null)}
        />
      )}
    </div>
  );
}

const styles = {
  appContainer: {
    display: 'flex',
    minHeight: '100vh',
  },
  mainContent: {
    marginLeft: 'var(--sidebar-width)',
    flex: 1,
    padding: '32px 48px',
    maxWidth: '1200px',
    width: 'calc(100% - var(--sidebar-width))',
  },
  centerBox: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: '70vh',
    width: '100%',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid rgba(124, 58, 237, 0.1)',
    borderTop: '4px solid var(--accent-primary)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};

// Add spinner keyframes inline style or let it fallback (spin style animation runs standardly if defined in global)
const styleTag = document.createElement('style');
styleTag.innerHTML = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleTag);

export default App;
