# 计划：卡牌编辑器功能扩展 v2.0

**日期**: 2026-03-24
**版本**: v2.0
**状态**: ✅ 已完成

---

## 1. 需求概述

### 1.1 扩展目标
- ✅ 支持编辑卡牌所有信息（名称、费用、攻击力、生命值、类型、稀有度、描述）
- ✅ 支持新增卡牌
- ✅ 支持删除卡牌
- ✅ 卡牌数据持久化保存

### 1.2 当前状态
- 仅支持选择已有卡牌
- 仅支持配置效果
- 不支持新增/删除卡牌

---

## 2. 功能设计

### 2.1 卡牌完整信息

```typescript
interface CardData {
  id: string;           // 唯一标识
  name: string;         // 卡牌名称
  cost: number;         // 费用
  attack: number;        // 攻击力（生物卡）
  health: number;        // 生命值（生物卡）
  type: 'CREATURE' | 'SPELL';  // 类型
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';  // 稀有度
  description: string;   // 描述文本
  effects: string[];     // 效果标签
}
```

### 2.2 新增功能

#### 2.2.1 卡牌信息编辑区
```
┌─────────────────────────────────────────┐
│ 📝 卡牌信息                              │
├─────────────────────────────────────────┤
│ 名称: [_______________]                  │
│ 费用: [1] [-][+]                        │
│ 费用上限: [3]  ← 法术卡无此项            │
│                                         │
│ 类型: (●) 生物卡  ( ) 法术卡            │
│ 稀有度: [普通 ▼]                         │
│                                         │
│ ▼ 生物卡专属                             │
│   攻击力: [1] [-][+]                    │
│   生命值: [2] [-][+]                    │
│                                         │
│ 描述: [________________________]         │
│       [________________________]         │
└─────────────────────────────────────────┘
```

#### 2.2.2 卡牌列表管理
```
┌─────────────────────────────────────────┐
│ 📋 卡牌列表                    [+ 新增] │
├─────────────────────────────────────────┤
│ 🔍 搜索: [____________]                 │
│                                         │
│ ▼ 生物卡 (8)              [全部展开 ▼]  │
│   ☑ 🃏 钢铁士兵    1费 ⚔1 ❤2          │
│   ☐ 🃏 火焰学徒  2费 ⚔2 ❤2          │
│   ☐ 🃏 圣光骑士  3费 ⚔3 ❤3          │
│   ...                                   │
│                                         │
│ ▼ 法术卡 (4)                           │
│   ☐ ✨ 电磁脉冲  2费                   │
│   ...                                   │
│                                         │
│ [🗑️ 删除选中]                          │
└─────────────────────────────────────────┘
```

### 2.3 操作流程

#### 新增卡牌
1. 点击「+ 新增卡牌」按钮
2. 选择卡牌类型（生物/法术）
3. 填写卡牌信息
4. 配置效果（可选）
5. 点击「💾 保存」
6. 新卡牌出现在列表中

#### 编辑卡牌
1. 点击左侧卡牌列表选择卡牌
2. 中间区域显示该卡牌的所有信息
3. 修改信息或效果
4. 点击「💾 保存」更新

#### 删除卡牌
1. 在卡牌列表勾选要删除的卡牌
2. 点击「🗑️ 删除选中」
3. 确认删除对话框
4. 卡牌从列表和数据库中移除

---

## 3. 技术实现

### 3.1 数据存储
```typescript
// localStorage key: 'duel_cards_custom_cards'
interface StoredCards {
  cards: CardData[];
  lastUpdated: string;
}
```

### 3.2 组件结构
```
CardEditor (主组件)
├── CardListPanel      // 左侧：卡牌列表
│   ├── SearchBar      // 搜索框
│   ├── CardGroup     // 分组（生物/法术）
│   └── ActionButtons // 新增/删除按钮
├── CardInfoPanel     // 中间：卡牌信息编辑
│   ├── BasicInfo     // 基本信息
│   ├── TypeSpecific  // 类型专属（攻击/生命）
│   └── Description   // 描述
├── CardEffectPanel   // 右侧：效果配置（复用现有）
└── CardPreview      // 预览
```

### 3.3 新增文件
- `src/core/CardStorage.ts` - 卡牌数据存储
- `src/components/editor/CardInfoEditor.tsx` - 卡牌信息编辑组件
- `src/components/editor/CardList.tsx` - 卡牌列表组件

### 3.4 修改文件
- `CardEffectEditor.tsx` - 整合新功能
- `CardEffectEditor.css` - 新增样式

---

## 4. API 设计

### 4.1 存储 API
```typescript
// 获取所有卡牌
function getAllCards(): CardData[]

// 获取单个卡牌
function getCardById(id: string): CardData | undefined

// 保存卡牌（新增/更新）
function saveCard(card: CardData): void

// 删除卡牌
function deleteCard(id: string): void

// 批量删除
function deleteCards(ids: string[]): void
```

---

## 5. 验收标准

- [x] 可以查看所有卡牌列表
- [x] 可以搜索过滤卡牌
- [x] 可以选择卡牌进行编辑
- [x] 可以编辑所有卡牌信息
- [x] 可以新增卡牌
- [x] 可以删除卡牌（右键多选）
- [x] 数据持久化保存
- [x] 构建成功，无错误
