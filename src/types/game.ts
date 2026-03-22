// Game State Types

import type { Card } from './card';

export type GamePhase = 
  | 'MENU'           // 主菜单
  | 'DECK_SELECT'    // 卡组选择
  | 'PLAYER_TURN'    // 玩家回合
  | 'ENEMY_TURN'     // 敌人回合
  | 'VICTORY'        // 胜利
  | 'DEFEAT';        // 失败

export interface Player {
  name: string;
  health: number;
  maxHealth: number;
  armor: number;       // 护甲
  mana: number;        // 当前法力
  maxMana: number;     // 最大法力
  hand: Card[];        // 手牌
  deck: Card[];        // 卡组
  field: Card[];       // 战场上的生物
  deckId: string;      // 卡组ID
}

export interface GameState {
  phase: GamePhase;
  turn: number;
  currentPlayer: 'player' | 'enemy';
  player: Player;
  enemy: Player;
  selectedCard: Card | null;      // 选中的卡牌
  selectedFieldCard: Card | null; // 选中战场上的卡牌
  turnStartTime: number;
  lastAction: string | null;
}

export interface Deck {
  id: string;
  name: string;
  cards: string[];  // 卡牌ID列表
}

// Create initial player state
export function createPlayer(name: string, deckId: string, deckCards: Card[]): Player {
  return {
    name,
    health: 30,
    maxHealth: 30,
    armor: 0,
    mana: 1,
    maxMana: 1,
    hand: [],
    deck: [...deckCards],
    field: [],
    deckId,
  };
}

// Create initial game state
export function createGameState(playerDeck: Card[], enemyDeck: Card[]): GameState {
  return {
    phase: 'PLAYER_TURN',
    turn: 1,
    currentPlayer: 'player',
    player: createPlayer('玩家', 'deck1', playerDeck),
    enemy: createPlayer('AI对手', 'deck2', enemyDeck),
    selectedCard: null,
    selectedFieldCard: null,
    turnStartTime: Date.now(),
    lastAction: null,
  };
}
