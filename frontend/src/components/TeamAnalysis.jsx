import { getTypeColor, getTypeEmoji } from '../utils/type-colors.js';
import './TeamAnalysis.css';

export default function TeamAnalysis({ analysis }) {
  if (!analysis) return null;

  const { coverage, defensiveGaps } = analysis;
  const { offensive, defensive } = coverage;

  return (
    <div className="team-analysis">
      <h2>📊 Team Analysis</h2>

      {/* Offensive Coverage */}
      <section className="analysis-section">
        <h3>⚔️ Offensive Coverage</h3>
        <div className="type-group">
          <div className="type-group-title">Super Effective Against</div>
          <div className="type-list">
            {offensive.superEffectiveAgainst.length > 0 ? (
              offensive.superEffectiveAgainst.map(type => (
                <span
                  key={type}
                  className="type-badge"
                  style={{ backgroundColor: getTypeColor(type) }}
                >
                  {getTypeEmoji(type)} {type}
                </span>
              ))
            ) : (
              <span className="empty-type">No coverage</span>
            )}
          </div>
        </div>

        <div className="type-group">
          <div className="type-group-title">Not Very Effective Against</div>
          <div className="type-list">
            {offensive.notVeryEffectiveAgainst.length > 0 ? (
              offensive.notVeryEffectiveAgainst.map(type => (
                <span
                  key={type}
                  className="type-badge weak"
                  style={{ backgroundColor: getTypeColor(type), opacity: 0.6 }}
                >
                  {getTypeEmoji(type)} {type}
                </span>
              ))
            ) : (
              <span className="empty-type">No weak coverage</span>
            )}
          </div>
        </div>
      </section>

      {/* Defensive Coverage */}
      <section className="analysis-section">
        <h3>🛡️ Defensive Coverage</h3>
        <div className="type-group">
          <div className="type-group-title">Weak To</div>
          <div className="type-list">
            {defensive.weaknessesTo.length > 0 ? (
              defensive.weaknessesTo.map(type => (
                <span
                  key={type}
                  className="type-badge weak"
                  style={{ backgroundColor: getTypeColor(type) }}
                >
                  {getTypeEmoji(type)} {type}
                </span>
              ))
            ) : (
              <span className="empty-type">No weaknesses!</span>
            )}
          </div>
        </div>

        <div className="type-group">
          <div className="type-group-title">Resists</div>
          <div className="type-list">
            {defensive.resistancesTo.length > 0 ? (
              defensive.resistancesTo.map(type => (
                <span
                  key={type}
                  className="type-badge"
                  style={{ backgroundColor: getTypeColor(type), opacity: 0.8 }}
                >
                  {getTypeEmoji(type)} {type}
                </span>
              ))
            ) : (
              <span className="empty-type">No resistances</span>
            )}
          </div>
        </div>

        <div className="type-group">
          <div className="type-group-title">Immune To</div>
          <div className="type-list">
            {defensive.immunitiesTo.length > 0 ? (
              defensive.immunitiesTo.map(type => (
                <span
                  key={type}
                  className="type-badge"
                  style={{ backgroundColor: getTypeColor(type) }}
                >
                  {getTypeEmoji(type)} {type}
                </span>
              ))
            ) : (
              <span className="empty-type">No immunities</span>
            )}
          </div>
        </div>
      </section>

      {/* Defensive Gaps */}
      <section className="analysis-section">
        <h3>⚠️ Defensive Gaps</h3>
        <div className="gap-stats">
          <div className="gap-stat">
            <strong>{defensiveGaps.weaknessesCount}</strong>
            <span>Weaknesses</span>
          </div>
          <div className="gap-stat">
            <strong>{defensiveGaps.coverageCount}</strong>
            <span>Resistances</span>
          </div>
        </div>
        {defensiveGaps.gaps.length > 0 && (
          <div className="gaps-list">
            <div className="gaps-title">Unresisted Types:</div>
            <div className="type-list">
              {defensiveGaps.gaps.slice(0, 6).map(type => (
                <span
                  key={type}
                  className="type-badge"
                  style={{ backgroundColor: getTypeColor(type), opacity: 0.5 }}
                >
                  {getTypeEmoji(type)}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
