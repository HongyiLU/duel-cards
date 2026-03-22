// Main Menu Component


import './Menu.css';

interface MenuProps {
  onStartGame: () => void;
}

export function Menu({ onStartGame }: MenuProps) {
  return (
    <div className="menu">
      <div className="menu-container">
        <h1 className="game-title">
          <span className="title-icon">⚔️</span>
          Duel Cards
          <span className="title-icon">⚔️</span>
        </h1>
        <p className="game-subtitle">双人对战集换式卡牌游戏</p>
        
        <div className="menu-buttons">
          <button className="menu-btn primary" onClick={onStartGame}>
            <span className="btn-icon">🎮</span>
            开始对战
          </button>
          <button className="menu-btn secondary" disabled>
            <span className="btn-icon">📖</span>
            卡牌图鉴
          </button>
          <button className="menu-btn secondary" disabled>
            <span className="btn-icon">⚙️</span>
            设置
          </button>
        </div>
        
        <div className="version">v0.1.0</div>
      </div>
    </div>
  );
}
