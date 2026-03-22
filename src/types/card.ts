// Card Types

export type CardRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export type CardType = 'CREATURE' | 'SPELL';

export type SpecialEffect = 
  | 'CHARGE'      // 冲锋: 可以立即攻击
  | 'TAUNT'       // 嘲讽: 必须优先被攻击
  | 'DEATHRATTLE' // 亡语: 死亡时触发效果
  | 'BATTLECRY';  // 战吼: 出场时触发效果

export interface Card {
  id: string;
  instanceId: string;     // 战场实例ID
  name: string;
  cost: number;           // 法力费用
  attack: number;         // 攻击力
  health: number;         // 生命值
  maxHealth: number;      // 最大生命值
  type: CardType;
  rarity: CardRarity;
  description: string;
  effects: SpecialEffect[];
  currentHealth?: number;  // 当前生命值（战斗中）
  canAttack?: boolean;    // 是否可以攻击（冲锋）
  hasAttacked?: boolean;  // 本回合是否已攻击
}

export interface CardData {
  id: string;
  name: string;
  cost: number;
  attack: number;
  health: number;
  type: CardType;
  rarity: CardRarity;
  description: string;
  effects: SpecialEffect[];
}

// Create a battle card from card data
export function createBattleCard(cardData: CardData): Card {
  return {
    ...cardData,
    instanceId: `${cardData.id}_${Date.now()}_${Math.random()}`,
    currentHealth: cardData.health,
    maxHealth: cardData.health,
    canAttack: cardData.effects.includes('CHARGE'),
    hasAttacked: false,
  };
}

// Clone a card for hand/deck
export function cloneCard(card: Card): Card {
  return { ...card };
}
