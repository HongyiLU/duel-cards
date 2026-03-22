// Card Effect Types - 效果系统类型定义

import type { GameState, Card } from '../../types';

// ============== 效果类型 ==============

export type EffectType = 
  | 'DAMAGE'           // 造成伤害
  | 'HEAL'             // 治疗
  | 'DRAW_CARD'        // 抽牌
  | 'ADD_ARMOR'        // 增加护甲
  | 'FREEZE'           // 冻结（跳过下回合）
  | 'DAMAGE_ALL'       // AOE伤害
  | 'DEAL_TO_HERO'     // 对英雄造成伤害
  | 'GAIN_MANA'        // 获得法力
  | 'DESTROY'          // 消灭（无视生命）
  | 'COPY_CARD'        // 复制卡牌到手中
  | 'SILENCE'          // 沉默（移除所有效果）
  ;

// ============== 目标类型 ==============

export type TargetType = 
  | 'SELF'                    // 目标自身（卡牌本身）
  | 'ENEMY'                   // 敌方单目标（随从）
  | 'ALL_ENEMIES'             // 所有敌方随从
  | 'ALL_FRIENDLIES'          // 所有友方随从
  | 'OWNER'                   // 拥有者（打出此牌的玩家）
  | 'ENEMY_HERO'              // 敌方英雄
  | 'ALLY_HERO'               // 友方英雄
  ;

// ============== 触发类型 ==============

export type TriggerType =
  | 'ON_PLAY'                 // 打出时（战吼）
  | 'ON_ATTACK'               // 攻击时
  | 'ON_DEATH'                // 死亡时（亡语）
  | 'ON_TURN_START'           // 回合开始时
  | 'ON_TURN_END'             // 回合结束时
  | 'ON_DAMAGE_RECEIVED'      // 受到伤害时
  ;

// ============== 效果配置 ==============

export interface EffectConfig {
  id: string;                 // 效果唯一ID (uuid)
  type: EffectType;           // 效果类型
  value: number;             // 效果数值
  target: TargetType;        // 目标类型
  condition?: string;        // 触发条件描述（可选，用于显示）
}

// ============== 卡牌效果定义 ==============

export interface CardEffectDefinition {
  cardId: string;            // 卡牌ID
  trigger: TriggerType;       // 触发类型
  effects: EffectConfig[];    // 效果列表
  description: string;        // 效果描述（自动生成或手动）
}

// ============== 效果函数签名 ==============

// 效果函数：接收状态、配置、来源卡牌，返回新状态
export type EffectFunction = (
  state: GameState,
  config: EffectConfig,
  source: Card
) => GameState;

// ============== 效果执行结果 ==============

export interface EffectResult {
  success: boolean;
  newState: GameState;
  log: EffectLogEntry;
  error?: string;
}

// ============== 效果执行日志 ==============

export interface EffectLogEntry {
  id: string;
  timestamp: number;
  cardId: string;
  cardName: string;
  effectType: EffectType;
  targetType: TargetType;
  value: number;
  description: string;
  changes: StateChange[];
}

export interface StateChange {
  path: string;              // 状态路径，如 "player.health"
  oldValue: any;
  newValue: any;
}

// ============== 测试结果 ==============

export interface TestResult {
  success: boolean;
  initialState: GameState;
  finalState: GameState;
  logs: EffectLogEntry[];
  error?: string;
}

// ============== 辅助类型 ==============

// 目标选择模式
export type TargetSelectionMode = 
  | 'NONE'           // 不需要选择
  | 'SINGLE'         // 选择单个目标
  | 'MULTIPLE'       // 选择多个目标
  | 'HERO_ONLY'      // 只能选择英雄
  ;

// 效果元数据（用于UI显示）
export interface EffectMetadata {
  type: EffectType;
  name: string;
  description: string;
  icon: string;             // emoji 图标
  valueType: 'damage' | 'heal' | 'utility' | 'special';
  defaultTarget: TargetType;
  selectionMode: TargetSelectionMode;
}

// 效果元数据注册表
export const EFFECT_METADATA: Record<EffectType, EffectMetadata> = {
  DAMAGE: {
    type: 'DAMAGE',
    name: '造成伤害',
    description: '对一个目标造成 {value} 点伤害',
    icon: '⚔️',
    valueType: 'damage',
    defaultTarget: 'ENEMY',
    selectionMode: 'SINGLE',
  },
  HEAL: {
    type: 'HEAL',
    name: '治疗',
    description: '为一个目标恢复 {value} 点生命',
    icon: '💚',
    valueType: 'heal',
    defaultTarget: 'ALLY_HERO',
    selectionMode: 'SINGLE',
  },
  DRAW_CARD: {
    type: 'DRAW_CARD',
    name: '抽牌',
    description: '抽 {value} 张牌',
    icon: '🎴',
    valueType: 'utility',
    defaultTarget: 'OWNER',
    selectionMode: 'NONE',
  },
  ADD_ARMOR: {
    type: 'ADD_ARMOR',
    name: '获得护甲',
    description: '获得 {value} 点护甲',
    icon: '🛡️',
    valueType: 'utility',
    defaultTarget: 'ALLY_HERO',
    selectionMode: 'NONE',
  },
  FREEZE: {
    type: 'FREEZE',
    name: '冻结',
    description: '冻结一个目标，使其跳过下 {value} 回合',
    icon: '❄️',
    valueType: 'special',
    defaultTarget: 'ENEMY',
    selectionMode: 'SINGLE',
  },
  DAMAGE_ALL: {
    type: 'DAMAGE_ALL',
    name: '全体伤害',
    description: '对所有 {target} 造成 {value} 点伤害',
    icon: '💥',
    valueType: 'damage',
    defaultTarget: 'ALL_ENEMIES',
    selectionMode: 'NONE',
  },
  DEAL_TO_HERO: {
    type: 'DEAL_TO_HERO',
    name: '英雄伤害',
    description: '对敌方英雄造成 {value} 点伤害',
    icon: '🎯',
    valueType: 'damage',
    defaultTarget: 'ENEMY_HERO',
    selectionMode: 'NONE',
  },
  GAIN_MANA: {
    type: 'GAIN_MANA',
    name: '获得法力',
    description: '本回合获得 {value} 点额外法力',
    icon: '⚡',
    valueType: 'utility',
    defaultTarget: 'OWNER',
    selectionMode: 'NONE',
  },
  DESTROY: {
    type: 'DESTROY',
    name: '消灭',
    description: '消灭一个目标（无视生命值）',
    icon: '💀',
    valueType: 'special',
    defaultTarget: 'ENEMY',
    selectionMode: 'SINGLE',
  },
  COPY_CARD: {
    type: 'COPY_CARD',
    name: '复制卡牌',
    description: '将一张随机敌方手牌复制到手牌',
    icon: '📋',
    valueType: 'utility',
    defaultTarget: 'ENEMY',
    selectionMode: 'NONE',
  },
  SILENCE: {
    type: 'SILENCE',
    name: '沉默',
    description: '沉默一个目标，移除所有附魔效果',
    icon: '🔇',
    valueType: 'special',
    defaultTarget: 'ENEMY',
    selectionMode: 'SINGLE',
  },
};

// 目标类型元数据
export const TARGET_METADATA: Record<TargetType, { name: string; description: string }> = {
  SELF: { name: '自身', description: '目标为使用此效果的卡牌本身' },
  ENEMY: { name: '敌方随从', description: '选择一个敌方随从' },
  ALL_ENEMIES: { name: '所有敌方随从', description: '对所有敌方随从生效' },
  ALL_FRIENDLIES: { name: '所有友方随从', description: '对所有友方随从生效' },
  OWNER: { name: '拥有者', description: '使用此牌的玩家' },
  ENEMY_HERO: { name: '敌方英雄', description: '敌方英雄' },
  ALLY_HERO: { name: '友方英雄', description: '友方英雄（你）' },
};
