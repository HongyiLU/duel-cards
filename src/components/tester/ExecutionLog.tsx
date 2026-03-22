// ExecutionLog - 执行日志
// 显示效果执行的历史记录

import type { EffectLogEntry } from '../../core/effects/types';
import { EFFECT_METADATA } from '../../core/effects';
import './ExecutionLog.css';

interface ExecutionLogProps {
  logs: EffectLogEntry[];
  maxDisplay?: number;
}

export function ExecutionLog({ logs, maxDisplay = 50 }: ExecutionLogProps) {
  const displayLogs = logs.slice(0, maxDisplay);
  
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };
  
  const getEffectIcon = (effectType: string) => {
    const meta = EFFECT_METADATA[effectType as keyof typeof EFFECT_METADATA];
    return meta?.icon || '❓';
  };
  
  return (
    <div className="execution-log">
      <div className="log-header">
        <h3>📜 执行日志</h3>
        <span className="log-count">{logs.length} 条记录</span>
      </div>
      
      <div className="log-list">
        {displayLogs.length === 0 ? (
          <div className="log-empty">
            <span>暂无执行记录</span>
            <span className="hint">从上方选择卡牌和效果开始测试</span>
          </div>
        ) : (
          displayLogs.map((log, index) => (
            <div key={log.id} className="log-entry">
              <div className="log-header-row">
                <span className="log-time">{formatTime(log.timestamp)}</span>
                <span className="log-card">{log.cardName}</span>
                <span className="log-effect">
                  {getEffectIcon(log.effectType)}
                  {' '}
                  {log.description}
                </span>
              </div>
              
              {log.changes.length > 0 && (
                <div className="log-changes">
                  {log.changes.map((change, i) => (
                    <div key={i} className="change-item">
                      <span className="change-path">{change.path}:</span>
                      <span className="change-old">{change.oldValue}</span>
                      <span className="change-arrow">→</span>
                      <span className="change-new">{change.newValue}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {index < displayLogs.length - 1 && <div className="log-divider" />}
            </div>
          ))
        )}
      </div>
      
      {logs.length > maxDisplay && (
        <div className="log-overflow">
          还有 {logs.length - maxDisplay} 条更早的记录...
        </div>
      )}
    </div>
  );
}
