// Main App Component

import { useState, useCallback, useEffect } from 'react';
import { GameProvider, useGame } from './hooks';
import { Menu, DeckSelect, Battle, GameOver } from './pages';
import { TestMode } from './pages/TestMode';
import './styles/global.css';
import './App.css';

type Screen = 'menu' | 'deckSelect' | 'battle' | 'gameOver' | 'testMode';

function AppContent() {
  const { state, startGame } = useGame();
  const [screen, setScreen] = useState<Screen>('menu');
  
  // Sync screen with game phase
  useEffect(() => {
    if (screen === 'testMode') return; // Don't auto-change from test mode
    
    if (state.phase === 'MENU') {
      setScreen('menu');
    } else if (state.phase === 'DECK_SELECT') {
      setScreen('deckSelect');
    } else if (state.phase === 'VICTORY' || state.phase === 'DEFEAT') {
      setScreen('gameOver');
    } else {
      setScreen('battle');
    }
  }, [state.phase, screen]);
  
  const handleStartGame = useCallback(() => {
    setScreen('deckSelect');
  }, []);
  
  const handleSelectDeck = useCallback((deckId: string) => {
    startGame(deckId, 'starter');
    setScreen('battle');
  }, [startGame]);
  
  const handleBackToMenu = useCallback(() => {
    setScreen('menu');
  }, []);
  
  const handlePlayAgain = useCallback(() => {
    setScreen('deckSelect');
  }, []);
  
  const handleOpenTestMode = useCallback(() => {
    setScreen('testMode');
  }, []);
  
  const handleCloseTestMode = useCallback(() => {
    setScreen('menu');
  }, []);
  
  return (
    <div className="app">
      {screen === 'menu' && (
        <Menu onStartGame={handleStartGame} />
      )}
      
      {screen === 'deckSelect' && (
        <DeckSelect 
          onSelectDeck={handleSelectDeck}
          onBack={handleBackToMenu}
        />
      )}
      
      {screen === 'battle' && (
        <Battle />
      )}
      
      {screen === 'gameOver' && (
        <GameOver 
          isVictory={state.phase === 'VICTORY'}
          onPlayAgain={handlePlayAgain}
          onMainMenu={handleBackToMenu}
        />
      )}
      
      {screen === 'testMode' && (
        <TestModeWrapper onClose={handleCloseTestMode} />
      )}
      
      {/* Test Mode Button (visible on all screens except testMode) */}
      {screen !== 'testMode' && (
        <button className="test-mode-btn" onClick={handleOpenTestMode}>
          🧪 测试模式
        </button>
      )}
    </div>
  );
}

// Wrapper for TestMode that doesn't need GameProvider
function TestModeWrapper({ onClose }: { onClose: () => void }) {
  return (
    <div className="test-mode-wrapper">
      <button className="close-test-btn" onClick={onClose}>
        ✕ 关闭测试模式
      </button>
      <TestMode />
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

export default App;
