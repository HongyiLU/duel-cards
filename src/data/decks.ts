// Predefined Decks

import type { Deck } from '../types';

// Starter deck for beginners
export const STARTER_DECK: Deck = {
  id: 'starter',
  name: '新手卡组',
  cards: [
    'steel_soldier', 'steel_soldier', 'steel_soldier',
    'flame_apprentice', 'flame_apprentice',
    'shadow_assassin',
    'forest_guardian',
    'thunder_giant',
    'holy_knight',
    'emp_blast', 'emp_blast',
    'energy_shield', 'energy_shield',
    'lightning_strike',
    'healing_light', 'healing_light',
    // Fill to 20
    'steel_soldier', 'flame_apprentice', 'forest_guardian', 'holy_knight',
  ],
};

// Aggressive deck
export const AGGRO_DECK: Deck = {
  id: 'aggro',
  name: '快攻卡组',
  cards: [
    'steel_soldier', 'steel_soldier', 'steel_soldier',
    'flame_apprentice', 'flame_apprentice', 'flame_apprentice',
    'shadow_assassin', 'shadow_assassin', 'shadow_assassin',
    'holy_knight', 'holy_knight',
    'thunder_giant', 'thunder_giant',
    'lightning_strike', 'lightning_strike',
    'emp_blast', 'emp_blast',
    'energy_shield', 'energy_shield',
    'healing_light',
  ],
};

// Control deck
export const CONTROL_DECK: Deck = {
  id: 'control',
  name: '控制卡组',
  cards: [
    'forest_guardian', 'forest_guardian', 'forest_guardian',
    'frost_dragon',
    'shadow_lord',
    'thunder_giant', 'thunder_giant', 'thunder_giant',
    'holy_knight', 'holy_knight',
    'lightning_strike', 'lightning_strike', 'lightning_strike',
    'healing_light', 'healing_light', 'healing_light',
    'energy_shield', 'energy_shield', 'energy_shield',
    'emp_blast',
  ],
};

// Dragon deck
export const DRAGON_DECK: Deck = {
  id: 'dragon',
  name: '龙族卡组',
  cards: [
    'frost_dragon', 'frost_dragon',
    'shadow_lord',
    'thunder_giant', 'thunder_giant',
    'forest_guardian', 'forest_guardian',
    'holy_knight', 'holy_knight',
    'flame_apprentice', 'flame_apprentice',
    'shadow_assassin', 'shadow_assassin',
    'lightning_strike', 'lightning_strike',
    'healing_light', 'healing_light',
    'steel_soldier', 'steel_soldier',
    'energy_shield',
  ],
};

export const ALL_DECKS = [STARTER_DECK, AGGRO_DECK, CONTROL_DECK, DRAGON_DECK];

export function getDeckById(id: string): Deck | undefined {
  return ALL_DECKS.find(deck => deck.id === id);
}
