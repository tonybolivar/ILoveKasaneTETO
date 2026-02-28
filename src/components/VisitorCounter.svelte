<script>
  // VisitorCounter.svelte — Real global visitor counter via CounterAPI
  // Every visitor increments the shared count at counterapi.dev

  import { onMount } from 'svelte';

  let count = null; // null = loading

  onMount(async () => {
    try {
      const target = encodeURIComponent('https://api.counterapi.dev/v1/tetotamagotchi/visits/up');
      const res = await fetch(`https://corsproxy.io/?url=${target}`);
      const data = await res.json();
      count = data.count;
    } catch {
      // Fallback to localStorage if the API is unreachable
      const stored = parseInt(localStorage.getItem('teto_visit_count') || '0');
      count = stored + 1;
      localStorage.setItem('teto_visit_count', String(count));
    }
  });

  $: digits = count === null ? '......' : String(count).padStart(6, '0');
</script>

<div class="counter">
  <div class="counter-label">VISITORS</div>
  <div class="counter-display">
    {#each digits as d}
      <span class="digit">{d}</span>
    {/each}
  </div>
</div>

<style>
  .counter {
    position: fixed;
    bottom: 16px;
    right: 16px;
    z-index: 300;
    background: #0d0d1a;
    border: 3px solid #4fffda;
    box-shadow: 4px 4px 0 #000, 0 0 20px rgba(79, 255, 218, 0.1);
    padding: 8px 12px;
    font-family: 'Press Start 2P', monospace;
    image-rendering: pixelated;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .counter-label {
    font-size: 6px;
    color: #4fffda;
    letter-spacing: 2px;
  }

  .counter-display {
    display: flex;
    gap: 2px;
  }

  .digit {
    display: inline-block;
    width: 14px;
    height: 20px;
    background: #0a0a14;
    border: 2px solid #1a1a3a;
    color: #4fffda;
    font-size: 10px;
    text-align: center;
    line-height: 16px;
    text-shadow: 0 0 6px #4fffda;
  }
</style>
