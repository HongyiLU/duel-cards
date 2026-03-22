// TestMode Page - 测试模式页面
// 可视化卡牌效果测试入口

import { useState } from 'react';
import { BattleTester } from '../components/tester';
import { CardEffectEditor } from '../components/editor/CardEffectEditor';
import './TestMode.css';

type TestMode = 'battle' | 'editor';

export function TestMode() {
  const [mode, setMode] = useState<TestMode>('battle');
  
  return (
    <div className="test-mode">
      <div className="mode-tabs">
        <button 
          className={`tab ${mode === 'battle' ? 'active' : ''}`}
          onClick={() => setMode('battle')}
        >
          ⚔️ 战斗测试
        </button>
        <button 
          className={`tab ${mode === 'editor' ? 'active' : ''}`}
          onClick={() => setMode('editor')}
        >
          ✏️ 效果编辑
        </button>
      </div>
      
      <div className="mode-content">
        {mode === 'battle' && <BattleTester />}
        {mode === 'editor' && <CardEffectEditor />}
      </div>
    </div>
  );
}
