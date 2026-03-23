# 计划：修复卡牌效果编辑器保存功能

**日期**: 2026-03-24
**版本**: v1.0
**状态**: 待开发

---

## 1. 问题描述

### 1.1 Bug 描述
点击「保存配置」后，卡牌效果没有被正确保存。刷新页面后，之前保存的效果丢失。

### 1.2 根因分析
`CardEffectEditor` 组件的 `onSave` 回调只是向外传递数据，**没有实际保存实现**：
- 原代码只调用 `onSave?.(definition)` 和 `alert()`
- 没有将数据写入任何持久化存储
- 组件重新挂载后数据丢失

### 1.3 影响范围
- 用户在效果编辑器中配置的效果无法持久化
- 每次进入编辑器都需要重新配置
- 体验极差

---

## 2. 功能需求

### 2.1 核心功能
- [ ] 使用 localStorage 持久化保存卡牌效果
- [ ] 保存后刷新页面效果不丢失
- [ ] 选择已配置的卡牌时自动加载效果
- [ ] 支持删除已保存的效果

### 2.2 存储结构
```typescript
interface CardEffectDefinition {
  cardId: string;
  trigger: TriggerType;
  effects: EffectConfig[];
  description: string;
}

// localStorage key: 'duel_cards_custom_effects'
// value: CardEffectDefinition[]
```

### 2.3 API 设计
```typescript
// 保存单个卡牌效果
function saveCardEffect(definition: CardEffectDefinition): void

// 获取单个卡牌效果
function getCustomEffectForCard(cardId: string): CardEffectDefinition | undefined

// 获取所有效果
function getAllCustomEffects(): CardEffectDefinition[]

// 删除效果
function removeCustomEffect(cardId: string): void

// 清除所有
function clearAllCustomEffects(): void
```

---

## 3. 技术方案

### 3.1 新增文件
- `src/core/effects/storage.ts` - 效果存储模块

### 3.2 修改文件
- `src/components/editor/CardEffectEditor.tsx` - 集成存储功能
- `src/core/effects/index.ts` - 导出 storage 模块

### 3.3 实现要点
1. 创建 storage.ts 实现存储 CRUD
2. 在 CardEffectEditor 中导入并使用
3. 选择卡牌时自动加载已保存效果
4. 保存时写入 localStorage

---

## 4. 验收标准

- [ ] 保存效果后刷新页面，效果仍然存在
- [ ] 选择已配置的卡牌，自动加载效果
- [ ] 控制台显示保存/加载日志
- [ ] 构建成功，无 TypeScript 错误
- [ ] 单元测试通过
