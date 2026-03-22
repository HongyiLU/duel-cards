// Card Component

import type { Card as CardType } from '../types';
import './Card.css';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  isSelected?: boolean;
  isPlayable?: boolean;
  showBack?: boolean;
  inHand?: boolean;
  canAttack?: boolean;
  showTarget?: boolean;
}

export function Card({
  card,
  onClick,
  isSelected = false,
  isPlayable = true,
  showBack = false,
  inHand = false,
  canAttack = false,
  showTarget = false,
}: CardProps) {
  if (showBack) {
    return (
      <div className={`card card-back ${inHand ? 'in-hand' : ''}`}>
        <div className="card-back-design">
          <span>⚔️</span>
        </div>
      </div>
    );
  }
  
  const rarityClass = `rarity-${card.rarity}`;
  const classes = [
    'card',
    rarityClass,
    isSelected && 'selected',
    !isPlayable && 'unplayable',
    inHand && 'in-hand',
    canAttack && 'can-attack',
    showTarget && 'show-target',
  ].filter(Boolean).join(' ');
  
  return (
    <div className={classes} onClick={onClick}>
      <div className="card-cost">{card.cost}</div>
      <div className="card-name">{card.name}</div>
      
      {card.type === 'CREATURE' ? (
        <>
          <div className="card-art">
            <span className="card-icon">{
              card.id.includes('soldier') ? '🛡️' :
              card.id.includes('apprentice') ? '🔥' :
              card.id.includes('assassin') ? '🗡️' :
              card.id.includes('guardian') ? '🌲' :
              card.id.includes('knight') ? '⚜️' :
              card.id.includes('giant') ? '⚡' :
              card.id.includes('dragon') ? '🐉' :
              card.id.includes('lord') ? '👻' : '🎴'
            }</span>
          </div>
          <div className="card-stats">
            <span className="card-attack">{card.attack}</span>
            <span className="card-health">{card.currentHealth || card.health}</span>
          </div>
        </>
      ) : (
        <div className="card-art spell-art">
          <span className="card-icon">{
            card.id.includes('emp') ? '⚡' :
            card.id.includes('shield') ? '🔮' :
            card.id.includes('lightning') ? '🌩️' :
            card.id.includes('healing') ? '💚' : '✨'
          }</span>
        </div>
      )}
      
      <div className="card-description">{card.description}</div>
      {card.effects.length > 0 && (
        <div className="card-effects">
          {card.effects.map(e => (
            <span key={e} className="effect-badge">{e}</span>
          ))}
        </div>
      )}
    </div>
  );
}
