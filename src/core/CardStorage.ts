// Card Storage - 卡牌数据持久化管理

import type { CardData } from '../types';

const STORAGE_KEY = 'duel_cards_custom_cards';

// 默认卡牌数据
const DEFAULT_CARDS: CardData[] = [
  // 生物卡
  {
    id: 'steel_soldier',
    name: '钢铁士兵',
    cost: 1,
    attack: 1,
    health: 2,
    type: 'CREATURE',
    rarity: 'COMMON',
    description: '基础近战单位',
    effects: [],
  },
  {
    id: 'flame_apprentice',
    name: '火焰学徒',
    cost: 2,
    attack: 2,
    health: 2,
    type: 'CREATURE',
    rarity: 'COMMON',
    description: '火焰系初级法师',
    effects: [],
  },
  {
    id: 'shadow_assassin',
    name: '暗影刺客',
    cost: 2,
    attack: 3,
    health: 1,
    type: 'CREATURE',
    rarity: 'RARE',
    description: '高攻击低生命，爆发型单位',
    effects: ['CHARGE'],
  },
  {
    id: 'forest_guardian',
    name: '森林守卫',
    cost: 3,
    attack: 2,
    health: 4,
    type: 'CREATURE',
    rarity: 'RARE',
    description: '高生命嘲讽单位',
    effects: ['TAUNT'],
  },
  {
    id: 'holy_knight',
    name: '圣光骑士',
    cost: 3,
    attack: 3,
    health: 3,
    type: 'CREATURE',
    rarity: 'RARE',
    description: '战吼：恢复3点生命',
    effects: ['BATTLECRY'],
  },
  {
    id: 'thunder_giant',
    name: '雷霆巨人',
    cost: 4,
    attack: 4,
    health: 5,
    type: 'CREATURE',
    rarity: 'EPIC',
    description: '强力大型单位',
    effects: [],
  },
  {
    id: 'frost_dragon',
    name: '冰霜巨龙',
    cost: 5,
    attack: 5,
    health: 6,
    type: 'CREATURE',
    rarity: 'LEGENDARY',
    description: '传说级冰霜巨龙',
    effects: ['BATTLECRY'],
  },
  {
    id: 'shadow_lord',
    name: '暗影领主',
    cost: 6,
    attack: 6,
    health: 6,
    type: 'CREATURE',
    rarity: 'LEGENDARY',
    description: '暗影系领主',
    effects: ['BATTLECRY'],
  },
  // 法术卡
  {
    id: 'emp_blast',
    name: '电磁脉冲',
    cost: 2,
    attack: 0,
    health: 0,
    type: 'SPELL',
    rarity: 'COMMON',
    description: '对所有敌方单位造成1点伤害',
    effects: [],
  },
  {
    id: 'energy_shield',
    name: '能量护盾',
    cost: 1,
    attack: 0,
    health: 0,
    type: 'SPELL',
    rarity: 'COMMON',
    description: '获得3点护甲',
    effects: [],
  },
  {
    id: 'lightning_strike',
    name: '闪电打击',
    cost: 3,
    attack: 0,
    health: 0,
    type: 'SPELL',
    rarity: 'RARE',
    description: '造成4点伤害',
    effects: [],
  },
  {
    id: 'healing_light',
    name: '治疗之光',
    cost: 2,
    attack: 0,
    health: 0,
    type: 'SPELL',
    rarity: 'COMMON',
    description: '恢复5点生命',
    effects: [],
  },
];

/**
 * 获取所有卡牌（自定义 + 默认）
 */
export function getAllCards(): CardData[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return data.cards || DEFAULT_CARDS;
    }
    // 首次使用，初始化默认数据
    saveAllCards(DEFAULT_CARDS);
    return DEFAULT_CARDS;
  } catch (error) {
    console.error('[CardStorage] Failed to load cards:', error);
    return DEFAULT_CARDS;
  }
}

/**
 * 保存所有卡牌
 */
export function saveAllCards(cards: CardData[]): void {
  try {
    const data = {
      cards,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log('[CardStorage] Saved', cards.length, 'cards');
  } catch (error) {
    console.error('[CardStorage] Failed to save cards:', error);
  }
}

/**
 * 获取单个卡牌
 */
export function getCardById(id: string): CardData | undefined {
  const cards = getAllCards();
  return cards.find(c => c.id === id);
}

/**
 * 保存单个卡牌（新增或更新）
 */
export function saveCard(card: CardData): void {
  const cards = getAllCards();
  const index = cards.findIndex(c => c.id === card.id);
  
  if (index !== -1) {
    cards[index] = card;
    console.log('[CardStorage] Updated card:', card.id);
  } else {
    cards.push(card);
    console.log('[CardStorage] Added new card:', card.id);
  }
  
  saveAllCards(cards);
}

/**
 * 删除卡牌
 */
export function deleteCard(id: string): void {
  const cards = getAllCards();
  const filtered = cards.filter(c => c.id !== id);
  
  if (filtered.length < cards.length) {
    saveAllCards(filtered);
    console.log('[CardStorage] Deleted card:', id);
  }
}

/**
 * 批量删除卡牌
 */
export function deleteCards(ids: string[]): void {
  const cards = getAllCards();
  const filtered = cards.filter(c => !ids.includes(c.id));
  
  if (filtered.length < cards.length) {
    saveAllCards(filtered);
    console.log('[CardStorage] Deleted', cards.length - filtered.length, 'cards');
  }
}

/**
 * 重置为默认卡牌
 */
export function resetToDefault(): void {
  saveAllCards(DEFAULT_CARDS);
  console.log('[CardStorage] Reset to default cards');
}

/**
 * 生成唯一 ID
 */
export function generateCardId(): string {
  return `custom_card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 验证卡牌数据
 */
export function validateCard(card: Partial<CardData>): string[] {
  const errors: string[] = [];
  
  if (!card.name || card.name.trim() === '') {
    errors.push('卡牌名称不能为空');
  }
  
  if (card.cost === undefined || card.cost < 0 || card.cost > 10) {
    errors.push('费用必须在 0-10 之间');
  }
  
  if (card.type === 'CREATURE') {
    if (card.attack === undefined || card.attack < 0) {
      errors.push('生物卡攻击力不能为负');
    }
    if (card.health === undefined || card.health < 1) {
      errors.push('生物卡生命值至少为 1');
    }
  }
  
  return errors;
}
