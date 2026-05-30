import { useState, useEffect } from 'react';
import { getTypeColor, getTypeEmoji } from '../utils/type-colors.js';
import './MovePicker.css';

export default function MovePicker({ pokemon, selectedMoves, onMovesSelected, onClose }) {
  const [available, setAvailable] = useState([]);
  const [selected, setSelected] = useState(selectedMoves || []);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    // Generate mock move data (in production, fetch from API)
    // For now, use Pokemon's move pool
    const moves = pokemon.moves.slice(0, 30).map(moveName => ({
      name: moveName,
      type: getRandomType(), // Mock type
      power: Math.floor(Math.random() * 150) || null,
      accuracy: 100
    }));
    setAvailable(moves);
  }, [pokemon]);

  const getRandomType = () => {
    const types = [
      'normal',
      'fire',
      'water',
      'electric',
      'grass',
      'ice',
      'fighting',
      'poison',
      'ground',
      'flying',
      'psychic',
      'bug',
      'rock',
      'ghost',
      'dragon',
      'dark',
      'steel',
      'fairy'
    ];
    return types[Math.floor(Math.random() * types.length)];
  };

  const toggleMove = move => {
    const isSelected = selected.some(m => m.name === move.name);
    if (isSelected) {
      setSelected(selected.filter(m => m.name !== move.name));
    } else if (selected.length < 4) {
      setSelected([...selected, move]);
    }
  };

  const filtered = available.filter(move =>
    move.name.toLowerCase().includes(filter.toLowerCase())
  );

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

        <div className="moves-grid">
          {filtered.map(move => {
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
                    {move.type}
                  </span>
                  {move.power && <span className="power">Power: {move.power}</span>}
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
