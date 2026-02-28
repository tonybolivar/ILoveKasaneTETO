<script>
  // ContextMenu.svelte — Right-click context menu (Feed & Play only)

  import { createEventDispatcher } from 'svelte';
  export let x = 0;
  export let y = 0;

  const dispatch = createEventDispatcher();

  const W = 170, H = 80;
  $: left = typeof window !== 'undefined' ? Math.min(x, window.innerWidth  - W - 8) : x;
  $: top  = typeof window !== 'undefined' ? Math.min(y, window.innerHeight - H - 8) : y;
</script>

<div class="menu" style="left: {left}px; top: {top}px;" on:click|stopPropagation>
  <button on:click={() => dispatch('feed')}>🍞 <span>FEED BREAD</span></button>
  <button on:click={() => dispatch('play')}>🎵 <span>PLAY</span></button>
</div>

<style>
  .menu {
    position: fixed;
    z-index: 600;
    background: #0d0d1a;
    border: 3px solid #ff6b9d;
    box-shadow: 4px 4px 0 #000;
    font-family: 'Press Start 2P', monospace;
    min-width: 170px;
    overflow: hidden;
  }

  button {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    background: transparent;
    border: none;
    border-bottom: 2px solid #1a1a3a;
    color: #c8c8e8;
    font-family: 'Press Start 2P', monospace;
    font-size: 7px;
    padding: 10px 12px;
    cursor: pointer;
    border-radius: 0;
    letter-spacing: 1px;
  }

  button:last-child { border-bottom: none; }

  button:hover {
    background: #1e1e3e;
    color: #ff6b9d;
  }
</style>
