// CardEffectEditor - 卡牌效果编辑器
// 可视化编辑和配置卡牌效果

import { useState, useCallback } from 'react';
import type { Card } from '../../types';
import type { EffectConfig, EffectType, TargetType, CardEffectDefinition } from '../../core/effects/types';
import { EFFECT_METADATA, TARGET_METADATA } from '../../core/effects';
import { getAllCards } from '../../data/cardDatabase';
import './CardEffectEditor.css';

interface CardEffectEditorProps {
  initialCardId?: string;
  onSave?: (definition: CardEffectDefinition) => void;
}

// 创建测试卡牌
function createTestCard(cardId: string): Card {
  const templates: Record<string, any> = {
    'steel_soldier': { name: '钢铁士兵', cost: 1, attack: 1, health: 2, type: 'CREATURE' },
    'flame_apprentice': { name: '火焰学徒', cost: 2, attack: 2, health: 2, type: 'CREATURE' },
    'holy_knight': { name: '圣光骑士', cost: 3, attack: 3, health: 3, type: 'CREATURE' },
    'forest_guardian': { name: '森林守卫', cost: 3, attack: 2, health: 4, type: 'CREATURE' },
    'thunder_giant': { name: '雷霆巨人', cost: 4, attack: 4, health: 5, type: 'CREATURE' },
    'frost_dragon': { name: '冰霜巨龙', cost: 5, attack: 5, health: 6, type: 'CREATURE' },
    'shadow_lord': { name: '暗影领主', cost: 6, attack: 6, health: 6, type: 'CREATURE' },
    'emp_blast': { name: '电磁脉冲', cost: 2, attack: 0, health: 0, type: 'SPELL' },
    'energy_shield': { name: '能量护盾', cost: 1, attack: 0, health: 0, type: 'SPELL' },
    'lightning_strike': { name: '闪电打击', cost: 3, attack: 0, health: 0, type: 'SPELL' },
    'healing_light': { name: '治疗之光', cost: 2, attack: 0, health: 0, type: 'SPELL' },
  };
  
  const template = templates[cardId] || { name: cardId, cost: 1, attack: 1, health: 1, type: 'CREATURE' as const };
  
  return {
    id: cardId,
    instanceId: `editor_${cardId}`,
    name: template.name,
    cost: template.cost,
    attack: template.attack,
    health: template.health,
    maxHealth: template.health,
    currentHealth: template.health,
    type: template.type,
    rarity: 'COMMON',
    description: '',
    effects: [],
  };
}

export function CardEffectEditor({ initialCardId, onSave }: CardEffectEditorProps) {
  const [selectedCardId, setSelectedCardId] = useState(initialCardId || 'holy_knight');
  const [effects, setEffects] = useState<EffectConfig[]>([]);
  
  const allCards = getAllCards();
  const creatureCards = allCards.filter(c => c.type === 'CREATURE');
  const spellCards = allCards.filter(c => c.type === 'SPELL');
  
  const selectedCard = createTestCard(selectedCardId);
  
  const handleCardSelect = useCallback((cardId: string) => {
    setSelectedCardId(cardId);
    setEffects([]);
  }, []);
  
  const handleAddEffect = useCallback(() => {
    const newEffect: EffectConfig = {
      id: `effect_${Date.now()}`,
      type: 'DAMAGE',
      value: 1,
      target: 'ENEMY',
    };
    setEffects(prev => [...prev, newEffect]);
  }, []);
  
  const handleRemoveEffect = useCallback((index: number) => {
    setEffects(prev => prev.filter((_, i) => i !== index));
  }, []);
  
  const handleEffectChange = useCallback((
    index: number, 
    field: keyof EffectConfig, 
    value: string | number
  ) => {
    setEffects(prev => prev.map((effect, i) => {
      if (i !== index) return effect;
      return { ...effect, [field]: value };
    }));
  }, []);
  
  const handleSave = useCallback(() => {
    if (!selectedCardId || effects.length === 0) return;
    
    const definition: CardEffectDefinition = {
      cardId: selectedCardId,
      trigger: 'ON_PLAY',
      effects: effects,
      description: generateDescription(effects),
    };
    
    onSave?.(definition);
    alert('效果配置已保存！');
  }, [selectedCardId, effects, onSave]);
  
  const generateDescription = (effs: EffectConfig[]): string => {
    return effs.map(e => {
      const meta = EFFECT_METADATA[e.type];
      const target = TARGET_METADATA[e.target];
      return `${meta.icon} ${meta.name} ${e.value} (${target.name})`;
    }).join(', ');
  };
  
  return (
    <div className="card-effect-editor">
      <div className="editor-header">
        <h2>✏️ 卡牌效果编辑器</h2>
        <button className="save-btn" onClick={handleSave}>
          💾 保存配置
        </button>
      </div>
      
      <div className="editor-content">
        {/* 左侧：卡牌选择 */}
        <div className="card-selection">
          <h3>选择卡牌</h3>
          
          <div className="card-section">
            <h4>生物卡</h4>
            <div className="card-list">
              {creatureCards.map(card => (
                <div
                  key={card.id}
                  className={`card-item ${selectedCardId === card.id ? 'selected' : ''}`}
                  onClick={() => handleCardSelect(card.id)}
                >
                  <span className="card-name">{card.name}</span>
                  <span className="card-cost">{card.cost}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="card-section">
            <h4>法术卡</h4>
            <div className="card-list">
              {spellCards.map(card => (
                <div
                  key={card.id}
                  className={`card-item ${selectedCardId === card.id ? 'selected' : ''}`}
                  onClick={() => handleCardSelect(card.id)}
                >
                  <span className="card-name">{card.name}</span>
                  <span className="card-cost">{card.cost}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* 中间：效果配置 */}
        <div className="effect-configuration">
          <h3>效果配置</h3>
          
          <div className="selected-card-preview">
            <div className="preview-header">
              <span className="preview-name">{selectedCard.name}</span>
              <span className="preview-cost">{selectedCard.cost}</span>
            </div>
            {selectedCard.type === 'CREATURE' && (
              <div className="preview-stats">
                <span className="attack">{selectedCard.attack}</span>
                <span className="health">{selectedCard.health}</span>
              </div>
            )}
          </div>
          
          <div className="effects-list">
            <h4>效果列表 ({effects.length})</h4>
            
            {effects.length === 0 ? (
              <div className="no-effects">
                点击下方按钮添加效果
              </div>
            ) : (
              effects.map((effect, index) => (
                <div key={effect.id} className="effect-item">
                  <div className="effect-header">
                    <span className="effect-index">效果 {index + 1}</span>
                    <button 
                      className="remove-btn"
                      onClick={() => handleRemoveEffect(index)}
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="effect-fields">
                    <div className="field">
                      <label>类型</label>
                      <select
                        value={effect.type}
                        onChange={(e) => handleEffectChange(index, 'type', e.target.value as EffectType)}
                      >
                        {Object.entries(EFFECT_METADATA).map(([type, meta]) => (
                          <option key={type} value={type}>
                            {meta.icon} {meta.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="field">
                      <label>数值</label>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={effect.value}
                        onChange={(e) => handleEffectChange(index, 'value', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    
                    <div className="field">
                      <label>目标</label>
                      <select
                        value={effect.target}
                        onChange={(e) => handleEffectChange(index, 'target', e.target.value as TargetType)}
                      >
                        {Object.entries(TARGET_METADATA).map(([type, meta]) => (
                          <option key={type} value={type}>
                            {meta.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <button className="add-effect-btn" onClick={handleAddEffect}>
            ➕ 添加效果
          </button>
        </div>
        
        {/* 右侧：预览 */}
        <div className="effect-preview">
          <h3>效果预览</h3>
          
          <div className="preview-card">
            <div className="preview-top">
              <span className="preview-cost">{selectedCard.cost}</span>
            </div>
            <div className="preview-middle">
              <span className="preview-icon">{
                selectedCard.type === 'CREATURE' ? '🃏' : '✨'
              }</span>
            </div>
            <div className="preview-info">
              <span className="preview-name">{selectedCard.name}</span>
              <span className="preview-type">{selectedCard.type === 'CREATURE' ? '生物' : '法术'}</span>
            </div>
            <div className="preview-description">
              {effects.length > 0 ? (
                effects.map((e, i) => (
                  <div key={i} className="desc-line">
                    {EFFECT_METADATA[e.type].icon} {e.value} → {TARGET_METADATA[e.target].name}
                  </div>
                ))
              ) : (
                <span className="no-effect">无效果</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
