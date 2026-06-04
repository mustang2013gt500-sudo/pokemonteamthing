import { useState, useEffect } from 'react';
import { getMovesForPokemon } from '../services/api.js';
import { getTypeColor, getTypeEmoji } from '../utils/type-colors.js';
import './MovePicker.css';

export default function MovePicker({ pokemon, selectedMoves, onMovesSelected, onClose }) {
  const [available, setAvailable] = useState([]);
  const [selected, setSelected] = useState(selectedMoves || []);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');

    const timer = setTimeout(() => {
      getMovesForPokemon(pokemon.name, filter)
        .then(moves => {
          setAvailable(moves);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setAvailable([]);
          setLoading(false);
        });
    }, 250);

    return () => clearTimeout(timer);
  }, [pokemon.name, filter]);

  const toggleMove = move => {
    const isSelected = selected.some(m => m.name === move.name);
    if (isSelected) {
      setSelected(selected.filter(m => m.name !== move.name));
    } else if (selected.length < 4) {
      setSelected([...selected, move]);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal move-picker" onClick={e => e.stopPropagation()}>
        <h2>⚔️ Select Moves ({selected.length}/4)</h2>

        <input
          type="text"
          placeholder="Filter moves..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="search-input"
          autoFocus
        />

        {error && <div className="error-message">{error}</div>}

        <div className="moves-grid">
          {loading && <p className="loading">Loading moves...</p>}

          {!loading && available.length === 0 && (
            <p className="no-moves">No moves found.</p>
          )}

          {!loading && available.map(move => {
            const isSelected = selected.some(m => m.name === move.name);
            return (
              <div
                key={move.name}
                className={`move-option ${isSelected ? 'selected' : ''} ${
                  selected.length >= 4 && !isSelected ? 'disabled' : ''
                }`}
                onClick={() => toggleMove(move)}
              >
                <div className="move-option-header">
                  <span className="move-option-name">{move.name}</span>
                  {isSelected && <span className="checkmark">✓</span>}
                </div>
                <div className="move-option-info">
                  <span
                    className="type-badge"
                    style={{ backgroundColor: getTypeColor(move.type) }}
                  >
                    {getTypeEmoji(move.type)} {move.type}
                  </span>
                  {move.power && <span className="power">Power: {move.power}</span>}
                  {move.accuracy && <span className="power">Acc: {move.accuracy}</span>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="modal-actions">
          <button onClick={() => onMovesSelected(selected)} className="btn-primary">
            Confirm
          </button>
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
