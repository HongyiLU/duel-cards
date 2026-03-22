// Battle Screen Component

import { useEffect, useCallback } from 'react';
import { useGame } from '../hooks';
import { Card } from '../components/Card';
import './Battle.css';

export function Battle() {
  const { state, dispatch, playCard, attack, endTurn } = useGame();
  const { player, enemy, phase, selectedCard, turn } = state;
  
  // AI Turn Logic
  useEffect(() => {
    if (phase !== 'ENEMY_TURN') return;
    
    const timer = setTimeout(() => {
      // AI plays cards
      const playableCards = enemy.hand
        .filter(card => card.cost <= enemy.mana && card.type === 'CREATURE' && enemy.field.length < 7)
        .sort((a, b) => b.cost - a.cost);
      
      for (const card of playableCards) {
        dispatch({ type: 'PLAY_CARD', card });
      }
      
      // AI attacks
      setTimeout(() => {
        for (const creature of enemy.field) {
          if (creature.canAttack && !creature.hasAttacked) {
            const hasTaunt = player.field.some(c => c.effects.includes('TAUNT'));
            if (hasTaunt) {
              const tauntCard = player.field.find(c => c.effects.includes('TAUNT'));
              if (tauntCard) {
                dispatch({ type: 'ATTACK', attacker: creature, target: tauntCard });
              }
            } else {
              dispatch({ type: 'ATTACK', attacker: creature, target: 'enemy_hero' });
            }
          }
        }
        
        // End enemy turn
        setTimeout(() => {
          dispatch({ type: 'END_ENEMY_TURN' });
        }, 500);
      }, 500);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [phase, enemy, player, dispatch]);
  
  const handleCardClick = useCallback((card: any) => {
    if (phase !== 'PLAYER_TURN') return;
    
    if (selectedCard && selectedCard.instanceId === card.instanceId) {
      // Clicking same card - deselect or play
      dispatch({ type: 'DESELECT_CARD' });
    } else if (!selectedCard) {
      // Select card
      dispatch({ type: 'SELECT_CARD', card });
    }
  }, [phase, selectedCard, dispatch]);
  
  const handlePlayCard = useCallback(() => {
    if (!selectedCard) return;
    if (selectedCard.cost > player.mana) return;
    
    playCard(selectedCard);
  }, [selectedCard, player.mana, playCard]);
  
  const handleFieldCardClick = useCallback((card: any) => {
    if (phase !== 'PLAYER_TURN') return;
    
    // If we have a selected card and it's a creature, attack
    if (selectedCard && selectedCard.type === 'CREATURE') {
      if (selectedCard.canAttack && !selectedCard.hasAttacked) {
        attack(selectedCard, card);
        dispatch({ type: 'DESELECT_CARD' });
      }
    }
  }, [phase, selectedCard, attack, dispatch]);
  
  const handleAttackHero = useCallback(() => {
    if (!selectedCard) return;
    if (selectedCard.type !== 'CREATURE') return;
    if (!selectedCard.canAttack || selectedCard.hasAttacked) return;
    
    // Check for taunt
    if (enemy.field.some(c => c.effects.includes('TAUNT'))) {
      return; // Can't attack hero directly
    }
    
    attack(selectedCard, 'enemy_hero');
    dispatch({ type: 'DESELECT_CARD' });
  }, [selectedCard, enemy.field, attack, dispatch]);
  
  const handleEndTurn = useCallback(() => {
    if (phase !== 'PLAYER_TURN') return;
    endTurn();
  }, [phase, endTurn]);
  
  const canPlayCard = selectedCard && selectedCard.cost <= player.mana && selectedCard.type === 'CREATURE';
  
  return (
    <div className="battle">
      {/* Enemy Info */}
      <div className="player-info enemy-info">
        <div className="player-avatar">🤖</div>
        <div className="player-stats">
          <div className="health-bar">
            <div 
              className="health-fill" 
              style={{ width: `${(enemy.health / enemy.maxHealth) * 100}%` }}
            />
            <span className="health-text">{enemy.health}/{enemy.maxHealth}</span>
          </div>
          {enemy.armor > 0 && (
            <div className="armor">🛡️ {enemy.armor}</div>
          )}
        </div>
        <div className="mana-display">
          <span className="mana-label">法力</span>
          <span className="mana-value">{enemy.mana}/{enemy.maxMana}</span>
        </div>
      </div>
      
      {/* Enemy Hand */}
      <div className="hand enemy-hand">
        {enemy.hand.map((_, i) => (
          <Card key={i} card={{} as any} showBack inHand />
        ))}
      </div>
      
      {/* Enemy Field */}
      <div className="field enemy-field">
        {enemy.field.map(card => (
          <div 
            key={card.instanceId}
            className={`field-card-wrapper ${selectedCard && selectedCard.type === 'CREATURE' && selectedCard.canAttack && !selectedCard.hasAttacked ? 'can-be-targeted' : ''}`}
          >
            <Card 
              card={card}
              onClick={() => handleFieldCardClick(card)}
              showTarget={selectedCard !== null && selectedCard.type === 'CREATURE'}
            />
          </div>
        ))}
      </div>
      
      {/* Center Divider */}
      <div className="field-divider">
        <button 
          className="attack-hero-btn"
          onClick={handleAttackHero}
          disabled={!canPlayCard}
        >
          ⚔️ 攻击英雄
        </button>
      </div>
      
      {/* Player Field */}
      <div className="field player-field">
        {player.field.map(card => (
          <Card 
            key={card.instanceId}
            card={card}
            canAttack={card.canAttack && !card.hasAttacked}
          />
        ))}
      </div>
      
      {/* Player Hand */}
      <div className="hand player-hand">
        {player.hand.map(card => (
          <Card 
            key={card.instanceId}
            card={card}
            onClick={() => handleCardClick(card)}
            isSelected={selectedCard?.instanceId === card.instanceId}
            isPlayable={card.cost <= player.mana}
            inHand
          />
        ))}
      </div>
      
      {/* Play Card Button */}
      {selectedCard && selectedCard.type === 'CREATURE' && canPlayCard && (
        <button className="play-card-btn" onClick={handlePlayCard}>
          出牌: {selectedCard.name}
        </button>
      )}
      
      {/* Player Info */}
      <div className="player-info player-info-bottom">
        <div className="player-avatar">🧙</div>
        <div className="player-stats">
          <div className="health-bar">
            <div 
              className="health-fill player-health"
              style={{ width: `${(player.health / player.maxHealth) * 100}%` }}
            />
            <span className="health-text">{player.health}/{player.maxHealth}</span>
          </div>
          {player.armor > 0 && (
            <div className="armor">🛡️ {player.armor}</div>
          )}
        </div>
        <div className="mana-display">
          <span className="mana-label">法力</span>
          <span className="mana-value">{player.mana}/{player.maxMana}</span>
        </div>
        <button 
          className="end-turn-btn"
          onClick={handleEndTurn}
          disabled={phase !== 'PLAYER_TURN'}
        >
          结束回合
        </button>
      </div>
      
      {/* Turn indicator */}
      <div className="turn-indicator">
        第 {turn} 回合 • {phase === 'PLAYER_TURN' ? '你的回合' : '敌方回合'}
      </div>
      
      {/* Action Log */}
      {state.lastAction && (
        <div className="action-log">{state.lastAction}</div>
      )}
    </div>
  );
}
