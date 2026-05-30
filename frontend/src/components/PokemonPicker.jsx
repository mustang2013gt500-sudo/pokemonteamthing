import { useState, useEffect } from 'react';
import { searchPokemon } from '../services/api.js';
import { getTypeColor, getTypeEmoji } from '../utils/type-colors.js';
import './PokemonPicker.css';

export default function PokemonPicker({ onPokemonSelected, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError('');

    const timer = setTimeout(() => {
      searchPokemon(query)
        .then(data => {
          setResults(data);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }, 300); // Debounce

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal pokemon-picker" onClick={e => e.stopPropagation()}>
        <h2>🔍 Search Pokémon</h2>

        <input
          type="text"
          placeholder="Type Pokémon name..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="search-input"
          autoFocus
        />

        {error && <div className="error-message">{error}</div>}

        <div className="pokemon-results">
          {loading && <p className="loading">Searching...</p>}

          {!loading && results.length === 0 && query.length >= 2 && (
            <p className="no-results">No Pokémon found</p>
          )}

          {!loading && query.length < 2 && (
            <p className="hint">Type at least 2 characters to search</p>
          )}

          {results.map(pokemon => (
            <div
              key={pokemon.id}
              className={`pokemon-result ${pokemon.isRestricted ? 'restricted' : ''} ${
                !pokemon.isAllowed ? 'banned' : ''
              }`}
              onClick={() => onPokemonSelected(pokemon)}
            >
              <img src={pokemon.sprite} alt={pokemon.name} />
              <div className="pokemon-info">
                <div className="pokemon-name">{pokemon.name}</div>
                <div className="pokemon-types">
                  {pokemon.types.map(type => (
                    <span
                      key={type}
                      className="type-badge"
                      style={{ backgroundColor: getTypeColor(type) }}
                    >
                      {getTypeEmoji(type)} {type}
                    </span>
                  ))}
                </div>
                {pokemon.isRestricted && <span className="badge restricted">Restricted</span>}
                {!pokemon.isAllowed && <span className="badge banned">Banned</span>}
              </div>
            </div>
          ))}
        </div>

        <button onClick={onClose} className="btn-secondary close-button">
          Close
        </button>
      </div>
    </div>
  );
}
