<script>
  // ActionButtons.svelte — Feed, Play, Sleep action buttons
  // Buttons are disabled during sleep mode

  import { isSleeping, feedTeto, playWithTeto, toggleSleep } from '../stores/gameStore.js';

  // Brief "pressed" state for visual feedback (no smooth animations)
  let feedPressed = false;
  let playPressed = false;
  let sleepPressed = false;

  function handleFeed() {
    if ($isSleeping) return;
    feedPressed = true;
    feedTeto();
    setTimeout(() => { feedPressed = false; }, 150);
  }

  function handlePlay() {
    if ($isSleeping) return;
    playPressed = true;
    playWithTeto();
    setTimeout(() => { playPressed = false; }, 150);
  }

  function handleSleep() {
    sleepPressed = true;
    toggleSleep();
    setTimeout(() => { sleepPressed = false; }, 150);
  }
</script>

<div class="buttons-container">
  <!-- Feed button -->
  <button
    class="pixel-btn feed-btn"
    class:pressed={feedPressed}
    disabled={$isSleeping}
    on:click={handleFeed}
    title="Give Teto some bread!"
  >
    <span class="btn-icon">🍞</span>
    <span class="btn-label">FEED</span>
  </button>

  <!-- Play button -->
  <button
    class="pixel-btn play-btn"
    class:pressed={playPressed}
    disabled={$isSleeping}
    on:click={handlePlay}
    title="Play with Teto!"
  >
    <span class="btn-icon">🎵</span>
    <span class="btn-label">PLAY</span>
  </button>

  <!-- Sleep button — always available to toggle -->
  <button
    class="pixel-btn sleep-btn"
    class:pressed={sleepPressed}
    class:active-sleep={$isSleeping}
    on:click={handleSleep}
    title={$isSleeping ? 'Wake Teto up' : 'Put Teto to sleep'}
  >
    <span class="btn-icon">💤</span>
    <span class="btn-label">{$isSleeping ? 'WAKE' : 'SLEEP'}</span>
  </button>
</div>

<style>
  .buttons-container {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-top: 20px;
    flex-wrap: wrap;
  }

  /* Base pixel art button — blocky, no border radius */
  .pixel-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    background: #2a2a4a;
    color: #e8e8ff;
    border: none;
    border-radius: 0;           /* No border radius — strict pixel art */
    padding: 14px 18px;
    cursor: pointer;
    font-family: 'Press Start 2P', monospace;
    font-size: 7px;
    letter-spacing: 1px;
    min-width: 70px;

    /* Pixel art drop shadow: bottom + right edge gives "raised" look */
    box-shadow:
      4px 4px 0px #000,
      inset 2px 2px 0px rgba(255,255,255,0.15),
      inset -2px -2px 0px rgba(0,0,0,0.4);

    /* No smooth transitions — instant state changes */
    image-rendering: pixelated;
    position: relative;
    top: 0;
    left: 0;
  }

  .btn-icon {
    font-size: 20px;
    display: block;
  }

  .btn-label {
    display: block;
    line-height: 1;
  }

  /* Feed button — pink accent */
  .feed-btn {
    background: #3d1f3a;
    border-top: 3px solid #ff6b9d;
    border-left: 3px solid #ff6b9d;
    border-right: 3px solid #8b1a4a;
    border-bottom: 3px solid #8b1a4a;
    color: #ff6b9d;
  }

  /* Play button — purple/blue accent */
  .play-btn {
    background: #1f2a3d;
    border-top: 3px solid #7b8fff;
    border-left: 3px solid #7b8fff;
    border-right: 3px solid #2a2a8b;
    border-bottom: 3px solid #2a2a8b;
    color: #7b8fff;
  }

  /* Sleep button — teal accent */
  .sleep-btn {
    background: #1f3a35;
    border-top: 3px solid #4fffda;
    border-left: 3px solid #4fffda;
    border-right: 3px solid #1a6b5a;
    border-bottom: 3px solid #1a6b5a;
    color: #4fffda;
  }

  /* When sleep is active (Teto is sleeping), highlight the wake button */
  .sleep-btn.active-sleep {
    background: #2a1f3a;
    border-top: 3px solid #ff6b9d;
    border-left: 3px solid #ff6b9d;
    border-right: 3px solid #8b1a4a;
    border-bottom: 3px solid #8b1a4a;
    color: #ff6b9d;
    animation: pulse-border 1s steps(2) infinite;
  }

  /* Pressed state — shifts down/right to simulate physical press */
  .pixel-btn.pressed,
  .pixel-btn:active {
    top: 4px;
    left: 4px;
    box-shadow:
      0px 0px 0px #000,
      inset 2px 2px 0px rgba(0,0,0,0.4),
      inset -2px -2px 0px rgba(255,255,255,0.1);
  }

  /* Disabled state when sleeping */
  .pixel-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
    top: 0;
    left: 0;
  }

  /* Hover — slight brightness boost, no smooth transition */
  .pixel-btn:not(:disabled):hover {
    filter: brightness(1.2);
  }

  /* Choppy pulse for active sleep button */
  @keyframes pulse-border {
    0%   { filter: brightness(1); }
    50%  { filter: brightness(1.4); }
    100% { filter: brightness(1); }
  }
</style>
