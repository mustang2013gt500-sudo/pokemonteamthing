import { useState } from 'react';
import './TeamExport.css';

export default function TeamExport({ team, onClose }) {
  const [activeTab, setActiveTab] = useState('export');
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');

  const generateExportText = () => {
    return team
      .map(member => {
        if (!member.pokemon) return '';
        const movesText = member.moves.map(m => m.name || m).join(' / ');
        return `[${member.pokemon.name}] ${member.ability} | ${member.nature} | ${member.item || 'None'} | ${movesText || 'No moves'}`;
      })
      .filter(Boolean)
      .join('\n');
  };

  const handleCopyToClipboard = () => {
    const text = generateExportText();
    navigator.clipboard.writeText(text).then(() => {
      alert('Team copied to clipboard!');
    });
  };

  const handleImport = () => {
    // Basic validation - just check format
    if (!importText.trim()) {
      setImportError('Paste team data first');
      return;
    }

    // In a full implementation, this would parse and validate the format
    alert(
      'Import feature requires backend parsing support.\nFor now, manually recreate the team.'
    );
  };

  const exportText = generateExportText();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal team-export" onClick={e => e.stopPropagation()}>
        <h2>📤 Export / Import Team</h2>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'export' ? 'active' : ''}`}
            onClick={() => setActiveTab('export')}
          >
            📤 Export
          </button>
          <button
            className={`tab ${activeTab === 'import' ? 'active' : ''}`}
            onClick={() => setActiveTab('import')}
          >
            📥 Import
          </button>
        </div>

        {activeTab === 'export' && (
          <div className="tab-content">
            <p className="info">
              Copy this text to share your team with others or save it externally.
            </p>
            <textarea readOnly value={exportText} rows={team.length + 2} />
            <button onClick={handleCopyToClipboard} className="btn-primary">
              📋 Copy to Clipboard
            </button>
          </div>
        )}

        {activeTab === 'import' && (
          <div className="tab-content">
            <p className="info">Paste a team export below to import it.</p>
            <textarea
              value={importText}
              onChange={e => {
                setImportText(e.target.value);
                setImportError('');
              }}
              placeholder="Paste team data here..."
              rows={8}
            />
            {importError && <div className="error-message">{importError}</div>}
            <button onClick={handleImport} className="btn-primary">
              📥 Import Team
            </button>
          </div>
        )}

        <button onClick={onClose} className="btn-secondary close-button">
          Close
        </button>
      </div>
    </div>
  );
}
