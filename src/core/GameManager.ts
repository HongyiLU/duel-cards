// Game Manager - Core game logic

import type { Card } from '../types/card';
import type { GameState } from '../types/game';

export type GameAction =
  | { type: 'INIT_GAME'; playerDeckId: string; enemyDeckId: string; playerCards: Card[]; enemyCards: Card[] }
  | { type: 'SELECT_CARD'; card: Card }
  | { type: 'DESELECT_CARD' }
  | { type: 'PLAY_CARD'; card: Card }
  | { type: 'ATTACK'; attacker: Card; target: Card | 'enemy_hero' }
  | { type: 'END_TURN' }
  | { type: 'START_ENEMY_TURN' }
  | { type: 'END_ENEMY_TURN' }
  | { type: 'RESOLVE_BATTLECRY'; card: Card; target?: Card | 'enemy_hero' }
  | { type: 'DAMAGE_TO_HERO'; target: 'player' | 'enemy'; amount: number }
  | { type: 'DAMAGE_TO_CARD'; card: Card; amount: number }
  | { type: 'HEAL_HERO'; target: 'player' | 'enemy'; amount: number }
  | { type: 'ADD_ARMOR'; target: 'player' | 'enemy'; amount: number }
  | { type: 'GAME_OVER'; winner: 'player' | 'enemy' }
  | { type: 'RESOLVE_SPELL'; card: Card; target?: Card };

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'INIT_GAME': {
      const newState: GameState = {
        phase: 'PLAYER_TURN',
        turn: 1,
        currentPlayer: 'player',
        player: {
          name: '玩家',
          health: 30,
          maxHealth: 30,
          armor: 0,
          mana: 1,
          maxMana: 1,
          hand: action.playerCards.slice(0, 3),
          deck: action.playerCards.slice(3),
          field: [],
          deckId: action.playerDeckId,
        },
        enemy: {
          name: 'AI对手',
          health: 30,
          maxHealth: 30,
          armor: 0,
          mana: 0,
          maxMana: 0,
          hand: action.enemyCards.slice(0, 3),
          deck: action.enemyCards.slice(3),
          field: [],
          deckId: action.enemyDeckId,
        },
        selectedCard: null,
        selectedFieldCard: null,
        turnStartTime: Date.now(),
        lastAction: '游戏开始!',
      };
      
      return newState;
    }
    
    case 'SELECT_CARD': {
      return {
        ...state,
        selectedCard: action.card,
        selectedFieldCard: null,
      };
    }
    
    case 'DESELECT_CARD': {
      return {
        ...state,
        selectedCard: null,
        selectedFieldCard: null,
      };
    }
    
    case 'PLAY_CARD': {
      if (state.phase !== 'PLAYER_TURN') return state;
      
      const card = action.card;
      const player = state.player;
      
      // Check if player has enough mana
      if (player.mana < card.cost) return state;
      
      // Remove card from hand
      const newHand = player.hand.filter(c => c.id !== card.id || c.instanceId !== card.instanceId);
      
      // Spend mana
      const newMana = player.mana - card.cost;
      
      if (card.type === 'CREATURE') {
        // Add to field
        const creatureCard = { ...card, canAttack: true, hasAttacked: false };
        const newField = [...player.field, creatureCard];
        
        return {
          ...state,
          player: {
            ...player,
            hand: newHand,
            mana: newMana,
            field: newField,
          },
          selectedCard: null,
          lastAction: `出牌: ${card.name}`,
        };
      } else {
        // Spell card - resolve immediately
        return resolveSpell(state, card, 'player');
      }
    }
    
    case 'ATTACK': {
      if (state.phase !== 'PLAYER_TURN') return state;
      
      const { attacker, target } = action;
      
      if (attacker.hasAttacked) return state;
      
      let newState = { ...state };
      
      if (target === 'enemy_hero') {
        // Attack enemy hero
        const damage = attacker.attack;
        newState = applyDamageToHero(newState, 'enemy', damage);
        newState.player = {
          ...newState.player,
          field: newState.player.field.map(c => 
            c.instanceId === attacker.instanceId ? { ...c, hasAttacked: true } : c
          ),
        };
      } else {
        // Attack enemy creature
        newState = applyDamageToCreature(newState, attacker, target);
      }
      
      return {
        ...newState,
        selectedFieldCard: null,
        lastAction: `${attacker.name} 攻击了 ${target === 'enemy_hero' ? '敌方英雄' : target.name}`,
      };
    }
    
    case 'END_TURN': {
      if (state.phase !== 'PLAYER_TURN') return state;
      
      return {
        ...state,
        phase: 'ENEMY_TURN',
        currentPlayer: 'enemy',
        selectedCard: null,
        selectedFieldCard: null,
        turnStartTime: Date.now(),
      };
    }
    
    case 'START_ENEMY_TURN': {
      const newState = startNewTurn(state, 'enemy');
      return {
        ...newState,
        phase: 'ENEMY_TURN',
        currentPlayer: 'enemy',
        lastAction: '敌方回合开始',
      };
    }
    
    case 'END_ENEMY_TURN': {
      // Start player turn
      const newState = startNewTurn(state, 'player');
      return {
        ...newState,
        phase: 'PLAYER_TURN',
        currentPlayer: 'player',
        turn: state.turn + 1,
        lastAction: '你的回合',
      };
    }
    
    case 'GAME_OVER': {
      return {
        ...state,
        phase: action.winner === 'player' ? 'VICTORY' : 'DEFEAT',
        lastAction: action.winner === 'player' ? '胜利!' : '失败...',
      };
    }
    
    default:
      return state;
  }
}

function startNewTurn(state: GameState, who: 'player' | 'enemy'): GameState {
  const target = who === 'player' ? state.player : state.enemy;
  
  // Increase max mana (cap at 10)
  const newMaxMana = Math.min(target.maxMana + 1, 10);
  
  // Restore mana to max
  const newMana = newMaxMana;
  
  // Reset creature attack states
  const newField = target.field.map(c => ({
    ...c,
    canAttack: true,
    hasAttacked: false,
  }));
  
  // Draw a card
  let newDeck = [...target.deck];
  let newHand = [...target.hand];
  
  if (newDeck.length > 0) {
    const card = newDeck.pop();
    if (card && newHand.length < 10) {
      newHand.push(card);
    }
  }
  
  const updatedTarget = {
    ...target,
    maxMana: newMaxMana,
    mana: newMana,
    field: newField,
    deck: newDeck,
    hand: newHand,
  };
  
  if (who === 'player') {
    return { ...state, player: updatedTarget };
  } else {
    return { ...state, enemy: updatedTarget };
  }
}

function resolveSpell(state: GameState, card: Card, caster: 'player' | 'enemy'): GameState {
  let newState = { ...state };
  
  switch (card.id) {
    case 'emp_blast': {
      // Deal 1 damage to all enemy creatures
      const enemyField = state.enemy.field.map(c => ({
        ...c,
        currentHealth: (c.currentHealth || c.health) - 1,
      })).filter(c => (c.currentHealth || 0) > 0);
      
      if (caster === 'player') {
        newState.enemy = { ...newState.enemy, field: enemyField };
      } else {
        newState.player = { ...newState.player, field: enemyField };
      }
      break;
    }
    
    case 'energy_shield': {
      // Add 3 armor
      const amount = 3;
      if (caster === 'player') {
        newState.player = { ...newState.player, armor: newState.player.armor + amount };
      } else {
        newState.enemy = { ...newState.enemy, armor: newState.enemy.armor + amount };
      }
      break;
    }
    
    case 'lightning_strike': {
      // Deal 4 damage to a random enemy creature or enemy hero
      if (state.enemy.field.length > 0) {
        const randomIndex = Math.floor(Math.random() * state.enemy.field.length);
        const targetCard = state.enemy.field[randomIndex];
        return applyDamageToCreature(newState, { attack: 4 } as Card, targetCard);
      } else {
        return applyDamageToHero(newState, caster === 'player' ? 'enemy' : 'player', 4);
      }
    }
    
    case 'healing_light': {
      // Heal 5
      const target = caster === 'player' ? 'player' : 'enemy';
      return applyHeal(newState, target, 5);
    }
  }
  
  // Remove spell from hand
  if (caster === 'player') {
    newState.player = {
      ...newState.player,
      hand: newState.player.hand.filter(c => c.id !== card.id),
    };
  } else {
    newState.enemy = {
      ...newState.enemy,
      hand: newState.enemy.hand.filter(c => c.id !== card.id),
    };
  }
  
  return newState;
}

function applyDamageToHero(state: GameState, target: 'player' | 'enemy', damage: number): GameState {
  const targetPlayer = target === 'player' ? state.player : state.enemy;
  
  // Damage armor first
  let remainingDamage = damage;
  let newArmor = targetPlayer.armor;
  
  if (newArmor > 0) {
    if (newArmor >= remainingDamage) {
      newArmor -= remainingDamage;
      remainingDamage = 0;
    } else {
      remainingDamage -= newArmor;
      newArmor = 0;
    }
  }
  
  const newHealth = targetPlayer.health - remainingDamage;
  
  const updatedTarget = {
    ...targetPlayer,
    armor: newArmor,
    health: newHealth,
  };
  
  let newState = target === 'player' 
    ? { ...state, player: updatedTarget }
    : { ...state, enemy: updatedTarget };
  
  // Check for death
  if (newHealth <= 0) {
    return gameReducer(newState, { 
      type: 'GAME_OVER', 
      winner: target === 'player' ? 'enemy' : 'player' 
    });
  }
  
  return newState;
}

function applyDamageToCreature(state: GameState, attacker: Card, target: Card): GameState {
  const isPlayerAttacker = state.player.field.some(c => c.instanceId === attacker.instanceId);
  const attackerField = isPlayerAttacker ? state.player.field : state.enemy.field;
  const defenderField = isPlayerAttacker ? state.enemy.field : state.player.field;
  
  // Calculate damage
  const targetIndex = defenderField.findIndex(c => c.instanceId === target.instanceId);
  if (targetIndex === -1) return state;
  
  let targetCard = { ...defenderField[targetIndex] };
  targetCard.currentHealth = (targetCard.currentHealth || targetCard.health) - attacker.attack;
  
  // Attacker also takes damage if target has attack
  let attackerCard = { ...attacker };
  if (attacker.attack > 0) {
    attackerCard.currentHealth = (attackerCard.currentHealth || attackerCard.health) - target.attack;
  }
  
  // Update fields
  let newDefenderField = [...defenderField];
  if ((targetCard.currentHealth || 0) <= 0) {
    newDefenderField = newDefenderField.filter(c => c.instanceId !== target.instanceId);
  } else {
    newDefenderField[targetIndex] = targetCard;
  }
  
  let newAttackerField = [...attackerField];
  if ((attackerCard.currentHealth || 0) <= 0) {
    newAttackerField = newAttackerField.filter(c => c.instanceId !== attacker.instanceId);
  } else {
    const attackerIndex = newAttackerField.findIndex(c => c.instanceId === attacker.instanceId);
    if (attackerIndex !== -1) {
      newAttackerField[attackerIndex] = { ...attackerCard, hasAttacked: true };
    }
  }
  
  if (isPlayerAttacker) {
    return {
      ...state,
      player: { ...state.player, field: newAttackerField },
      enemy: { ...state.enemy, field: newDefenderField },
    };
  } else {
    return {
      ...state,
      enemy: { ...state.enemy, field: newAttackerField },
      player: { ...state.player, field: newDefenderField },
    };
  }
}

function applyHeal(state: GameState, target: 'player' | 'enemy', amount: number): GameState {
  const targetPlayer = target === 'player' ? state.player : state.enemy;
  const newHealth = Math.min(targetPlayer.health + amount, targetPlayer.maxHealth);
  
  const updatedTarget = {
    ...targetPlayer,
    health: newHealth,
  };
  
  return target === 'player' 
    ? { ...state, player: updatedTarget }
    : { ...state, enemy: updatedTarget };
}

// Simple AI logic
export function enemyAI(state: GameState): GameAction[] {
  const actions: GameAction[] = [];
  const enemy = state.enemy;
  
  // Start turn
  actions.push({ type: 'START_ENEMY_TURN' });
  
  // Play cards if possible
  const playableCards = enemy.hand
    .filter(card => card.cost <= enemy.mana)
    .sort((a, b) => b.cost - a.cost); // Play expensive cards first
  
  for (const card of playableCards) {
    if (card.type === 'CREATURE' && enemy.field.length < 7) {
      actions.push({ type: 'PLAY_CARD', card });
    }
  }
  
  // Attack with creatures
  for (const creature of enemy.field) {
    if (creature.canAttack && !creature.hasAttacked) {
      // Prefer attacking player directly if no taunt
      const hasTaunt = state.player.field.some(c => c.effects.includes('TAUNT'));
      
      if (hasTaunt) {
        // Attack taunt first
        const tauntCard = state.player.field.find(c => c.effects.includes('TAUNT'));
        if (tauntCard) {
          actions.push({ type: 'ATTACK', attacker: creature, target: tauntCard });
        }
      } else {
        // Attack hero
        actions.push({ type: 'ATTACK', attacker: creature, target: 'enemy_hero' });
      }
    }
  }
  
  // End turn
  actions.push({ type: 'END_ENEMY_TURN' });
  
  return actions;
}

// Add instanceId to cards
export function assignInstanceIds(cards: Card[]): Card[] {
  return cards.map((card, index) => ({
    ...card,
    instanceId: `${card.id}_${Date.now()}_${index}`,
  }));
}
