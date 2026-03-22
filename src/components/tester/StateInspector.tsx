// StateInspector - 状态检查器
// 显示和编辑当前游戏状态

import type { GameState } from '../../types';
import './StateInspector.css';

interface StateInspectorProps {
  state: GameState;
}

export function StateInspector({ state }: StateInspectorProps) {
  const { player, enemy, turn, phase } = state;
  
  return (
    <div className="state-inspector">
      <div className="inspector-header">
        <h3>📊 游戏状态</h3>
        <div className="turn-info">
          <span className="turn">回合 {turn}</span>
          <span className={`phase ${phase}`}>{phase}</span>
        </div>
      </div>
      
      <div className="players-state">
        {/* 敌方状态 */}
        <div className="player-state enemy">
          <div className="player-header">
            <span className="avatar">🤖</span>
            <span className="name">{enemy.name}</span>
          </div>
          <div className="player-stats">
            <div className="stat health">
              <span className="label">生命</span>
              <div className="bar">
                <div 
                  className="fill" 
                  style={{ width: `${(enemy.health / enemy.maxHealth) * 100}%` }}
                />
              </div>
              <span className="value">{enemy.health}/{enemy.maxHealth}</span>
            </div>
            <div className="stat armor">
              <span className="label">护甲</span>
              <span className="value">🛡️ {enemy.armor}</span>
            </div>
            <div className="stat mana">
              <span className="label">法力</span>
              <span className="value">⚡ {enemy.mana}/{enemy.maxMana}</span>
            </div>
          </div>
          <div className="hand-preview">
            <span className="label">手牌</span>
            <span className="count">{enemy.hand.length} 张</span>
          </div>
        </div>
        
        {/* 战场分隔线 */}
        <div className="field-divider">
          <span>⚔️ 战场 ⚔️</span>
        </div>
        
        {/* 我方状态 */}
        <div className="player-state player">
          <div className="player-header">
            <span className="avatar">🧙</span>
            <span className="name">{player.name}</span>
          </div>
          <div className="player-stats">
            <div className="stat health">
              <span className="label">生命</span>
              <div className="bar">
                <div 
                  className="fill player" 
                  style={{ width: `${(player.health / player.maxHealth) * 100}%` }}
                />
              </div>
              <span className="value">{player.health}/{player.maxHealth}</span>
            </div>
            <div className="stat armor">
              <span className="label">护甲</span>
              <span className="value">🛡️ {player.armor}</span>
            </div>
            <div className="stat mana">
              <span className="label">法力</span>
              <span className="value">⚡ {player.mana}/{player.maxMana}</span>
            </div>
          </div>
          <div className="hand-preview">
            <span className="label">手牌</span>
            <span className="count">{player.hand.length} 张</span>
          </div>
        </div>
      </div>
      
      {/* 战场视图 */}
      <div className="field-view">
        <div className="field enemy-field">
          <span className="field-label">敌方战场 ({enemy.field.length})</span>
          <div className="field-cards">
            {enemy.field.length === 0 ? (
              <span className="empty">无随从</span>
            ) : (
              enemy.field.map(card => (
                <div key={card.instanceId} className="mini-card">
                  <span className="attack">{card.attack}</span>
                  <span className="name">{card.name}</span>
                  <span className="health">{card.currentHealth || card.health}</span>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="field player-field">
          <span className="field-label">我方战场 ({player.field.length})</span>
          <div className="field-cards">
            {player.field.length === 0 ? (
              <span className="empty">无随从</span>
            ) : (
              player.field.map(card => (
                <div key={card.instanceId} className="mini-card">
                  <span className="attack">{card.attack}</span>
                  <span className="name">{card.name}</span>
                  <span className="health">{card.currentHealth || card.health}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* 详细JSON */}
      <details className="state-json">
        <summary>🔍 完整状态 (JSON)</summary>
        <pre>{JSON.stringify(state, null, 2)}</pre>
      </details>
    </div>
  );
}
