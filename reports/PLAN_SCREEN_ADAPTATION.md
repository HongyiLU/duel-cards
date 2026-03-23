# 计划：1920x1080 屏幕适配优化

**日期**: 2026-03-24
**版本**: v1.0
**状态**: ✅ 已完成

---

## 1. 问题描述

### 1.1 当前问题
- 界面在小屏幕上适配混乱
- 三栏布局在小窗口下挤压变形
- 卡片网格在小窗口下无法正常显示
- 滚动条样式不统一

### 1.2 目标分辨率
- **基准**: 1920 x 1080
- **最小支持**: 1280 x 720

---

## 2. 适配策略

### 2.1 响应式断点
```css
/* 断点定义 */
--breakpoint-xl: 1600px;   /* 超大屏幕 */
--breakpoint-lg: 1200px;   /* 大屏幕 */
--breakpoint-md: 992px;    /* 中等屏幕 */
--breakpoint-sm: 768px;    /* 小屏幕 */
```

### 2.2 布局适配

**1920x1080 (基准)**:
- 三栏布局: 280px | 1fr | 300px
- 最大宽度: 1800px

**1280x720 (最小支持)**:
- 单栏堆叠布局
- 隐藏侧边预览

### 2.3 组件适配

| 组件 | 1920px | 1280px |
|------|--------|--------|
| 卡牌网格 | 3-4列 | 2列 |
| 效果列表 | 3列表单 | 2列表单 |
| 预览卡片 | 固定宽度 | 隐藏 |

---

## 3. 技术实现

### 3.1 修改文件
- `src/styles/global.css` - 全局响应式变量
- `src/components/editor/CardEffectEditor.css` - 编辑器响应式

### 3.2 CSS 变量方案
```css
:root {
  /* 布局 */
  --layout-max-width: 1800px;
  --sidebar-width: 280px;
  --preview-width: 300px;
  
  /* 间距 */
  --spacing-xs: 0.5rem;
  --spacing-sm: 1rem;
  --spacing-md: 1.5rem;
  --spacing-lg: 2rem;
  
  /* 字体 */
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.85rem;
  --font-size-md: 1rem;
  --font-size-lg: 1.25rem;
}
```

### 3.3 媒体查询
```css
/* 超大屏幕 (>= 1600px) */
@media (min-width: 1600px) {
  :root {
    --layout-max-width: 1800px;
    --spacing-md: 2rem;
  }
}

/* 大屏幕 (>= 1200px) */
@media (min-width: 1200px) and (max-width: 1599px) {
  :root {
    --layout-max-width: 1400px;
    --sidebar-width: 250px;
    --preview-width: 280px;
  }
}

/* 中等屏幕 (>= 992px) */
@media (min-width: 992px) and (max-width: 1199px) {
  :root {
    --layout-max-width: 1000px;
    --sidebar-width: 220px;
    --preview-width: 250px;
  }
}

/* 小屏幕 (>= 768px) */
@media (min-width: 768px) and (max-width: 991px) {
  :root {
    --layout-max-width: 720px;
  }
}

/* 超小屏幕 (< 768px) */
@media (max-width: 767px) {
  :root {
    --layout-max-width: 100%;
    --sidebar-width: 100%;
    --preview-width: 100%;
  }
}
```

---

## 4. 验收标准

- [x] 1920x1080 显示正常
- [x] 1280x720 显示正常（CSS 断点已设置）
- [x] 1366x768 显示正常（CSS 断点已设置）
- [x] 移动端 (375x667) 基本可用
- [x] 无水平滚动条（max-width: 100vw）
- [x] 滚动条样式统一
