// EffectExecutor - 效果执行器
// 选择卡牌和效果并执行

import { useState, useCallback } from 'react';
import type { GameState, Card } from '../../types';
import type { EffectConfig, EffectType, TargetType } from '../../core/effects/types';
import { EFFECT_METADATA, TARGET_METADATA } from '../../core/effects';
import './EffectExecutor.css';

interface EffectExecutorProps {
  state: GameState;
  onExecute: (card: Card, effectConfig: EffectConfig) => void;
  disabled?: boolean;
}

export function EffectExecutor({ state, onExecute, disabled }: EffectExecutorProps) {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [selectedEffectType, setSelectedEffectType] = useState<EffectType | null>(null);
  const [effectValue, setEffectValue] = useState(1);
  const [selectedTarget, setSelectedTarget] = useState<TargetType>('ENEMY');
  
  // 获取所有可用卡牌（手牌 + 战场）
  const allCards = [
    ...state.player.hand.map(c => ({ ...c, location: 'hand' as const })),
    ...state.player.field.map(c => ({ ...c, location: 'field' as const })),
  ];
  
  const handleCardSelect = useCallback((card: Card) => {
    setSelectedCard(card);
  }, []);
  
  const handleEffectSelect = useCallback((effectType: EffectType) => {
    setSelectedEffectType(effectType);
  }, []);
  
  const handleExecute = useCallback(() => {
    if (!selectedCard || !selectedEffectType) return;
    
    const effectConfig: EffectConfig = {
      id: `effect_${Date.now()}`,
      type: selectedEffectType,
      value: effectValue,
      target: selectedTarget,
    };
    
    onExecute(selectedCard, effectConfig);
    
    // 重置选择
    setSelectedCard(null);
    setSelectedEffectType(null);
    setEffectValue(1);
  }, [selectedCard, selectedEffectType, effectValue, selectedTarget, onExecute]);
  
  const canExecute = selectedCard && selectedEffectType;
  
  return (
    <div className="effect-executor">
      <div className="executor-header">
        <h3>🎯 效果执行器</h3>
      </div>
      
      {/* 1. 选择卡牌 */}
      <div className="section">
        <h4>1️⃣ 选择卡牌</h4>
        <div className="card-selector">
          {allCards.length === 0 ? (
            <span className="empty">无卡牌</span>
          ) : (
            allCards.map(card => (
              <div
                key={card.instanceId}
                className={`card-option ${selectedCard?.instanceId === card.instanceId ? 'selected' : ''}`}
                onClick={() => handleCardSelect(card)}
              >
                <span className="card-icon">{
                  card.location === 'field' ? '⚔️' : '🎴'
                }</span>
                <span className="card-name">{card.name}</span>
                <span className="card-cost">{card.cost}</span>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* 2. 选择效果 */}
      <div className="section">
        <h4>2️⃣ 选择效果</h4>
        <div className="effect-grid">
          {Object.entries(EFFECT_METADATA).map(([type, meta]) => (
            <button
              key={type}
              className={`effect-btn ${selectedEffectType === type ? 'selected' : ''}`}
              onClick={() => handleEffectSelect(type as EffectType)}
              disabled={disabled}
            >
              <span className="effect-icon">{meta.icon}</span>
              <span className="effect-name">{meta.name}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* 3. 配置数值 */}
      {selectedEffectType && (
        <div className="section">
          <h4>3️⃣ 配置数值</h4>
          <div className="value-config">
            <label>
              <span>效果数值:</span>
              <input
                type="number"
                min="1"
                max="99"
                value={effectValue}
                onChange={(e) => setEffectValue(parseInt(e.target.value) || 1)}
              />
            </label>
          </div>
        </div>
      )}
      
      {/* 4. 选择目标 */}
      {selectedEffectType && (
        <div className="section">
          <h4>4️⃣ 选择目标</h4>
          <div className="target-selector">
            {Object.entries(TARGET_METADATA).map(([type, meta]) => (
              <button
                key={type}
                className={`target-btn ${selectedTarget === type ? 'selected' : ''}`}
                onClick={() => setSelectedTarget(type as TargetType)}
              >
                <span className="target-name">{meta.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* 执行按钮 */}
      <div className="execute-section">
        <button
          className="execute-btn"
          onClick={handleExecute}
          disabled={!canExecute || disabled}
        >
          ▶️ 执行效果
        </button>
        
        {selectedCard && selectedEffectType && (
          <div className="preview">
            <span className="preview-label">预览:</span>
            <span className="preview-text">
              {selectedCard.name} 
              {' '}
              {EFFECT_METADATA[selectedEffectType].icon}
              {' '}
              {effectValue}
              {' → '}
              {TARGET_METADATA[selectedTarget].name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
