# Duel Cards ⚔️

双人对战集换式卡牌游戏，类似炉石传说。

![Version](https://img.shields.io/badge/version-v0.1.0-blue)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## 🎮 游戏特性

- **双人对战** - 与 AI 对手进行回合制卡牌对战
- **卡牌系统** - 12+ 张独特卡牌，包含生物卡和法术卡
- **卡组构筑** - 4 种预设卡组可选
- **战斗机制** - 法力水晶、攻击、防御、特殊效果
- **赛博朋克风格** - 现代化 UI 设计

## 🛠️ 技术栈

- React 18 + TypeScript
- Vite
- CSS3 (赛博朋克风格)

## 🚀 快速开始

```bash
# 克隆仓库
git clone https://github.com/YOUR_USERNAME/duel-cards.git
cd duel-cards

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 📁 项目结构

```
duel-cards/
├── src/
│   ├── components/    # UI 组件
│   ├── core/          # 游戏核心逻辑
│   ├── data/          # 卡牌数据
│   ├── hooks/         # React Hooks
│   ├── pages/         # 页面组件
│   ├── styles/        # 全局样式
│   └── types/         # TypeScript 类型定义
├── public/
└── package.json
```

## 🎯 游戏规则

1. 每回合获得法力水晶（上限 10）
2. 使用法力打出手牌中的卡牌
3. 生物卡放置到战场，可以攻击敌方生物或英雄
4. 法术卡立即生效
5. 将敌方英雄生命值降至 0 获胜

## 📝 许可证

MIT License
