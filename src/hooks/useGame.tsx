// Game Context and Hook

import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import type { GameState } from '../types';
import { gameReducer, type GameAction } from '../core';
import { getCardById } from '../data';
import { createBattleCard } from '../types/card';

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  startGame: (playerDeckId: string, enemyDeckId: string) => void;
  playCard: (card: any) => void;
  attack: (attacker: any, target: any) => void;
  endTurn: () => void;
  selectCard: (card: any) => void;
  deselectCard: () => void;
}

const initialState: GameState = {
  phase: 'MENU',
  turn: 0,
  currentPlayer: 'player',
  player: {
    name: '玩家',
    health: 30,
    maxHealth: 30,
    armor: 0,
    mana: 0,
    maxMana: 0,
    hand: [],
    deck: [],
    field: [],
    deckId: '',
  },
  enemy: {
    name: 'AI对手',
    health: 30,
    maxHealth: 30,
    armor: 0,
    mana: 0,
    maxMana: 0,
    hand: [],
    deck: [],
    field: [],
    deckId: '',
  },
  selectedCard: null,
  selectedFieldCard: null,
  turnStartTime: 0,
  lastAction: null,
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  
  const startGame = useCallback((playerDeckId: string, enemyDeckId: string) => {
    // Create decks with instance IDs
    const playerCards = Array.from({ length: 20 }, (_, i) => {
      const cardIds = [
        'steel_soldier', 'flame_apprentice', 'shadow_assassin',
        'forest_guardian', 'thunder_giant', 'holy_knight',
        'emp_blast', 'energy_shield', 'lightning_strike', 'healing_light',
      ];
      const cardId = cardIds[i % cardIds.length];
      const cardData = getCardById(cardId);
      if (!cardData) return null;
      return { ...createBattleCard(cardData), instanceId: `player_${cardId}_${i}` };
    }).filter(Boolean) as any[];
    
    const enemyCards = Array.from({ length: 20 }, (_, i) => {
      const cardIds = [
        'steel_soldier', 'flame_apprentice', 'shadow_assassin',
        'forest_guardian', 'thunder_giant', 'holy_knight',
        'emp_blast', 'energy_shield', 'lightning_strike', 'healing_light',
      ];
      const cardId = cardIds[i % cardIds.length];
      const cardData = getCardById(cardId);
      if (!cardData) return null;
      return { ...createBattleCard(cardData), instanceId: `enemy_${cardId}_${i}` };
    }).filter(Boolean) as any[];
    
    // Shuffle
    for (let i = playerCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [playerCards[i], playerCards[j]] = [playerCards[j], playerCards[i]];
    }
    for (let i = enemyCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [enemyCards[i], enemyCards[j]] = [enemyCards[j], enemyCards[i]];
    }
    
    dispatch({ 
      type: 'INIT_GAME', 
      playerDeckId, 
      enemyDeckId,
      playerCards,
      enemyCards,
    });
  }, []);
  
  const playCard = useCallback((card: any) => {
    dispatch({ type: 'PLAY_CARD', card });
  }, []);
  
  const attack = useCallback((attacker: any, target: any) => {
    dispatch({ type: 'ATTACK', attacker, target });
  }, []);
  
  const endTurn = useCallback(() => {
    dispatch({ type: 'END_TURN' });
  }, []);
  
  const selectCard = useCallback((card: any) => {
    dispatch({ type: 'SELECT_CARD', card });
  }, []);
  
  const deselectCard = useCallback(() => {
    dispatch({ type: 'DESELECT_CARD' });
  }, []);
  
  return (
    <GameContext.Provider value={{
      state,
      dispatch,
      startGame,
      playCard,
      attack,
      endTurn,
      selectCard,
      deselectCard,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}
