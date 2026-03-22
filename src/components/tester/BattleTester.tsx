// BattleTester - 战斗测试器
// 可视化测试卡牌效果的系统

import { useState, useCallback } from 'react';
import type { GameState, Card } from '../../types';
import type { EffectConfig, EffectLogEntry, TestResult } from '../../core/effects/types';
import { executeEffect, EFFECT_METADATA, TARGET_METADATA } from '../../core/effects';
import { StateInspector } from './StateInspector';
import { EffectExecutor } from './EffectExecutor';
import { ExecutionLog } from './ExecutionLog';
import './BattleTester.css';

interface BattleTesterProps {
  initialState?: GameState;
}

// 创建默认测试状态
function createDefaultTestState(): GameState {
  return {
    phase: 'PLAYER_TURN',
    turn: 1,
    currentPlayer: 'player',
    player: {
      name: '测试玩家',
      health: 30,
      maxHealth: 30,
      armor: 0,
      mana: 5,
      maxMana: 5,
      hand: [
        createTestCard('steel_soldier', 'player', 1),
        createTestCard('flame_apprentice', 'player', 2),
        createTestCard('holy_knight', 'player', 3),
      ],
      deck: [
        createTestCard('forest_guardian', 'player', 4),
        createTestCard('thunder_giant', 'player', 5),
      ],
      field: [
        createTestCard('shadow_assassin', 'player', 6, true),
      ],
      deckId: 'test',
    },
    enemy: {
      name: '测试敌人',
      health: 25,
      maxHealth: 30,
      armor: 2,
      mana: 4,
      maxMana: 4,
      hand: [
        createTestCard('steel_soldier', 'enemy', 7),
        createTestCard('forest_guardian', 'enemy', 8),
      ],
      deck: [],
      field: [
        createTestCard('flame_apprentice', 'enemy', 9),
        createTestCard('forest_guardian', 'enemy', 10),
      ],
      deckId: 'test_enemy',
    },
    selectedCard: null,
    selectedFieldCard: null,
    turnStartTime: Date.now(),
    lastAction: null,
  };
}

function createTestCard(
  cardId: string,
  owner: 'player' | 'enemy',
  index: number,
  canAttack = false
): Card {
  const cardTemplates: Record<string, { name: string; cost: number; attack: number; health: number; type: 'CREATURE' | 'SPELL' }> = {
    'steel_soldier': { name: '钢铁士兵', cost: 1, attack: 1, health: 2, type: 'CREATURE' },
    'flame_apprentice': { name: '火焰学徒', cost: 2, attack: 2, health: 2, type: 'CREATURE' },
    'shadow_assassin': { name: '暗影刺客', cost: 2, attack: 3, health: 1, type: 'CREATURE' },
    'forest_guardian': { name: '森林守卫', cost: 3, attack: 2, health: 4, type: 'CREATURE' },
    'thunder_giant': { name: '雷霆巨人', cost: 4, attack: 4, health: 5, type: 'CREATURE' },
    'holy_knight': { name: '圣光骑士', cost: 3, attack: 3, health: 3, type: 'CREATURE' },
  };
  
  const template = cardTemplates[cardId] || { name: cardId, cost: 1, attack: 1, health: 1, type: 'CREATURE' as const };
  
  return {
    id: cardId,
    instanceId: `${owner}_${cardId}_${index}`,
    name: template.name,
    cost: template.cost,
    attack: template.attack,
    health: template.health,
    maxHealth: template.health,
    currentHealth: template.health,
    type: template.type,
    rarity: 'COMMON',
    description: '测试卡牌',
    effects: cardId === 'shadow_assassin' ? ['CHARGE'] : [],
    canAttack,
    hasAttacked: false,
  };
}

export function BattleTester({ initialState }: BattleTesterProps) {
  const [gameState, setGameState] = useState<GameState>(
    initialState || createDefaultTestState()
  );
  const [logs, setLogs] = useState<EffectLogEntry[]>([]);
  const [lastResult, setLastResult] = useState<TestResult | null>(null);
  
  const handleExecuteEffect = useCallback((
    card: Card,
    effectConfig: EffectConfig
  ) => {
    const startTime = Date.now();
    
    // 执行效果
    const newState = executeEffect(gameState, effectConfig, card);
    
    // 创建日志条目
    const logEntry: EffectLogEntry = {
      id: `log_${startTime}`,
      timestamp: startTime,
      cardId: card.id,
      cardName: card.name,
      effectType: effectConfig.type,
      targetType: effectConfig.target,
      value: effectConfig.value,
      description: generateEffectDescription(effectConfig),
      changes: [],
    };
    
    setLogs(prev => [logEntry, ...prev]);
    setLastResult({
      success: true,
      initialState: gameState,
      finalState: newState,
      logs: [logEntry],
    });
    setGameState(newState);
  }, [gameState]);
  
  const handleReset = useCallback(() => {
    setGameState(createDefaultTestState());
    setLogs([]);
    setLastResult(null);
  }, []);
  
  return (
    <div className="battle-tester">
      <div className="tester-header">
        <h2>⚔️ 卡牌效果测试器</h2>
        <button className="reset-btn" onClick={handleReset}>
          🔄 重置状态
        </button>
      </div>
      
      <div className="tester-content">
        <div className="tester-main">
          <StateInspector 
            state={gameState} 
          />
          
          <EffectExecutor
            state={gameState}
            onExecute={handleExecuteEffect}
          />
        </div>
        
        <div className="tester-sidebar">
          <ExecutionLog logs={logs} />
          
          {lastResult && (
            <div className="last-result">
              <h4>上次执行结果</h4>
              <div className="result-summary">
                {lastResult.success ? (
                  <span className="success">✅ 成功</span>
                ) : (
                  <span className="error">❌ 失败: {lastResult.error}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 生成效果描述
function generateEffectDescription(config: EffectConfig): string {
  const meta = EFFECT_METADATA[config.type];
  const targetMeta = TARGET_METADATA[config.target];
  
  let desc = meta.description
    .replace('{value}', config.value.toString())
    .replace('{target}', targetMeta.name);
  
  return desc;
}
