import { useState } from 'react';
import './SaveTeamModal.css';

export default function SaveTeamModal({ onSave, onClose, savedTeamNames }) {
  const [teamName, setTeamName] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!teamName.trim()) {
      setError('Team name cannot be empty');
      return;
    }

    if (teamName.length > 50) {
      setError('Team name must be 50 characters or less');
      return;
    }

    onSave(teamName);
  };

  const handleNameChange = e => {
    setTeamName(e.target.value);
    setError('');
  };

  const isOverwriting = savedTeamNames.includes(teamName);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal save-team-modal" onClick={e => e.stopPropagation()}>
        <h2>💾 Save Team</h2>

        <div className="form-group">
          <label htmlFor="teamName">Team Name</label>
          <input
            id="teamName"
            type="text"
            placeholder="e.g., Earthquake Stall"
            value={teamName}
            onChange={handleNameChange}
            autoFocus
            maxLength={50}
          />
          <small>{teamName.length}/50</small>
        </div>

        {error && <div className="error-message">{error}</div>}

        {isOverwriting && (
          <div className="warning-message">
            ⚠️ A team with this name already exists and will be overwritten.
          </div>
        )}

        <div className="modal-actions">
          <button onClick={handleSave} className="btn-primary">
            Save Team
          </button>
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
