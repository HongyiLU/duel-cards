// Custom Card Effects Storage - 自定义卡牌效果存储
// 使用 localStorage 持久化保存玩家自定义的卡牌效果

import type { CardEffectDefinition } from './types';

const STORAGE_KEY = 'duel_cards_custom_effects';

// ============== 存储操作 ==============

/**
 * 获取所有自定义卡牌效果
 */
export function getCustomCardEffects(): CardEffectDefinition[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('[CustomEffects] Failed to load:', error);
    return [];
  }
}

/**
 * 保存所有自定义卡牌效果
 */
export function saveCustomCardEffects(effects: CardEffectDefinition[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(effects));
    console.log('[CustomEffects] Saved', effects.length, 'effects');
  } catch (error) {
    console.error('[CustomEffects] Failed to save:', error);
  }
}

/**
 * 获取单个卡牌的自定义效果
 */
export function getCustomEffectForCard(cardId: string): CardEffectDefinition | undefined {
  const effects = getCustomCardEffects();
  return effects.find(e => e.cardId === cardId);
}

/**
 * 保存单个卡牌的效果
 * 如果已存在则覆盖，不存在则添加
 */
export function saveCardEffect(definition: CardEffectDefinition): void {
  const effects = getCustomCardEffects();
  const existingIndex = effects.findIndex(e => e.cardId === definition.cardId);
  
  if (existingIndex !== -1) {
    effects[existingIndex] = definition;
    console.log('[CustomEffects] Updated effect for', definition.cardId);
  } else {
    effects.push(definition);
    console.log('[CustomEffects] Added new effect for', definition.cardId);
  }
  
  saveCustomCardEffects(effects);
}

/**
 * 删除某个卡牌的自定义效果
 */
export function removeCustomEffect(cardId: string): void {
  const effects = getCustomCardEffects();
  const filtered = effects.filter(e => e.cardId !== cardId);
  
  if (filtered.length < effects.length) {
    saveCustomCardEffects(filtered);
    console.log('[CustomEffects] Removed effect for', cardId);
  }
}

/**
 * 清除所有自定义效果
 */
export function clearAllCustomEffects(): void {
  localStorage.removeItem(STORAGE_KEY);
  console.log('[CustomEffects] Cleared all effects');
}

// ============== 效果应用 ==============

/**
 * 获取卡牌的效果定义（自定义 > 默认）
 */
export function getCardEffectDefinition(cardId: string): CardEffectDefinition | null {
  // 优先使用自定义效果
  const custom = getCustomEffectForCard(cardId);
  if (custom) {
    return custom;
  }
  
  // 返回数据库默认效果（如果有）
  // TODO: 从 cardDatabase 获取默认效果
  return null;
}

// ============== 调试 ==============

/**
 * 打印所有保存的效果（调试用）
 */
export function debugPrintAllEffects(): void {
  const effects = getCustomCardEffects();
  console.log('[CustomEffects] All saved effects:');
  effects.forEach(e => {
    console.log(`  ${e.cardId}:`, e.description);
  });
}
