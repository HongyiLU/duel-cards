// Effect Registry - 效果注册表
// 所有卡牌效果函数都在这里注册

import type { GameState, Card } from '../../types';
import type { EffectConfig, EffectType, TargetType, EffectFunction } from './types';

// ============== 辅助函数 ==============

// 找到目标玩家
function getTargetPlayer(target: TargetType, source: Card): 'player' | 'enemy' | null {
  switch (target) {
    case 'ENEMY_HERO':
      return source.instanceId.includes('player') ? 'enemy' : 'player';
    case 'ALLY_HERO':
    case 'OWNER':
      return source.instanceId.includes('player') ? 'player' : 'enemy';
    default:
      return null;
  }
}

// 找到符合条件的目标随从
function findTargetCard(
  state: GameState,
  target: TargetType,
  source: Card
): Card | null {
  const isPlayerSource = source.instanceId.includes('player');
  
  switch (target) {
    case 'SELF':
      // 在场上找自己
      const selfInField = [...state.player.field, ...state.enemy.field]
        .find(c => c.instanceId === source.instanceId);
      return selfInField || null;
      
    case 'ENEMY':
      // 返回第一个敌方随从（测试用）
      return isPlayerSource ? state.enemy.field[0] : state.player.field[0];
      
    case 'ALL_ENEMIES':
    case 'ALL_FRIENDLIES':
      // 这些在 applyDamageToAll 中处理
      return null;
      
    default:
      return null;
  }
}

// 深拷贝状态（不可变更新）
function cloneState(state: GameState): GameState {
  return JSON.parse(JSON.stringify(state));
}

// ============== 效果实现 ==============

// 造成伤害
const damageEffect: EffectFunction = (state, config, source) => {
  const newState = cloneState(state);
  const targetCard = findTargetCard(newState, config.target, source);
  
  if (!targetCard) return state;
  
  const isEnemyTarget = state.enemy.field.some(c => c.instanceId === targetCard.instanceId);
  
  if (isEnemyTarget) {
    // 目标是敌方随从
    const field = newState.enemy.field;
    const idx = field.findIndex(c => c.instanceId === targetCard.instanceId);
    if (idx !== -1) {
      const currentHealth = field[idx].currentHealth || field[idx].health;
      field[idx].currentHealth = Math.max(0, currentHealth - config.value);
      
      // 检查是否死亡
      if (field[idx].currentHealth <= 0) {
        newState.enemy.field = field.filter((_, i) => i !== idx);
      }
    }
  } else {
    // 目标是友方随从
    const field = newState.player.field;
    const idx = field.findIndex(c => c.instanceId === targetCard.instanceId);
    if (idx !== -1) {
      const currentHealth = field[idx].currentHealth || field[idx].health;
      field[idx].currentHealth = Math.max(0, currentHealth - config.value);
      
      if (field[idx].currentHealth <= 0) {
        newState.player.field = field.filter((_, i) => i !== idx);
      }
    }
  }
  
  return newState;
};

// 治疗
const healEffect: EffectFunction = (state, config, source) => {
  const newState = cloneState(state);
  const targetPlayer = getTargetPlayer(config.target, source);
  
  if (!targetPlayer) return state;
  
  const player = targetPlayer === 'player' ? newState.player : newState.enemy;
  const healAmount = Math.min(config.value, player.maxHealth - player.health);
  player.health += healAmount;
  
  return newState;
};

// 抽牌
const drawCardEffect: EffectFunction = (state, config, source) => {
  const newState = cloneState(state);
  const targetPlayer = getTargetPlayer(config.target, source);
  
  if (!targetPlayer) return state;
  
  const player = targetPlayer === 'player' ? newState.player : newState.enemy;
  
  for (let i = 0; i < config.value; i++) {
    if (player.deck.length > 0 && player.hand.length < 10) {
      const card = player.deck.pop();
      if (card) {
        player.hand.push(card);
      }
    }
  }
  
  return newState;
};

// 增加护甲
const addArmorEffect: EffectFunction = (state, config, source) => {
  const newState = cloneState(state);
  const targetPlayer = getTargetPlayer(config.target, source);
  
  if (!targetPlayer) return state;
  
  const player = targetPlayer === 'player' ? newState.player : newState.enemy;
  player.armor += config.value;
  
  return newState;
};

// 冻结
const freezeEffect: EffectFunction = (state, config, source) => {
  const newState = cloneState(state);
  const targetCard = findTargetCard(newState, config.target, source);
  
  if (!targetCard) return state;
  
  const isEnemyTarget = state.enemy.field.some(c => c.instanceId === targetCard.instanceId);
  const field = isEnemyTarget ? newState.enemy.field : newState.player.field;
  const idx = field.findIndex(c => c.instanceId === targetCard.instanceId);
  
  if (idx !== -1) {
    field[idx].frozenTurns = (field[idx].frozenTurns || 0) + config.value;
    field[idx].canAttack = false;
  }
  
  return newState;
};

// AOE伤害
const damageAllEffect: EffectFunction = (state, config, source) => {
  const newState = cloneState(state);
  const isPlayerSource = source.instanceId.includes('player');
  
  // 确定目标字段
  const targetField = isPlayerSource ? newState.enemy.field : newState.player.field;
  
  // 对每个目标造成伤害
  for (let i = 0; i < targetField.length; i++) {
    const currentHealth = targetField[i].currentHealth || targetField[i].health;
    targetField[i].currentHealth = Math.max(0, currentHealth - config.value);
  }
  
  // 移除死亡的随从
  if (isPlayerSource) {
    newState.enemy.field = newState.enemy.field.filter(c => (c.currentHealth || c.health) > 0);
  } else {
    newState.player.field = newState.player.field.filter(c => (c.currentHealth || c.health) > 0);
  }
  
  return newState;
};

// 对英雄造成伤害
const dealToHeroEffect: EffectFunction = (state, config, source) => {
  const newState = cloneState(state);
  const targetPlayer = getTargetPlayer(config.target, source);
  
  if (!targetPlayer) return state;
  
  const player = targetPlayer === 'player' ? newState.player : newState.enemy;
  
  // 护甲先抵消伤害
  let remainingDamage = config.value;
  if (player.armor > 0) {
    if (player.armor >= remainingDamage) {
      player.armor -= remainingDamage;
      remainingDamage = 0;
    } else {
      remainingDamage -= player.armor;
      player.armor = 0;
    }
  }
  
  player.health = Math.max(0, player.health - remainingDamage);
  
  return newState;
};

// 获得法力
const gainManaEffect: EffectFunction = (state, config, source) => {
  const newState = cloneState(state);
  const targetPlayer = getTargetPlayer(config.target, source);
  
  if (!targetPlayer) return state;
  
  const player = targetPlayer === 'player' ? newState.player : newState.enemy;
  player.mana = Math.min(player.maxMana, player.mana + config.value);
  
  return newState;
};

// 消灭（无视生命）
const destroyEffect: EffectFunction = (state, config, source) => {
  const newState = cloneState(state);
  const targetCard = findTargetCard(newState, config.target, source);
  
  if (!targetCard) return state;
  
  const isEnemyTarget = state.enemy.field.some(c => c.instanceId === targetCard.instanceId);
  
  if (isEnemyTarget) {
    newState.enemy.field = newState.enemy.field.filter(
      c => c.instanceId !== targetCard.instanceId
    );
  } else {
    newState.player.field = newState.player.field.filter(
      c => c.instanceId !== targetCard.instanceId
    );
  }
  
  return newState;
};

// 复制卡牌
const copyCardEffect: EffectFunction = (state, _config, source) => {
  const newState = cloneState(state);
  const isPlayerSource = source.instanceId.includes('player');
  
  // 从对方手牌复制一张
  const sourceHand = isPlayerSource ? newState.enemy.hand : newState.player.hand;
  const targetHand = isPlayerSource ? newState.player.hand : newState.enemy.hand;
  
  if (sourceHand.length > 0 && targetHand.length < 10) {
    const randomIdx = Math.floor(Math.random() * sourceHand.length);
    const cardToCopy = { ...sourceHand[randomIdx], instanceId: `${sourceHand[randomIdx].id}_copy_${Date.now()}` };
    targetHand.push(cardToCopy);
  }
  
  return newState;
};

// 沉默
const silenceEffect: EffectFunction = (state, config, source) => {
  const newState = cloneState(state);
  const targetCard = findTargetCard(newState, config.target, source);
  
  if (!targetCard) return state;
  
  const isEnemyTarget = state.enemy.field.some(c => c.instanceId === targetCard.instanceId);
  const field = isEnemyTarget ? newState.enemy.field : newState.player.field;
  const idx = field.findIndex(c => c.instanceId === targetCard.instanceId);
  
  if (idx !== -1) {
    // 移除所有效果
    field[idx].effects = [];
    field[idx].attack = field[idx].attack; // 保留属性
    field[idx].currentHealth = field[idx].currentHealth || field[idx].health;
  }
  
  return newState;
};

// ============== 效果注册表 ==============

export const EffectRegistry: Record<EffectType, EffectFunction> = {
  DAMAGE: damageEffect,
  HEAL: healEffect,
  DRAW_CARD: drawCardEffect,
  ADD_ARMOR: addArmorEffect,
  FREEZE: freezeEffect,
  DAMAGE_ALL: damageAllEffect,
  DEAL_TO_HERO: dealToHeroEffect,
  GAIN_MANA: gainManaEffect,
  DESTROY: destroyEffect,
  COPY_CARD: copyCardEffect,
  SILENCE: silenceEffect,
};

// ============== 效果执行函数 ==============

export function executeEffect(
  state: GameState,
  config: EffectConfig,
  source: Card
): GameState {
  const effectFn = EffectRegistry[config.type];
  if (!effectFn) {
    console.warn(`Unknown effect type: ${config.type}`);
    return state;
  }
  
  return effectFn(state, config, source);
}

// 执行多个效果
export function executeEffects(
  state: GameState,
  configs: EffectConfig[],
  source: Card
): GameState {
  let newState = state;
  
  for (const config of configs) {
    newState = executeEffect(newState, config, source);
  }
  
  return newState;
}

// ============== 辅助函数导出 ==============

export { getTargetPlayer, findTargetCard, cloneState };
