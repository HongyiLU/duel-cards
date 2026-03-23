// CardEditor - 卡牌编辑器 v2.0
// 支持：查看、编辑、新增、删除卡牌

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { CardData, CardRarity } from '../../types';
import {
  getAllCards,
  saveCard,
  deleteCards,
  generateCardId,
  validateCard,
  resetToDefault,
} from '../../core/CardStorage';
import { saveCardEffect, getCustomEffectForCard } from '../../core/effects/storage';
import { EFFECT_METADATA, TARGET_METADATA } from '../../core/effects/types';
import type { EffectConfig, EffectType, TargetType, TriggerType, CardEffectDefinition } from '../../core/effects/types';
import './CardEffectEditor.css';

// ============== 常量 ==============

const TRIGGER_OPTIONS: { type: TriggerType; name: string; icon: string }[] = [
  { type: 'ON_PLAY', name: '战吼', icon: '📢' },
  { type: 'ON_ATTACK', name: '攻击', icon: '⚔️' },
  { type: 'ON_DEATH', name: '亡语', icon: '💀' },
  { type: 'ON_TURN_START', name: '回合开始', icon: '🌅' },
  { type: 'ON_TURN_END', name: '回合结束', icon: '🌙' },
];

const RARITY_OPTIONS: { value: CardRarity; name: string; color: string }[] = [
  { value: 'COMMON', name: '普通', color: '#9ca3af' },
  { value: 'RARE', name: '稀有', color: '#22c55e' },
  { value: 'EPIC', name: '史诗', color: '#a855f7' },
  { value: 'LEGENDARY', name: '传说', color: '#f59e0b' },
];

const EFFECT_TEMPLATE_OPTIONS: { type: EffectType; name: string; icon: string }[] = [
  { type: 'DAMAGE', name: '伤害', icon: '⚔️' },
  { type: 'HEAL', name: '治疗', icon: '💚' },
  { type: 'ADD_ARMOR', name: '护甲', icon: '🛡️' },
  { type: 'DRAW_CARD', name: '抽牌', icon: '🎴' },
  { type: 'FREEZE', name: '冻结', icon: '❄️' },
  { type: 'DAMAGE_ALL', name: 'AOE', icon: '💥' },
  { type: 'DEAL_TO_HERO', name: '打脸', icon: '🎯' },
  { type: 'GAIN_MANA', name: '法力', icon: '⚡' },
  { type: 'DESTROY', name: '消灭', icon: '💀' },
];

// ============== 接口 ==============

interface CardEditorProps {
  initialCardId?: string;
}

// ============== 主组件 ==============

export function CardEditor({ initialCardId }: CardEditorProps) {
  // 卡牌列表
  const [cards, setCards] = useState<CardData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // 选中状态
  const [selectedCardId, setSelectedCardId] = useState<string | null>(initialCardId || null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // 当前编辑的卡牌
  const [editingCard, setEditingCard] = useState<Partial<CardData>>({
    name: '',
    cost: 1,
    attack: 1,
    health: 2,
    type: 'CREATURE',
    rarity: 'COMMON',
    description: '',
    effects: [],
  });
  
  // 效果配置
  const [effects, setEffects] = useState<EffectConfig[]>([]);
  const [trigger, setTrigger] = useState<TriggerType>('ON_PLAY');
  
  // UI 状态
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false); // 选择模式（用于批量删除）
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    creature: false,
    spell: false,
  });
  
  // 加载卡牌数据
  useEffect(() => {
    setCards(getAllCards());
  }, []);
  
  // 加载选中卡牌的数据
  useEffect(() => {
    if (selectedCardId) {
      const card = cards.find(c => c.id === selectedCardId);
      if (card) {
        setEditingCard({ ...card });
        setIsCreatingNew(false);
        // 加载自定义效果
        const customEffect = getCustomEffectForCard(selectedCardId);
        if (customEffect) {
          setEffects(customEffect.effects);
          setTrigger(customEffect.trigger);
        } else {
          setEffects([]);
          setTrigger('ON_PLAY');
        }
      }
    }
  }, [selectedCardId, cards]);
  
  // 过滤后的卡牌
  const filteredCards = useMemo(() => {
    if (!searchQuery) return cards;
    const query = searchQuery.toLowerCase();
    return cards.filter(c => 
      c.name.toLowerCase().includes(query) ||
      c.description.toLowerCase().includes(query)
    );
  }, [cards, searchQuery]);
  
  const creatureCards = useMemo(() => filteredCards.filter(c => c.type === 'CREATURE'), [filteredCards]);
  const spellCards = useMemo(() => filteredCards.filter(c => c.type === 'SPELL'), [filteredCards]);
  
  // 切换折叠
  const toggleSection = useCallback((section: string) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  }, []);
  
  // 选择卡牌
  const handleSelectCard = useCallback((cardId: string) => {
    if (isSelectMode) {
      // 选择模式下切换选中状态
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(cardId)) {
          newSet.delete(cardId);
        } else {
          newSet.add(cardId);
        }
        return newSet;
      });
    } else {
      // 正常模式下选中卡牌
      setSelectedCardId(cardId);
      setSelectedIds(new Set());
    }
  }, [isSelectMode]);
  
  // 新增卡牌
  const handleCreateNew = useCallback(() => {
    const newId = generateCardId();
    const newCard: Partial<CardData> = {
      id: newId,
      name: '新卡牌',
      cost: 1,
      attack: 1,
      health: 2,
      type: 'CREATURE',
      rarity: 'COMMON',
      description: '',
      effects: [],
    };
    setEditingCard(newCard);
    setSelectedCardId(newId);
    setEffects([]);
    setTrigger('ON_PLAY');
    setIsCreatingNew(true);
  }, []);
  
  // 保存卡牌
  const handleSave = useCallback(() => {
    if (!editingCard.id) return;
    
    const errors = validateCard(editingCard);
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }
    
    saveCard(editingCard as CardData);
    
    // 保存效果
    if (effects.length > 0) {
      const effectDef: CardEffectDefinition = {
        cardId: editingCard.id!,
        trigger,
        effects,
        description: generateEffectDescription(effects, trigger),
      };
      saveCardEffect(effectDef);
    }
    
    // 刷新列表
    setCards(getAllCards());
    setIsCreatingNew(false);
    alert('✅ 卡牌保存成功！');
  }, [editingCard, effects, trigger]);
  
  // 删除选中卡牌
  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.size === 0) {
      alert('请先选择要删除的卡牌');
      return;
    }
    setShowDeleteConfirm(true);
  }, [selectedIds]);
  
  // 确认删除
  const handleConfirmDelete = useCallback(() => {
    deleteCards(Array.from(selectedIds));
    setCards(getAllCards());
    setSelectedIds(new Set());
    setShowDeleteConfirm(false);
    if (selectedIds.has(selectedCardId || '')) {
      setSelectedCardId(null);
    }
  }, [selectedIds, selectedCardId]);
  
  // 更新卡牌字段
  const handleUpdateField = useCallback(<K extends keyof CardData>(
    field: K, 
    value: CardData[K]
  ) => {
    setEditingCard(prev => ({ ...prev, [field]: value }));
  }, []);
  
  // 添加效果
  const handleAddEffect = useCallback(() => {
    const newEffect: EffectConfig = {
      id: `effect_${Date.now()}`,
      type: 'DAMAGE',
      value: 1,
      target: 'ENEMY',
    };
    setEffects(prev => [...prev, newEffect]);
  }, []);
  
  // 移除效果
  const handleRemoveEffect = useCallback((index: number) => {
    setEffects(prev => prev.filter((_, i) => i !== index));
  }, []);
  
  // 更新效果
  const handleUpdateEffect = useCallback((index: number, effect: EffectConfig) => {
    setEffects(prev => prev.map((e, i) => i === index ? effect : e));
  }, []);
  
  // 生成效果描述
  const generateEffectDescription = (effs: EffectConfig[], trig: TriggerType): string => {
    if (effs.length === 0) return '';
    const triggerName = TRIGGER_OPTIONS.find(t => t.type === trig)?.name || '效果';
    const descriptions = effs.map(e => {
      const meta = EFFECT_METADATA[e.type];
      const target = TARGET_METADATA[e.target];
      return `${meta?.icon || ''} ${meta?.name || e.type} ${e.value} → ${target?.name || e.target}`;
    });
    return `【${triggerName}】${descriptions.join('，')}`;
  };
  
  // 重置为默认
  const handleReset = useCallback(() => {
    if (confirm('确定要重置为默认卡牌吗？所有自定义卡牌将被删除。')) {
      resetToDefault();
      setCards(getAllCards());
      setSelectedCardId(null);
      setSelectedIds(new Set());
    }
  }, []);
  
  // 获取稀有度颜色
  const getRarityColor = (rarity: CardRarity) => 
    RARITY_OPTIONS.find(r => r.value === rarity)?.color || '#9ca3af';
  
  return (
    <div className="card-effect-editor">
      {/* 头部 */}
      <div className="editor-header">
        <h2>🎴 卡牌编辑器 v2.0</h2>
        <div className="header-actions">
          <button className="btn-add-header" onClick={handleCreateNew}>
            ➕ 新增卡牌
          </button>
          <button 
            className={`btn-select-mode ${isSelectMode ? 'active' : ''}`}
            onClick={() => {
              setIsSelectMode(!isSelectMode);
              if (isSelectMode) {
                setSelectedIds(new Set());
              }
            }}
          >
            {isSelectMode ? '✓ 选择模式' : '○ 选择模式'}
          </button>
          <button className="btn-secondary" onClick={handleReset}>
            🔄 重置
          </button>
          <button 
            className="save-btn" 
            onClick={handleSave}
            disabled={!editingCard.id}
          >
            💾 保存
          </button>
        </div>
      </div>
      
      <div className="editor-content">
        {/* ==================== 左侧：卡牌列表 ==================== */}
        <div className="card-selection">
          <div className="section-header-row">
            <h3>📋 卡牌列表 {isSelectMode && <span className="select-mode-hint">(点击选中)</span>}</h3>
          </div>
          
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
              <button className="clear-search" onClick={() => setSearchQuery('')}>✕</button>
            )}
          </div>
          
          {/* 删除按钮 - 选择模式下显示 */}
          {isSelectMode && selectedIds.size > 0 && (
            <button 
              className="btn-delete-selected"
              onClick={handleDeleteSelected}
            >
              🗑️ 删除选中 ({selectedIds.size})
            </button>
          )}
          
          {/* 选择模式提示 */}
          {isSelectMode && (
            <div className="select-mode-tip">
              点击卡牌进行多选，选完后再点击「删除选中」
            </div>
          )}
          
          {/* 生物卡 */}
          <div className="card-section">
            <div className="section-header" onClick={() => toggleSection('creature')}>
              <span>🃏 生物卡 ({creatureCards.length})</span>
              <span className="collapse-icon">{collapsedSections.creature ? '▶' : '▼'}</span>
            </div>
            {!collapsedSections.creature && (
              <div className="card-list">
                {creatureCards.map(card => (
                  <div
                    key={card.id}
                    className={`card-item ${selectedCardId === card.id && !isSelectMode ? 'selected' : ''} ${selectedIds.has(card.id) ? 'multi-selected' : ''}`}
                    onClick={() => handleSelectCard(card.id)}
                  >
                    <div 
                      className="card-item-indicator"
                      style={{ background: getRarityColor(card.rarity) }}
                    />
                    <div className="card-item-info">
                      <span className="card-item-name">{card.name}</span>
                      <span className="card-item-stats">
                        {card.cost}费 ⚔{card.attack} ❤{card.health}
                      </span>
                    </div>
                    {selectedIds.has(card.id) && (
                      <span className="multi-select-badge">✓</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* 法术卡 */}
          <div className="card-section">
            <div className="section-header" onClick={() => toggleSection('spell')}>
              <span>✨ 法术卡 ({spellCards.length})</span>
              <span className="collapse-icon">{collapsedSections.spell ? '▶' : '▼'}</span>
            </div>
            {!collapsedSections.spell && (
              <div className="card-list">
                {spellCards.map(card => (
                  <div
                    key={card.id}
                    className={`card-item ${selectedCardId === card.id && !isSelectMode ? 'selected' : ''} ${selectedIds.has(card.id) ? 'multi-selected' : ''}`}
                    onClick={() => handleSelectCard(card.id)}
                  >
                    <div 
                      className="card-item-indicator"
                      style={{ background: getRarityColor(card.rarity) }}
                    />
                    <div className="card-item-info">
                      <span className="card-item-name">{card.name}</span>
                      <span className="card-item-stats">{card.cost}费</span>
                    </div>
                    {selectedIds.has(card.id) && (
                      <span className="multi-select-badge">✓</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* ==================== 中间：卡牌信息编辑 ==================== */}
        <div className="effect-configuration">
          {editingCard.id ? (
            <>
              <h3>{isCreatingNew ? '🆕 新增卡牌' : '✏️ 编辑卡牌'}</h3>
              
              {/* 基本信息 */}
              <div className="info-section">
                <h4>📝 基本信息</h4>
                
                <div className="field-row">
                  <label>名称</label>
                  <input
                    type="text"
                    value={editingCard.name || ''}
                    onChange={(e) => handleUpdateField('name', e.target.value)}
                    placeholder="卡牌名称"
                  />
                </div>
                
                <div className="field-row">
                  <label>费用</label>
                  <div className="number-input">
                    <button onClick={() => handleUpdateField('cost', Math.max(0, (editingCard.cost || 0) - 1))}>−</button>
                    <input
                      type="number"
                      value={editingCard.cost || 0}
                      onChange={(e) => handleUpdateField('cost', Math.max(0, Math.min(10, parseInt(e.target.value) || 0)))}
                      min="0"
                      max="10"
                    />
                    <button onClick={() => handleUpdateField('cost', Math.min(10, (editingCard.cost || 0) + 1))}>+</button>
                  </div>
                </div>
                
                <div className="field-row">
                  <label>类型</label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input
                        type="radio"
                        checked={editingCard.type === 'CREATURE'}
                        onChange={() => handleUpdateField('type', 'CREATURE')}
                      />
                      🃏 生物卡
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        checked={editingCard.type === 'SPELL'}
                        onChange={() => handleUpdateField('type', 'SPELL')}
                      />
                      ✨ 法术卡
                    </label>
                  </div>
                </div>
                
                <div className="field-row">
                  <label>稀有度</label>
                  <select
                    value={editingCard.rarity || 'COMMON'}
                    onChange={(e) => handleUpdateField('rarity', e.target.value as CardRarity)}
                  >
                    {RARITY_OPTIONS.map(r => (
                      <option key={r.value} value={r.value}>{r.name}</option>
                    ))}
                  </select>
                </div>
                
                {editingCard.type === 'CREATURE' && (
                  <>
                    <div className="field-row">
                      <label>攻击力</label>
                      <div className="number-input">
                        <button onClick={() => handleUpdateField('attack', Math.max(0, (editingCard.attack || 0) - 1))}>−</button>
                        <input
                          type="number"
                          value={editingCard.attack || 0}
                          onChange={(e) => handleUpdateField('attack', Math.max(0, parseInt(e.target.value) || 0))}
                          min="0"
                        />
                        <button onClick={() => handleUpdateField('attack', (editingCard.attack || 0) + 1)}>+</button>
                      </div>
                    </div>
                    
                    <div className="field-row">
                      <label>生命值</label>
                      <div className="number-input">
                        <button onClick={() => handleUpdateField('health', Math.max(1, (editingCard.health || 1) - 1))}>−</button>
                        <input
                          type="number"
                          value={editingCard.health || 1}
                          onChange={(e) => handleUpdateField('health', Math.max(1, parseInt(e.target.value) || 1))}
                          min="1"
                        />
                        <button onClick={() => handleUpdateField('health', (editingCard.health || 1) + 1)}>+</button>
                      </div>
                    </div>
                  </>
                )}
                
                <div className="field-row">
                  <label>描述</label>
                  <textarea
                    value={editingCard.description || ''}
                    onChange={(e) => handleUpdateField('description', e.target.value)}
                    placeholder="卡牌描述..."
                    rows={3}
                  />
                </div>
              </div>
              
              {/* 效果配置 */}
              <div className="info-section">
                <h4>⚡ 效果配置</h4>
                
                <div className="field-row">
                  <label>触发时机</label>
                  <div className="trigger-options">
                    {TRIGGER_OPTIONS.map(opt => (
                      <button
                        key={opt.type}
                        className={`trigger-btn ${trigger === opt.type ? 'active' : ''}`}
                        onClick={() => setTrigger(opt.type)}
                      >
                        <span>{opt.icon}</span>
                        <span>{opt.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="effects-list">
                  {effects.map((effect, index) => (
                    <EffectItem
                      key={effect.id}
                      effect={effect}
                      index={index}
                      onChange={(e) => handleUpdateEffect(index, e)}
                      onRemove={() => handleRemoveEffect(index)}
                    />
                  ))}
                </div>
                
                <button className="add-effect-btn" onClick={handleAddEffect}>
                  ➕ 添加效果
                </button>
              </div>
            </>
          ) : (
            <div className="no-selection">
              <p>👈 请从左侧选择一张卡牌进行编辑</p>
              <p>或点击「+ 新增」创建新卡牌</p>
            </div>
          )}
        </div>
        
        {/* ==================== 右侧：预览 ==================== */}
        <div className="effect-preview">
          <h3>👁️ 预览</h3>
          
          {editingCard.id ? (
            <>
              <div className="preview-card" style={{ borderColor: getRarityColor(editingCard.rarity || 'COMMON') }}>
                <div className="preview-top">
                  <span className="preview-cost">{editingCard.cost}</span>
                </div>
                <div className="preview-middle">
                  <span className="preview-icon">
                    {editingCard.type === 'CREATURE' ? '🃏' : '✨'}
                  </span>
                </div>
                <div className="preview-info">
                  <span className="preview-name">{editingCard.name || '未命名'}</span>
                  <span className="preview-type">
                    {editingCard.type === 'CREATURE' ? '生物' : '法术'}
                  </span>
                </div>
                
                {editingCard.type === 'CREATURE' && (
                  <div className="preview-stats">
                    <span className="attack">⚔️ {editingCard.attack}</span>
                    <span className="health">❤️ {editingCard.health}</span>
                  </div>
                )}
                
                <div className="preview-description">
                  {editingCard.description || '无描述'}
                </div>
                
                {effects.length > 0 && (
                  <div className="preview-effects">
                    {effects.map((e, i) => (
                      <span key={i} className="effect-badge">
                        {EFFECT_METADATA[e.type]?.icon} {e.value}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="description-preview">
                <h4>📜 效果描述</h4>
                <div className="description-box">
                  <p className="description-text">
                    {effects.length > 0 
                      ? generateEffectDescription(effects, trigger)
                      : '无效果'
                    }
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="no-selection">
              <p>预览区域</p>
            </div>
          )}
        </div>
      </div>
      
      {/* 删除确认弹窗 */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>⚠️ 确认删除</h3>
            <p>确定要删除选中的 {selectedIds.size} 张卡牌吗？</p>
            <p className="warning">此操作不可恢复！</p>
            <div className="modal-actions">
              <button onClick={() => setShowDeleteConfirm(false)}>取消</button>
              <button className="btn-danger" onClick={handleConfirmDelete}>确认删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============== 效果项组件 ==============

interface EffectItemProps {
  effect: EffectConfig;
  index: number;
  onChange: (effect: EffectConfig) => void;
  onRemove: () => void;
}

function EffectItem({ effect, index, onChange, onRemove }: EffectItemProps) {
  return (
    <div className="effect-item">
      <div className="effect-header">
        <span className="effect-number">{index + 1}</span>
        <span className="effect-name">{EFFECT_METADATA[effect.type]?.name || effect.type}</span>
        <button className="remove-btn" onClick={onRemove}>✕</button>
      </div>
      <div className="effect-fields">
        <div className="field">
          <label>类型</label>
          <select
            value={effect.type}
            onChange={(e) => onChange({ ...effect, type: e.target.value as EffectType })}
          >
            {EFFECT_TEMPLATE_OPTIONS.map(opt => (
              <option key={opt.type} value={opt.type}>{opt.icon} {opt.name}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>数值</label>
          <div className="number-input small">
            <button onClick={() => onChange({ ...effect, value: Math.max(1, effect.value - 1) })}>−</button>
            <input
              type="number"
              value={effect.value}
              onChange={(e) => onChange({ ...effect, value: Math.max(1, parseInt(e.target.value) || 1) })}
              min="1"
            />
            <button onClick={() => onChange({ ...effect, value: effect.value + 1 })}>+</button>
          </div>
        </div>
        <div className="field">
          <label>目标</label>
          <select
            value={effect.target}
            onChange={(e) => onChange({ ...effect, target: e.target.value as TargetType })}
          >
            {Object.entries(TARGET_METADATA).map(([type, meta]) => (
              <option key={type} value={type}>{meta.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default CardEditor;
