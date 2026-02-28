// gameStore.js — Global state for Teto desktop pet
// Sleep removed — Teto never sleeps, she's always awake and active

import { writable, derived, get } from 'svelte/store';

const STORAGE_KEY = 'teto_desktop_pet_v3';

const DECAY = {
  hunger:    10000,
  happiness: 15000,
  energy:    20000,
};

function loadSave() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return null;
}

const defaults = { hunger: 100, happiness: 100, energy: 100 };
const saved    = loadSave();
const init     = saved ? { ...defaults, ...saved } : defaults;

// ─── Stores ───────────────────────────────────────────────────────────────────
export const hunger    = writable(init.hunger);
export const happiness = writable(init.happiness);
export const energy    = writable(init.energy);

// ─── Derived: Teto's mood (no sleeping state) ────────────────────────────────
export const tetoState = derived(
  [hunger, happiness, energy],
  ([$h, $hap, $e]) => {
    if ($h   < 30)                   return 'hungry';
    if ($e   < 30)                   return 'tired';
    if (($h + $hap + $e) / 3 >= 70) return 'happy';
    return 'normal';
  }
);

const clamp = v => Math.max(0, Math.min(100, v));

export function saveGame() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      hunger:    get(hunger),
      happiness: get(happiness),
      energy:    get(energy),
    }));
  } catch (_) {}
}

// ─── Actions ──────────────────────────────────────────────────────────────────
export function feedTeto() {
  hunger.update(h => clamp(h + 20));
  happiness.update(h => clamp(h + 5));
  saveGame();
}

export function playWithTeto() {
  happiness.update(h => clamp(h + 20));
  hunger.update(h => clamp(h - 5));
  saveGame();
}

// ─── Decay timers ─────────────────────────────────────────────────────────────
export function startDecayTimers() {
  const ids = [];

  ids.push(setInterval(() => {
    hunger.update(h => clamp(h - 1));
    saveGame();
  }, DECAY.hunger));

  ids.push(setInterval(() => {
    happiness.update(h => clamp(h - 1));
    saveGame();
  }, DECAY.happiness));

  ids.push(setInterval(() => {
    energy.update(e => clamp(e - 1));
    saveGame();
  }, DECAY.energy));
  

  // Energy slowly refills on its own so she never bottoms out permanently
  ids.push(setInterval(() => {
    energy.update(e => clamp(e + 1));
    saveGame();
  }, DECAY.energy * 1.5));

  return () => ids.forEach(clearInterval);
}
