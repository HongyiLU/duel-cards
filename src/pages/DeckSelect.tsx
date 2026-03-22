// Deck Selection Component

import { useState } from 'react';
import { ALL_DECKS } from '../data';
import './DeckSelect.css';

interface DeckSelectProps {
  onSelectDeck: (deckId: string) => void;
  onBack: () => void;
}

export function DeckSelect({ onSelectDeck, onBack }: DeckSelectProps) {
  const [selectedDeck, setSelectedDeck] = useState<string>('starter');
  
  return (
    <div className="deck-select">
      <div className="deck-select-container">
        <h2 className="section-title">选择你的卡组</h2>
        
        <div className="deck-grid">
          {ALL_DECKS.map(deck => (
            <div
              key={deck.id}
              className={`deck-card ${selectedDeck === deck.id ? 'selected' : ''}`}
              onClick={() => setSelectedDeck(deck.id)}
            >
              <div className="deck-icon">🎴</div>
              <div className="deck-name">{deck.name}</div>
              <div className="deck-cards-count">{deck.cards.length} 张卡牌</div>
            </div>
          ))}
        </div>
        
        <div className="action-buttons">
          <button className="action-btn back" onClick={onBack}>
            返回
          </button>
          <button className="action-btn confirm" onClick={() => onSelectDeck(selectedDeck)}>
            开始对战
          </button>
        </div>
      </div>
    </div>
  );
}
