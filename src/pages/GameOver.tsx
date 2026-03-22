// Game Over Component


import './GameOver.css';

interface GameOverProps {
  isVictory: boolean;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export function GameOver({ isVictory, onPlayAgain, onMainMenu }: GameOverProps) {
  return (
    <div className="game-over">
      <div className="game-over-container">
        <div className="result-icon">
          {isVictory ? '🏆' : '💀'}
        </div>
        <h1 className="result-title">
          {isVictory ? '胜利!' : '失败'}
        </h1>
        <p className="result-subtitle">
          {isVictory ? '恭喜你击败了对手!' : '再接再厉吧!'}
        </p>
        
        <div className="result-buttons">
          <button className="result-btn primary" onClick={onPlayAgain}>
            再来一局
          </button>
          <button className="result-btn secondary" onClick={onMainMenu}>
            返回主菜单
          </button>
        </div>
      </div>
    </div>
  );
}
