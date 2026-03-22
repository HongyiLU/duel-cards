// Card Database

import type { CardData } from '../types';

export const CARDS: Record<string, CardData> = {
  // === 生物卡 ===
  
  // 1费
  'steel_soldier': {
    id: 'steel_soldier',
    name: '钢铁士兵',
    cost: 1,
    attack: 1,
    health: 2,
    type: 'CREATURE',
    rarity: 'COMMON',
    description: '-',
    effects: [],
  },
  
  // 2费
  'flame_apprentice': {
    id: 'flame_apprentice',
    name: '火焰学徒',
    cost: 2,
    attack: 2,
    health: 2,
    type: 'CREATURE',
    rarity: 'COMMON',
    description: '-',
    effects: [],
  },
  'shadow_assassin': {
    id: 'shadow_assassin',
    name: '暗影刺客',
    cost: 2,
    attack: 3,
    health: 1,
    type: 'CREATURE',
    rarity: 'RARE',
    description: '冲锋',
    effects: ['CHARGE'],
  },
  
  // 3费
  'forest_guardian': {
    id: 'forest_guardian',
    name: '森林守卫',
    cost: 3,
    attack: 2,
    health: 4,
    type: 'CREATURE',
    rarity: 'RARE',
    description: '嘲讽',
    effects: ['TAUNT'],
  },
  'holy_knight': {
    id: 'holy_knight',
    name: '圣光骑士',
    cost: 3,
    attack: 3,
    health: 3,
    type: 'CREATURE',
    rarity: 'RARE',
    description: '战吼: 恢复3点生命',
    effects: ['BATTLECRY'],
  },
  
  // 4费
  'thunder_giant': {
    id: 'thunder_giant',
    name: '雷霆巨人',
    cost: 4,
    attack: 4,
    health: 5,
    type: 'CREATURE',
    rarity: 'EPIC',
    description: '-',
    effects: [],
  },
  
  // 5费
  'frost_dragon': {
    id: 'frost_dragon',
    name: '冰霜巨龙',
    cost: 5,
    attack: 5,
    health: 6,
    type: 'CREATURE',
    rarity: 'LEGENDARY',
    description: '战吼: 冻结一个敌方单位',
    effects: ['BATTLECRY'],
  },
  
  // 6费
  'shadow_lord': {
    id: 'shadow_lord',
    name: '暗影领主',
    cost: 6,
    attack: 6,
    health: 6,
    type: 'CREATURE',
    rarity: 'LEGENDARY',
    description: '战吼: 对敌方英雄造成2点伤害',
    effects: ['BATTLECRY'],
  },
  
  // === 法术卡 ===
  
  'emp_blast': {
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
  'energy_shield': {
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
  'lightning_strike': {
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
  'healing_light': {
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
};

// Get all cards as array
export function getAllCards(): CardData[] {
  return Object.values(CARDS);
}

// Get card by ID
export function getCardById(id: string): CardData | undefined {
  return CARDS[id];
}

// Get cards by rarity
export function getCardsByRarity(rarity: string): CardData[] {
  return getAllCards().filter(card => card.rarity === rarity);
}

// Get cards by type
export function getCardsByType(type: 'CREATURE' | 'SPELL'): CardData[] {
  return getAllCards().filter(card => card.type === type);
}
