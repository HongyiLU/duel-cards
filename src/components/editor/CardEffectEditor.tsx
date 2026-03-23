// CardEffectEditor - 卡牌效果编辑器 v1.1
// 可视化编辑和配置卡牌效果
// v1.1: 优化交互方式，添加触发时机、效果模板、拖拽排序

import { useState, useCallback, useMemo } from 'react';
import type { Card } from '../../types';
import type { EffectConfig, EffectType, TargetType, TriggerType, CardEffectDefinition } from '../../core/effects/types';
import { EFFECT_METADATA, TARGET_METADATA } from '../../core/effects/types';
import { getAllCards } from '../../data/cardDatabase';
import { saveCardEffect, getCustomEffectForCard } from '../../core/effects/storage';
import './CardEffectEditor.css';

// ============== 类型定义 ==============

interface EffectTemplate {
  id: string;
  name: string;
  icon: string;
  effect: Partial<EffectConfig>;
}

interface TriggerOption {
  type: TriggerType;
  name: string;
  icon: string;
  description: string;
}

// ============== 常量 ==============

// 触发时机选项
const TRIGGER_OPTIONS: TriggerOption[] = [
  { type: 'ON_PLAY', name: '战吼', icon: '📢', description: '打出卡牌时' },
  { type: 'ON_ATTACK', name: '攻击', icon: '⚔️', description: '攻击时' },
  { type: 'ON_DEATH', name: '亡语', icon: '💀', description: '死亡时' },
  { type: 'ON_TURN_START', name: '回合开始', icon: '🌅', description: '回合开始时' },
  { type: 'ON_TURN_END', name: '回合结束', icon: '🌙', description: '回合结束时' },
];

// 效果快捷模板
const EFFECT_TEMPLATES: EffectTemplate[] = [
  { id: 'damage_face', name: '打脸', icon: '🎯', effect: { type: 'DEAL_TO_HERO', value: 3, target: 'ENEMY_HERO' } },
  { id: 'damage_minion', name: '解场', icon: '⚔️', effect: { type: 'DAMAGE', value: 3, target: 'ENEMY' } },
  { id: 'damage_all', name: 'AOE', icon: '💥', effect: { type: 'DAMAGE_ALL', value: 2, target: 'ALL_ENEMIES' } },
  { id: 'heal', name: '治疗', icon: '💚', effect: { type: 'HEAL', value: 3, target: 'ALLY_HERO' } },
  { id: 'armor', name: '护甲', icon: '🛡️', effect: { type: 'ADD_ARMOR', value: 3, target: 'ALLY_HERO' } },
  { id: 'draw', name: '过牌', icon: '🎴', effect: { type: 'DRAW_CARD', value: 2, target: 'OWNER' } },
  { id: 'mana', name: '法力', icon: '⚡', effect: { type: 'GAIN_MANA', value: 1, target: 'OWNER' } },
  { id: 'freeze', name: '冻结', icon: '❄️', effect: { type: 'FREEZE', value: 1, target: 'ENEMY' } },
  { id: 'destroy', name: '消灭', icon: '💀', effect: { type: 'DESTROY', value: 1, target: 'ENEMY' } },
];

// ============== 创建测试卡牌 ==============

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
    instanceId: `editor_${cardId}_${Date.now()}`,
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

// ============== 效果项组件 ==============

interface EffectItemProps {
  effect: EffectConfig;
  index: number;
  totalCount: number;
  onChange: (effect: EffectConfig) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function EffectItem({ effect, index, totalCount, onChange, onRemove, onMoveUp, onMoveDown }: EffectItemProps) {
  const meta = EFFECT_METADATA[effect.type];
  const [isExpanded, setIsExpanded] = useState(true);
  
  return (
    <div className="effect-item" data-effect-type={effect.type.toLowerCase()}>
      <div className="effect-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="effect-title">
          <span className="effect-number">{index + 1}</span>
          <span className="effect-icon">{meta?.icon || '❓'}</span>
          <span className="effect-name">{meta?.name || effect.type}</span>
        </div>
        <div className="effect-actions">
          <button 
            className="move-btn" 
            onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
            disabled={index === 0}
            title="上移"
          >↑</button>
          <button 
            className="move-btn" 
            onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
            disabled={index === totalCount - 1}
            title="下移"
          >↓</button>
          <button 
            className="toggle-btn"
            title={isExpanded ? '收起' : '展开'}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
          <button 
            className="remove-btn"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            title="删除"
          >✕</button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="effect-fields">
          <div className="field">
            <label>类型</label>
            <select
              value={effect.type}
              onChange={(e) => {
                const newMeta = EFFECT_METADATA[e.target.value as EffectType];
                onChange({
                  ...effect,
                  type: e.target.value as EffectType,
                  target: newMeta?.defaultTarget || effect.target
                });
              }}
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
            <div className="number-input-group">
              <button 
                className="number-btn"
                onClick={() => onChange({ ...effect, value: Math.max(1, effect.value - 1) })}
              >−</button>
              <input
                type="number"
                min="1"
                max="99"
                value={effect.value}
                onChange={(e) => onChange({ ...effect, value: Math.max(1, Math.min(99, parseInt(e.target.value) || 1)) })}
              />
              <button 
                className="number-btn"
                onClick={() => onChange({ ...effect, value: Math.min(99, effect.value + 1) })}
              >+</button>
            </div>
          </div>
          
          <div className="field">
            <label>目标</label>
            <select
              value={effect.target}
              onChange={(e) => onChange({ ...effect, target: e.target.value as TargetType })}
            >
              {Object.entries(TARGET_METADATA).map(([type, meta]) => (
                <option key={type} value={type}>
                  {meta.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

// ============== 模板选择器组件 ==============

interface TemplateSelectorProps {
  onSelect: (template: EffectTemplate) => void;
}

function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="template-selector">
      <button 
        className="template-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        ⚡ 效果模板 {isOpen ? '▲' : '▼'}
      </button>
      
      {isOpen && (
        <div className="template-grid">
          {EFFECT_TEMPLATES.map(template => (
            <button
              key={template.id}
              className="template-item"
              onClick={() => {
                onSelect(template);
                setIsOpen(false);
              }}
            >
              <span className="template-icon">{template.icon}</span>
              <span className="template-name">{template.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============== 主组件 ==============

interface CardEffectEditorProps {
  initialCardId?: string;
  onSave?: (definition: CardEffectDefinition) => void;
  /** 是否自动保存到本地存储（默认 true） */
  autoSave?: boolean;
}

export function CardEffectEditor({ initialCardId, onSave, autoSave = true }: CardEffectEditorProps) {
  // 状态
  const [selectedCardId, setSelectedCardId] = useState(initialCardId || 'holy_knight');
  const [effects, setEffects] = useState<EffectConfig[]>([]);
  const [trigger, setTrigger] = useState<TriggerType>('ON_PLAY');
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    creature: false,
    spell: true
  });
  
  // 数据
  const allCards = getAllCards();
  const creatureCards = allCards.filter(c => c.type === 'CREATURE');
  const spellCards = allCards.filter(c => c.type === 'SPELL');
  
  // 过滤后的卡牌
  const filteredCreatureCards = useMemo(() => {
    if (!searchQuery) return creatureCards;
    return creatureCards.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [creatureCards, searchQuery]);
  
  const filteredSpellCards = useMemo(() => {
    if (!searchQuery) return spellCards;
    return spellCards.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [spellCards, searchQuery]);
  
  // 选中卡牌
  const selectedCard = createTestCard(selectedCardId);
  
  // 切换折叠状态
  const toggleSection = useCallback((section: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);
  
  // 选择卡牌
  const handleCardSelect = useCallback((cardId: string) => {
    setSelectedCardId(cardId);
    // 加载该卡牌的自定义效果（如果有）
    const customEffect = getCustomEffectForCard(cardId);
    if (customEffect) {
      setEffects(customEffect.effects);
      setTrigger(customEffect.trigger);
      console.log('[CardEffectEditor] Loaded custom effect for', cardId);
    } else {
      setEffects([]);
      setTrigger('ON_PLAY');
    }
  }, []);
  
  // 添加效果
  const handleAddEffect = useCallback((partial?: Partial<EffectConfig>) => {
    const newEffect: EffectConfig = {
      id: `effect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: partial?.type || 'DAMAGE',
      value: partial?.value || 1,
      target: partial?.target || 'ENEMY',
    };
    setEffects(prev => [...prev, newEffect]);
  }, []);
  
  // 添加模板效果
  const handleAddTemplate = useCallback((template: EffectTemplate) => {
    handleAddEffect(template.effect);
  }, [handleAddEffect]);
  
  // 移除效果
  const handleRemoveEffect = useCallback((index: number) => {
    setEffects(prev => prev.filter((_, i) => i !== index));
  }, []);
  
  // 更新效果
  const handleEffectChange = useCallback((index: number, effect: EffectConfig) => {
    setEffects(prev => prev.map((e, i) => i === index ? effect : e));
  }, []);
  
  // 上移效果
  const handleMoveUp = useCallback((index: number) => {
    if (index === 0) return;
    setEffects(prev => {
      const newEffects = [...prev];
      [newEffects[index - 1], newEffects[index]] = [newEffects[index], newEffects[index - 1]];
      return newEffects;
    });
  }, []);
  
  // 下移效果
  const handleMoveDown = useCallback((index: number) => {
    setEffects(prev => {
      if (index >= prev.length - 1) return prev;
      const newEffects = [...prev];
      [newEffects[index], newEffects[index + 1]] = [newEffects[index + 1], newEffects[index]];
      return newEffects;
    });
  }, []);
  
  // 生成效果描述
  const generateDescription = useCallback((effs: EffectConfig[], trig: TriggerType): string => {
    if (effs.length === 0) return '';
    
    const triggerText = TRIGGER_OPTIONS.find(t => t.type === trig)?.name || '效果';
    const effectDescriptions = effs.map(e => {
      const meta = EFFECT_METADATA[e.type];
      const target = TARGET_METADATA[e.target];
      const value = e.value;
      
      // 根据效果类型生成描述
      switch (e.type) {
        case 'DAMAGE':
          return `对${target.name}造成${value}点伤害`;
        case 'HEAL':
          return `为${target.name}恢复${value}点生命`;
        case 'DRAW_CARD':
          return `抽${value}张牌`;
        case 'ADD_ARMOR':
          return `为${target.name}获得${value}点护甲`;
        case 'FREEZE':
          return `冻结${target.name}，使其跳过下${value}回合`;
        case 'DAMAGE_ALL':
          return `对所有${target.name}造成${value}点伤害`;
        case 'DEAL_TO_HERO':
          return `对敌方英雄造成${value}点伤害`;
        case 'GAIN_MANA':
          return `本回合获得${value}点额外法力`;
        case 'DESTROY':
          return `消灭一个${target.name}`;
        case 'COPY_CARD':
          return `复制一张${target.name}的手牌`;
        case 'SILENCE':
          return `沉默${target.name}`;
        default:
          return `${meta?.name || e.type} ${value} (${target.name})`;
      }
    });
    
    return `【${triggerText}】${effectDescriptions.join('，')}`;
  }, []);
  
  // 保存
  const handleSave = useCallback(() => {
    if (!selectedCardId || effects.length === 0) {
      alert('请至少添加一个效果！');
      return;
    }
    
    const definition: CardEffectDefinition = {
      cardId: selectedCardId,
      trigger,
      effects,
      description: generateDescription(effects, trigger),
    };
    
    // 如果启用自动保存，则保存到本地存储
    if (autoSave) {
      saveCardEffect(definition);
      alert('✅ 效果配置已保存到本地存储！');
    } else {
      alert('✅ 效果配置已准备好（未启用自动保存）');
    }
    
    // 调用外部回调
    onSave?.(definition);
  }, [selectedCardId, effects, trigger, onSave, autoSave, generateDescription]);
  
  // 效果预览描述
  const effectPreviewDescription = useMemo(() => {
    return generateDescription(effects, trigger);
  }, [effects, trigger, generateDescription]);
  
  return (
    <div className="card-effect-editor">
      <div className="editor-header">
        <h2>✏️ 卡牌效果编辑器 v1.1</h2>
        <button className="save-btn" onClick={handleSave}>
          💾 保存配置
        </button>
      </div>
      
      <div className="editor-content">
        {/* ==================== 左侧：卡牌选择 ==================== */}
        <div className="card-selection">
          <h3>选择卡牌</h3>
          
          {/* 搜索框 */}
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="搜索卡牌..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                className="clear-search"
                onClick={() => setSearchQuery('')}
              >✕</button>
            )}
          </div>
          
          {/* 生物卡 */}
          <div className="card-section">
            <div 
              className="section-header"
              onClick={() => toggleSection('creature')}
            >
              <span>🃏 生物卡 ({filteredCreatureCards.length})</span>
              <span className="collapse-icon">
                {collapsedSections.creature ? '▶' : '▼'}
              </span>
            </div>
            {!collapsedSections.creature && (
              <div className="card-grid">
                {filteredCreatureCards.map(card => (
                  <div
                    key={card.id}
                    className={`card-tile ${selectedCardId === card.id ? 'selected' : ''}`}
                    onClick={() => handleCardSelect(card.id)}
                  >
                    <div className="card-tile-preview">
                      <div className="mini-icon">🃏</div>
                    </div>
                    <div className="card-tile-info">
                      <span className="tile-name">{card.name}</span>
                      <span className="tile-cost">{card.cost}</span>
                    </div>
                    {selectedCardId === card.id && (
                      <div className="selected-indicator">✓</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* 法术卡 */}
          <div className="card-section">
            <div 
              className="section-header"
              onClick={() => toggleSection('spell')}
            >
              <span>✨ 法术卡 ({filteredSpellCards.length})</span>
              <span className="collapse-icon">
                {collapsedSections.spell ? '▶' : '▼'}
              </span>
            </div>
            {!collapsedSections.spell && (
              <div className="card-grid">
                {filteredSpellCards.map(card => (
                  <div
                    key={card.id}
                    className={`card-tile spell ${selectedCardId === card.id ? 'selected' : ''}`}
                    onClick={() => handleCardSelect(card.id)}
                  >
                    <div className="card-tile-preview">
                      <div className="mini-icon">✨</div>
                    </div>
                    <div className="card-tile-info">
                      <span className="tile-name">{card.name}</span>
                      <span className="tile-cost">{card.cost}</span>
                    </div>
                    {selectedCardId === card.id && (
                      <div className="selected-indicator">✓</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* ==================== 中间：效果配置 ==================== */}
        <div className="effect-configuration">
          <h3>效果配置</h3>
          
          {/* 选中卡牌预览 */}
          <div className="selected-card-preview">
            <div className="preview-header">
              <div className="card-type-badge">
                {selectedCard.type === 'CREATURE' ? '🃏 生物' : '✨ 法术'}
              </div>
              <span className="preview-cost">{selectedCard.cost}</span>
            </div>
            <div className="preview-name">{selectedCard.name}</div>
            {selectedCard.type === 'CREATURE' && (
              <div className="preview-stats">
                <span className="attack">⚔️ {selectedCard.attack}</span>
                <span className="health">❤️ {selectedCard.health}</span>
              </div>
            )}
          </div>
          
          {/* 触发时机选择 */}
          <div className="trigger-section">
            <h4>📢 触发时机</h4>
            <div className="trigger-options">
              {TRIGGER_OPTIONS.map(option => (
                <button
                  key={option.type}
                  className={`trigger-btn ${trigger === option.type ? 'active' : ''}`}
                  onClick={() => setTrigger(option.type)}
                  title={option.description}
                >
                  <span className="trigger-icon">{option.icon}</span>
                  <span className="trigger-name">{option.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* 效果模板 */}
          <TemplateSelector onSelect={handleAddTemplate} />
          
          {/* 效果列表 */}
          <div className="effects-list">
            <h4>⚡ 效果列表 ({effects.length})</h4>
            
            {effects.length === 0 ? (
              <div className="no-effects">
                <p>还没有添加效果</p>
                <p className="hint">点击上方「效果模板」快速添加，<br/>或点击下方「添加新效果」</p>
              </div>
            ) : (
              effects.map((effect, index) => (
                <EffectItem
                  key={effect.id}
                  effect={effect}
                  index={index}
                  totalCount={effects.length}
                  onChange={(e) => handleEffectChange(index, e)}
                  onRemove={() => handleRemoveEffect(index)}
                  onMoveUp={() => handleMoveUp(index)}
                  onMoveDown={() => handleMoveDown(index)}
                />
              ))
            )}
          </div>
          
          <button className="add-effect-btn" onClick={() => handleAddEffect()}>
            ➕ 添加新效果
          </button>
        </div>
        
        {/* ==================== 右侧：预览 ==================== */}
        <div className="effect-preview">
          <h3>👁️ 效果预览</h3>
          
          {/* 卡牌预览 */}
          <div className="preview-card">
            <div className="preview-top">
              <span className="preview-cost">{selectedCard.cost}</span>
            </div>
            <div className="preview-middle">
              <span className="preview-icon">
                {selectedCard.type === 'CREATURE' ? '🃏' : '✨'}
              </span>
            </div>
            <div className="preview-info">
              <span className="preview-name">{selectedCard.name}</span>
              <span className="preview-type">
                {selectedCard.type === 'CREATURE' ? '生物' : '法术'}
              </span>
            </div>
            
            {/* 效果图标列表 */}
            <div className="preview-effects">
              {effects.length > 0 ? (
                effects.map((e, i) => {
                  const meta = EFFECT_METADATA[e.type];
                  return (
                    <div key={i} className="preview-effect-line">
                      <span className="effect-type-icon">{meta?.icon}</span>
                      <span className="effect-value">{e.value}</span>
                    </div>
                  );
                })
              ) : (
                <span className="no-effect">无效果</span>
              )}
            </div>
          </div>
          
          {/* 效果描述预览 */}
          <div className="description-preview">
            <h4>📜 效果描述</h4>
            <div className="description-box">
              {effectPreviewDescription ? (
                <p className="description-text">{effectPreviewDescription}</p>
              ) : (
                <p className="no-description">请添加效果以预览描述</p>
              )}
            </div>
          </div>
          
          {/* 触发时机提示 */}
          <div className="trigger-hint">
            <h4>💡 提示</h4>
            <div className="hint-content">
              <p>
                <strong>{TRIGGER_OPTIONS.find(t => t.type === trigger)?.name}</strong>：
                {TRIGGER_OPTIONS.find(t => t.type === trigger)?.description}
              </p>
              {effects.length > 0 && (
                <p className="effect-count">
                  共 {effects.length} 个效果
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardEffectEditor;
