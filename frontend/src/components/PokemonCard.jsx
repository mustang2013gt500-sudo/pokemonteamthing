import { useEffect, useState } from 'react';
import { searchItems } from '../services/api.js';
import { getTypeColor, getTypeEmoji } from '../utils/type-colors.js';
import MovePicker from './MovePicker.jsx';
import './PokemonCard.css';

const NATURES = [
  'Adamant',
  'Careful',
  'Gentle',
  'Hasty',
  'Jolly',
  'Lax',
  'Mild',
  'Modest',
  'Naive',
  'Quiet',
  'Rash',
  'Relaxed',
  'Sassy',
  'Timid',
  'Bold',
  'Calm',
  'Impish',
  'Lonely',
  'Serious'
];

export default function PokemonCard({
  member,
  slot,
  onRemove,
  onMovesChange,
  onAbilityChange,
  onNatureChange,
  onItemChange
}) {
  const [showMovePicker, setShowMovePicker] = useState(false);
  const [items, setItems] = useState([]);
  const [itemFilter, setItemFilter] = useState('');
  const [itemError, setItemError] = useState('');
  const pokemon = member.pokemon;

  useEffect(() => {
    const timer = setTimeout(() => {
      searchItems(itemFilter)
        .then(data => {
          setItems(data);
          setItemError('');
        })
        .catch(err => {
          setItemError(err.message);
          setItems([]);
        });
    }, 250);

    return () => clearTimeout(timer);
  }, [itemFilter]);

  const handleMovesSelected = (moves) => {
    onMovesChange(moves);
    setShowMovePicker(false);
  };

  return (
    <>
      <div className="pokemon-card">
        <button className="remove-btn" onClick={onRemove} title="Remove">
          ✕
        </button>

        <div className="card-header">
          <img src={pokemon.sprite} alt={pokemon.name} className="pokemon-sprite" />
          <div className="card-title">
            <h3>{pokemon.name}</h3>
            <div className="card-types">
              {pokemon.types.map(type => (
                <span
                  key={type}
                  className="type-badge"
                  style={{ backgroundColor: getTypeColor(type) }}
                >
                  {getTypeEmoji(type)}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="card-body">
          {/* Ability */}
          <div className="form-group">
            <label>Ability</label>
            <select value={member.ability || ''} onChange={e => onAbilityChange(e.target.value)}>
              {pokemon.abilities.map(ability => (
                <option key={ability.name} value={ability.name}>
                  {ability.name} {ability.isHidden ? '(Hidden)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Nature */}
          <div className="form-group">
            <label>Nature</label>
            <select value={member.nature || 'Timid'} onChange={e => onNatureChange(e.target.value)}>
              {NATURES.map(nature => (
                <option key={nature} value={nature}>
                  {nature}
                </option>
              ))}
            </select>
          </div>

          {/* Item */}
          <div className="form-group">
            <label>Held Item</label>
            <input
              type="text"
              placeholder="Search item library..."
              value={itemFilter}
              onChange={e => setItemFilter(e.target.value)}
            />
            <select value={member.item || ''} onChange={e => onItemChange(e.target.value)}>
              <option value="">No item</option>
              {items.map(item => (
                <option key={item.name} value={item.name}>
                  {item.displayName}
                </option>
              ))}
            </select>
            {member.item && (
              <small className="selected-item">Selected: {member.item}</small>
            )}
            {itemError && <small className="field-error">{itemError}</small>}
          </div>

          {/* Moves */}
          <div className="form-group">
            <label>Moves ({member.moves.length}/4)</label>
            <div className="moves-list">
              {member.moves.length === 0 ? (
                <p className="no-moves">No moves selected</p>
              ) : (
                member.moves.map((move, idx) => (
                  <div key={idx} className="move-item">
                    <span className="move-name">{move.name}</span>
                    {move.type && (
                      <span
                        className="type-badge"
                        style={{ backgroundColor: getTypeColor(move.type) }}
                      >
                        {move.type}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
            <button
              onClick={() => setShowMovePicker(true)}
              className="btn-secondary"
              style={{ width: '100%' }}
            >
              {member.moves.length === 0 ? '+ Add Moves' : '⚙️ Edit Moves'}
            </button>
          </div>
        </div>
      </div>

      {showMovePicker && (
        <MovePicker
          pokemon={pokemon}
          selectedMoves={member.moves}
          onMovesSelected={handleMovesSelected}
          onClose={() => setShowMovePicker(false)}
        />
      )}
    </>
  );
}
