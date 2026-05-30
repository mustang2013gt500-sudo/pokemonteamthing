import { useState, useEffect } from 'react';
import useTeam from '../hooks/useTeam.js';
import { validateTeam, analyzeTeam } from '../services/api.js';
import PokemonPicker from '../components/PokemonPicker.jsx';
import PokemonCard from '../components/PokemonCard.jsx';
import TeamAnalysis from '../components/TeamAnalysis.jsx';
import SaveTeamModal from '../components/SaveTeamModal.jsx';
import TeamExport from '../components/TeamExport.jsx';
import './TeamBuilder.css';

export default function TeamBuilder() {
  const { team, addPokemon, removePokemon, setMoves, setAbility, setNature, setItem, clearTeam } = useTeam([]);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(0);
  const [validation, setValidation] = useState({ valid: true, errors: [] });
  const [analysis, setAnalysis] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [savedTeams, setSavedTeams] = useState([]);

  // Load saved teams from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('pokemon-teams');
    if (saved) {
      try {
        setSavedTeams(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to load saved teams:', err);
      }
    }
  }, []);

  // Validate team whenever it changes
  useEffect(() => {
    if (team.length > 0) {
      validateTeam(team)
        .then(setValidation)
        .catch(err => {
          console.error('Validation error:', err);
          setValidation({ valid: false, errors: [err.message] });
        });
    } else {
      setValidation({ valid: true, errors: [] });
    }
  }, [team]);

  // Analyze coverage whenever team changes
  useEffect(() => {
    if (team.length > 0) {
      analyzeTeam(team)
        .then(setAnalysis)
        .catch(err => {
          console.error('Analysis error:', err);
          setAnalysis(null);
        });
    } else {
      setAnalysis(null);
    }
  }, [team]);

  const handlePokemonSelected = (pokemon) => {
    addPokemon(pokemon, selectedSlot);
    setShowPicker(false);
  };

  const handleSlotClick = (slot) => {
    setSelectedSlot(slot);
    setShowPicker(true);
  };

  const handleSaveTeam = (teamName) => {
    const teamData = {
      name: teamName,
      team,
      savedAt: new Date().toISOString()
    };

    const updated = savedTeams.filter(t => t.name !== teamName);
    updated.push(teamData);
    setSavedTeams(updated);
    localStorage.setItem('pokemon-teams', JSON.stringify(updated));
    setShowSaveModal(false);
  };

  const handleLoadTeam = (teamData) => {
    // Reset and load team
    clearTeam();
    teamData.team.forEach((member, idx) => {
      if (member?.pokemon) {
        addPokemon(member.pokemon, idx);
        if (member.moves?.length > 0) {
          setMoves(idx, member.moves);
        }
        if (member.ability) {
          setAbility(idx, member.ability);
        }
        if (member.nature) {
          setNature(idx, member.nature);
        }
        if (member.item) {
          setItem(idx, member.item);
        }
      }
    });
  };

  return (
    <div className="team-builder">
      <div className="container">
        <header className="header">
          <h1>⚡ Pokémon VGC Team Builder</h1>
          <p>Build your competitive team and analyze type coverage</p>
        </header>

        <div className="team-builder-layout">
          {/* Main team editor */}
          <div className="team-editor">
            <div className="team-header">
              <h2>Your Team ({team.length}/6)</h2>
              <div className="team-actions">
                <button onClick={() => setShowSaveModal(true)} className="btn-primary">
                  💾 Save Team
                </button>
                <button onClick={() => setShowExportModal(true)} className="btn-primary">
                  📤 Export/Import
                </button>
                <button onClick={clearTeam} className="btn-secondary">
                  🗑️ Clear
                </button>
              </div>
            </div>

            {/* Validation errors */}
            {validation.errors.length > 0 && (
              <div className="error-message">
                <strong>Team Validation Issues:</strong>
                <ul>
                  {validation.errors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Team slots */}
            <div className="team-slots">
              {[...Array(6)].map((_, idx) => (
                <div key={idx} className="team-slot">
                  {team[idx] ? (
                    <PokemonCard
                      member={team[idx]}
                      slot={idx}
                      onRemove={() => removePokemon(idx)}
                      onMovesChange={(moves) => setMoves(idx, moves)}
                      onAbilityChange={(ability) => setAbility(idx, ability)}
                      onNatureChange={(nature) => setNature(idx, nature)}
                      onItemChange={(item) => setItem(idx, item)}
                    />
                  ) : (
                    <button
                      className="empty-slot"
                      onClick={() => handleSlotClick(idx)}
                    >
                      + Add Pokémon
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Type analysis sidebar */}
          {analysis && (
            <div className="analysis-sidebar">
              <TeamAnalysis analysis={analysis} />
            </div>
          )}
        </div>

        {/* Saved teams list */}
        {savedTeams.length > 0 && (
          <div className="saved-teams">
            <h3>📂 Saved Teams</h3>
            <div className="team-list">
              {savedTeams.map((teamData, idx) => (
                <div key={idx} className="team-item">
                  <div>
                    <strong>{teamData.name}</strong>
                    <small>{new Date(teamData.savedAt).toLocaleDateString()}</small>
                  </div>
                  <button
                    onClick={() => handleLoadTeam(teamData)}
                    className="btn-secondary"
                  >
                    Load
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showPicker && (
        <PokemonPicker
          onPokemonSelected={handlePokemonSelected}
          onClose={() => setShowPicker(false)}
        />
      )}

      {showSaveModal && (
        <SaveTeamModal
          onSave={handleSaveTeam}
          onClose={() => setShowSaveModal(false)}
          savedTeamNames={savedTeams.map(t => t.name)}
        />
      )}

      {showExportModal && (
        <TeamExport
          team={team}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}
