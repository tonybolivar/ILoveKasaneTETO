<script>
  // StatPopup.svelte — Small pixel art stat window that floats above Teto
  // Appears on click, closes when clicking elsewhere

  import { hunger, happiness, energy } from '../stores/gameStore.js';
  import { createEventDispatcher } from 'svelte';

  // Teto's current position — used to anchor the popup
  export let x = 0;  // center X of Teto
  export let y = 0;  // bottom Y of Teto (feet)

  const dispatch = createEventDispatcher();

  // How many of 10 blocks to fill
  $: hBlocks   = Math.round($hunger    / 10);
  $: hapBlocks = Math.round($happiness / 10);
  $: eBlocks   = Math.round($energy    / 10);

  // Clamp popup so it doesn't go off the left/right edge
  $: popupLeft = Math.max(10, Math.min(x - 100, (typeof window !== 'undefined' ? window.innerWidth : 600) - 215));
</script>

<!-- Stop click from bubbling so the popup doesn't immediately close itself -->
<div
  class="popup"
  style="left: {popupLeft}px; top: {y - 10}px;"
  on:click|stopPropagation
>
  <!-- Speech bubble tail pointing down toward Teto -->
  <div class="tail"></div>

  <div class="popup-title">✦ TETO STATUS ✦</div>

  <!-- Hunger -->
  <div class="stat-row">
    <span class="lbl">HNG</span>
    <div class="bar">
      {#each {length: 10} as _, i}
        <div class="blk" class:on={i < hBlocks} style="--c: #ff6b9d"></div>
      {/each}
    </div>
    <span class="num">{$hunger}</span>
  </div>

  <!-- Happiness -->
  <div class="stat-row">
    <span class="lbl">HPI</span>
    <div class="bar">
      {#each {length: 10} as _, i}
        <div class="blk" class:on={i < hapBlocks} style="--c: #7b8fff"></div>
      {/each}
    </div>
    <span class="num">{$happiness}</span>
  </div>

  <!-- Energy -->
  <div class="stat-row">
    <span class="lbl">NRG</span>
    <div class="bar">
      {#each {length: 10} as _, i}
        <div class="blk" class:on={i < eBlocks} style="--c: #4fffda"></div>
      {/each}
    </div>
    <span class="num">{$energy}</span>
  </div>
</div>

<style>
  .popup {
    position: fixed;
    z-index: 500;
    transform: translateY(-100%);

    background: #0d0d1a;
    border: 3px solid #ff6b9d;
    box-shadow: 4px 4px 0 #000, 0 0 0 1px #ff6b9d;
    padding: 10px 12px 12px;
    width: 205px;
    font-family: 'Press Start 2P', monospace;
    image-rendering: pixelated;
  }

  /* Downward-pointing speech bubble tail */
  .tail {
    position: absolute;
    bottom: -12px;
    left: 50%;
    transform: translateX(-50%);
    width: 0; height: 0;
    border-left:  8px solid transparent;
    border-right: 8px solid transparent;
    border-top:   12px solid #ff6b9d;
  }

  .tail::after {
    content: '';
    position: absolute;
    top: -14px;
    left: -6px;
    width: 0; height: 0;
    border-left:  6px solid transparent;
    border-right: 6px solid transparent;
    border-top:   10px solid #0d0d1a;
  }

  .popup-title {
    font-size: 6px;
    color: #ff6b9d;
    text-align: center;
    letter-spacing: 1px;
    margin-bottom: 10px;
    padding-bottom: 6px;
    border-bottom: 2px solid #1e1e3a;
  }

  .stat-row {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 7px;
  }

  .lbl {
    font-size: 5px;
    color: #6666aa;
    width: 20px;
    flex-shrink: 0;
    letter-spacing: 0;
  }

  .bar {
    display: flex;
    gap: 1px;
    flex: 1;
  }

  .blk {
    width: 11px;
    height: 11px;
    background: #1e1e3a;
    border: 1px solid #2e2e4a;
    flex-shrink: 0;
  }

  .blk.on {
    background: var(--c);
    border-color: var(--c);
    box-shadow: inset 1px 1px 0 rgba(255,255,255,0.3);
  }

  .num {
    font-size: 5px;
    color: #c8c8e8;
    width: 18px;
    text-align: right;
    flex-shrink: 0;
  }
</style>
