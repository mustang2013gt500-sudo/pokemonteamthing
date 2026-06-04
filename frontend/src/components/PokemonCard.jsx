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
  const [isExpanded, setIsExpanded] = useState(false);
  const [items, setItems] = useState([]);
  const [itemFilter, setItemFilter] = useState('');
  const [itemError, setItemError] = useState('');
  const pokemon = member.pokemon;
  const moveCount = member.moves.length;
  const hasItem = Boolean(member.item?.trim());
  const isComplete = moveCount === 4 && hasItem;
  const completionText = `${moveCount}/4 moves, ${hasItem ? member.item : 'No item'}`;

  useEffect(() => {
    if (!isExpanded) {
      return undefined;
    }

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
  }, [isExpanded, itemFilter]);

  const handleMovesSelected = (moves) => {
    onMovesChange(moves);
    setShowMovePicker(false);
  };

  return (
    <>
      <div className="pokemon-card">
        <button className="remove-btn" onClick={onRemove} title="Remove">
          x
        </button>

        <div className="card-header">
          <img src={pokemon.sprite} alt={pokemon.name} className="pokemon-sprite" />
          <div className="card-title">
            <div className="card-name-row">
              <h3>{pokemon.displayName || pokemon.name}</h3>
              <span className={`completion-pill ${isComplete ? 'complete' : 'incomplete'}`}>
                {isComplete ? 'Complete' : 'Incomplete'}
              </span>
            </div>
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
            <div className="completion-summary">{completionText}</div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(current => !current)}
          className="btn-secondary card-toggle"
        >
          {isExpanded ? 'Hide details' : 'Edit details'}
        </button>

        {isExpanded && (
          <div className="card-body">
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
                {member.moves.length === 0 ? '+ Add Moves' : 'Edit Moves'}
              </button>
            </div>
          </div>
        )}
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
