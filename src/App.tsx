// Main App Component

import { useState, useCallback, useEffect } from 'react';
import { GameProvider, useGame } from './hooks';
import { Menu, DeckSelect, Battle, GameOver } from './pages';
import './styles/global.css';
import './App.css';

function AppContent() {
  const { state, startGame } = useGame();
  const [screen, setScreen] = useState<'menu' | 'deckSelect' | 'battle' | 'gameOver'>('menu');
  
  // Sync screen with game phase
  useEffect(() => {
    if (state.phase === 'MENU') {
      setScreen('menu');
    } else if (state.phase === 'DECK_SELECT') {
      setScreen('deckSelect');
    } else if (state.phase === 'VICTORY' || state.phase === 'DEFEAT') {
      setScreen('gameOver');
    } else {
      setScreen('battle');
    }
  }, [state.phase]);
  
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
