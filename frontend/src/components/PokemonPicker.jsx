import { useEffect, useState } from 'react';
import { getPokemon, searchPokemon } from '../services/api.js';
import { getTypeColor, getTypeEmoji } from '../utils/type-colors.js';
import './PokemonPicker.css';

const POKEMON_TYPES = [
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

const STAT_FILTERS = [
  { value: '', label: 'National Dex' },
  { value: 'hp', label: 'HP' },
  { value: 'attack', label: 'Attack' },
  { value: 'defense', label: 'Defense' },
  { value: 'spAtk', label: 'Sp. Atk' },
  { value: 'spDef', label: 'Sp. Def' },
  { value: 'speed', label: 'Speed' }
];

export default function PokemonPicker({ onPokemonSelected, onClose }) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [stat, setStat] = useState('');
  const [minStat, setMinStat] = useState('');
  const [page, setPage] = useState(1);
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setPage(1);
  }, [query, type, stat, minStat]);

  useEffect(() => {
    setLoading(true);
    setError('');

    const timer = setTimeout(() => {
      searchPokemon({ query, page, type, stat, minStat })
        .then(data => {
          setResults(data.results || []);
          setPagination(data.pagination || null);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setResults([]);
          setPagination(null);
          setLoading(false);
        });
    }, 250);

    return () => clearTimeout(timer);
  }, [query, page, type, stat, minStat]);

  const handleAddPokemon = async (pokemon) => {
    setAddingId(pokemon.id);
    setError('');

    try {
      const fullPokemon = await getPokemon(pokemon.name);
      onPokemonSelected(fullPokemon);
    } catch (err) {
      setError(`Could not add ${pokemon.name}: ${err.message}`);
      setAddingId(null);
    }
  };

  const clearFilters = () => {
    setQuery('');
    setType('');
    setStat('');
    setMinStat('');
    setPage(1);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal pokemon-picker" onClick={e => e.stopPropagation()}>
        <div className="picker-header">
          <div>
            <h2>Choose Pokemon</h2>
            <p>Browse the dex, search by name, or filter for VGC-style roles.</p>
          </div>
          <button onClick={onClose} className="icon-button" aria-label="Close picker">
            x
          </button>
        </div>

        <div className="picker-controls">
          <input
            type="text"
            placeholder="Search any length, e.g. p, pika, char..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="search-input"
            autoFocus
          />

          <div className="filter-grid">
            <label>
              Type
              <select value={type} onChange={e => setType(e.target.value)}>
                <option value="">Any type</option>
                {POKEMON_TYPES.map(typeName => (
                  <option key={typeName} value={typeName}>
                    {typeName}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Sort / filter stat
              <select value={stat} onChange={e => setStat(e.target.value)}>
                {STAT_FILTERS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Minimum stat
              <input
                type="number"
                min="1"
                max="255"
                placeholder="Optional"
                value={minStat}
                disabled={!stat}
                onChange={e => setMinStat(e.target.value)}
              />
            </label>

            <button onClick={clearFilters} className="btn-secondary clear-filters">
              Clear
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="result-summary">
          {pagination && (
            <span>
              {pagination.total} Pokemon found · page {pagination.page} of {pagination.totalPages}
            </span>
          )}
        </div>

        <div className="pokemon-results">
          {loading && <p className="loading">Loading Pokemon...</p>}

          {!loading && results.length === 0 && (
            <p className="no-results">No Pokemon match those filters.</p>
          )}

          {!loading && results.map(pokemon => (
            <div
              key={pokemon.id}
              className={`pokemon-result ${pokemon.isRestricted ? 'restricted' : ''} ${
                !pokemon.isAllowed ? 'banned' : ''
              }`}
            >
              <img src={pokemon.sprite} alt={pokemon.name} />
              <div className="pokemon-info">
                <div className="pokemon-title-row">
                  <div>
                    <div className="pokemon-name">
                      #{pokemon.id} {pokemon.name}
                    </div>
                    <div className="pokemon-types">
                      {pokemon.types.map(typeName => (
                        <span
                          key={typeName}
                          className="type-badge"
                          style={{ backgroundColor: getTypeColor(typeName) }}
                        >
                          {getTypeEmoji(typeName)} {typeName}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-primary add-result-button"
                    disabled={addingId === pokemon.id || !pokemon.isAllowed}
                    onClick={() => handleAddPokemon(pokemon)}
                  >
                    {addingId === pokemon.id ? 'Adding...' : 'Add'}
                  </button>
                </div>

                <div className="stat-row">
                  <span>HP {pokemon.baseStats.hp}</span>
                  <span>Atk {pokemon.baseStats.attack}</span>
                  <span>Def {pokemon.baseStats.defense}</span>
                  <span>SpA {pokemon.baseStats.spAtk}</span>
                  <span>SpD {pokemon.baseStats.spDef}</span>
                  <span>Spe {pokemon.baseStats.speed}</span>
                </div>

                {pokemon.isRestricted && <span className="badge restricted">Restricted</span>}
                {!pokemon.isAllowed && <span className="badge banned">Banned</span>}
              </div>
            </div>
          ))}
        </div>

        <div className="pagination-controls">
          <button
            onClick={() => setPage(current => Math.max(current - 1, 1))}
            className="btn-secondary"
            disabled={!pagination?.hasPreviousPage || loading}
          >
            Previous
          </button>
          <button
            onClick={() => setPage(current => current + 1)}
            className="btn-secondary"
            disabled={!pagination?.hasNextPage || loading}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
