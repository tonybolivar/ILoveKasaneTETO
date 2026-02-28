<script>
  // StatBar.svelte — Displays a single pixelated stat bar
  // Props: label (string), value (0-100), color (CSS color string)

  export let label = 'STAT';
  export let value = 100;
  export let color = '#ff6b9d';

  // Compute how many of 10 blocks are filled (chunky pixel art feel)
  $: filledBlocks = Math.round(value / 10);
</script>

<div class="stat-row">
  <!-- Stat label -->
  <span class="stat-label">{label}</span>

  <!-- Pixelated block bar — 10 blocks total -->
  <div class="stat-bar">
    {#each Array(10) as _, i}
      <div
        class="stat-block"
        class:filled={i < filledBlocks}
        style="--bar-color: {color}"
      ></div>
    {/each}
  </div>

  <!-- Numeric value -->
  <span class="stat-value">{value}</span>
</div>

<style>
  .stat-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }

  .stat-label {
    font-size: 7px;
    color: #c8c8e8;
    width: 52px;
    text-align: right;
    flex-shrink: 0;
    letter-spacing: 1px;
  }

  .stat-bar {
    display: flex;
    gap: 2px;
    flex: 1;
  }

  /* Each block is a chunky pixel square — no smooth transitions */
  .stat-block {
    width: 14px;
    height: 14px;
    background: #2a2a4a;
    border: 2px solid #3a3a5a;
    image-rendering: pixelated;
    /* Stepped color change — no smooth CSS transition on purpose */
    box-shadow: inset -2px -2px 0px #1a1a2e;
  }

  .stat-block.filled {
    background: var(--bar-color);
    border-color: var(--bar-color);
    /* Inner highlight for pixel art sheen */
    box-shadow:
      inset 2px 2px 0px rgba(255,255,255,0.3),
      inset -2px -2px 0px rgba(0,0,0,0.4);
  }

  .stat-value {
    font-size: 7px;
    color: #c8c8e8;
    width: 22px;
    text-align: left;
    flex-shrink: 0;
  }
</style>
