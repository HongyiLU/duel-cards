// CustomEffectsStorage Tests - 效果存储模块测试

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { CardEffectDefinition } from '../core/effects/types';

// Mock localStorage
const mockStorage: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, value: string) => { mockStorage[key] = value; },
  removeItem: (key: string) => { delete mockStorage[key]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); },
};

Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// 测试数据
const mockDefinition: CardEffectDefinition = {
  cardId: 'holy_knight',
  trigger: 'ON_PLAY',
  effects: [
    { id: 'effect_1', type: 'DAMAGE', value: 3, target: 'ENEMY' },
    { id: 'effect_2', type: 'HEAL', value: 2, target: 'ALLY_HERO' },
  ],
  description: '战吼：对敌方随从造成3点伤害，为你恢复2点生命',
};

// 辅助函数：清空 mockStorage
function clearStorage(): void {
  mockLocalStorage.clear();
}

// 导入被测试的函数（在 mock 之后）
import {
  saveCardEffect,
  getCustomEffectForCard,
  getCustomCardEffects,
  removeCustomEffect,
  clearAllCustomEffects,
} from '../core/effects/storage';

describe('CustomEffectsStorage', () => {
  beforeEach(() => {
    clearStorage();
  });

  afterEach(() => {
    clearStorage();
  });

  describe('saveCardEffect', () => {
    it('应该保存新的卡牌效果', () => {
      saveCardEffect(mockDefinition);
      
      const saved = getCustomEffectForCard('holy_knight');
      expect(saved).toBeDefined();
      expect(saved?.cardId).toBe('holy_knight');
      expect(saved?.effects).toHaveLength(2);
    });

    it('应该覆盖已存在的卡牌效果', () => {
      // 第一次保存
      saveCardEffect(mockDefinition);
      
      // 修改后保存
      const updated: CardEffectDefinition = {
        ...mockDefinition,
        effects: [
          { id: 'effect_1', type: 'DAMAGE', value: 5, target: 'ENEMY' },
        ],
        description: '战吼：对敌方随从造成5点伤害',
      };
      saveCardEffect(updated);
      
      const allEffects = getCustomCardEffects();
      expect(allEffects).toHaveLength(1);
      
      const saved = getCustomEffectForCard('holy_knight');
      expect(saved?.effects[0].value).toBe(5);
    });

    it('应该支持保存多个不同卡牌的效果', () => {
      const card1: CardEffectDefinition = {
        ...mockDefinition,
        cardId: 'card_1',
      };
      const card2: CardEffectDefinition = {
        ...mockDefinition,
        cardId: 'card_2',
      };
      
      saveCardEffect(card1);
      saveCardEffect(card2);
      
      const allEffects = getCustomCardEffects();
      expect(allEffects).toHaveLength(2);
    });
  });

  describe('getCustomEffectForCard', () => {
    it('应该返回已保存的卡牌效果', () => {
      saveCardEffect(mockDefinition);
      
      const result = getCustomEffectForCard('holy_knight');
      expect(result).toBeDefined();
      expect(result?.cardId).toBe('holy_knight');
    });

    it('应该对不存在的卡牌返回 undefined', () => {
      const result = getCustomEffectForCard('non_existent_card');
      expect(result).toBeUndefined();
    });
  });

  describe('getCustomCardEffects', () => {
    it('应该在没有数据时返回空数组', () => {
      const result = getCustomCardEffects();
      expect(result).toEqual([]);
    });

    it('应该返回所有已保存的效果', () => {
      const card1: CardEffectDefinition = { ...mockDefinition, cardId: 'card_1' };
      const card2: CardEffectDefinition = { ...mockDefinition, cardId: 'card_2' };
      
      saveCardEffect(card1);
      saveCardEffect(card2);
      
      const result = getCustomCardEffects();
      expect(result).toHaveLength(2);
    });
  });

  describe('removeCustomEffect', () => {
    it('应该删除指定卡牌的效果', () => {
      saveCardEffect(mockDefinition);
      removeCustomEffect('holy_knight');
      
      const result = getCustomEffectForCard('holy_knight');
      expect(result).toBeUndefined();
      
      const allEffects = getCustomCardEffects();
      expect(allEffects).toHaveLength(0);
    });

    it('应该只删除指定的卡牌效果', () => {
      const card1: CardEffectDefinition = { ...mockDefinition, cardId: 'card_1' };
      const card2: CardEffectDefinition = { ...mockDefinition, cardId: 'card_2' };
      
      saveCardEffect(card1);
      saveCardEffect(card2);
      removeCustomEffect('card_1');
      
      const result = getCustomEffectForCard('card_1');
      expect(result).toBeUndefined();
      
      const remaining = getCustomEffectForCard('card_2');
      expect(remaining).toBeDefined();
    });

    it('删除不存在的卡牌应该不报错', () => {
      expect(() => removeCustomEffect('non_existent')).not.toThrow();
    });
  });

  describe('clearAllCustomEffects', () => {
    it('应该清除所有保存的效果', () => {
      const card1: CardEffectDefinition = { ...mockDefinition, cardId: 'card_1' };
      const card2: CardEffectDefinition = { ...mockDefinition, cardId: 'card_2' };
      
      saveCardEffect(card1);
      saveCardEffect(card2);
      clearAllCustomEffects();
      
      const result = getCustomCardEffects();
      expect(result).toEqual([]);
    });
  });

  describe('边界情况', () => {
    it('空定义应该也能保存', () => {
      const emptyDefinition: CardEffectDefinition = {
        cardId: 'empty_card',
        trigger: 'ON_PLAY',
        effects: [],
        description: '',
      };
      
      saveCardEffect(emptyDefinition);
      const result = getCustomEffectForCard('empty_card');
      expect(result).toBeDefined();
      expect(result?.effects).toHaveLength(0);
    });
  });
});
