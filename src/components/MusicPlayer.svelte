<script>
  // MusicPlayer.svelte — Compact Spotify embed player
  // Sits in the bottom-left corner, collapsible

  let collapsed = false;
  let volume = parseInt(localStorage.getItem('teto_volume') ?? '75');

  $: localStorage.setItem('teto_volume', String(volume));
</script>

<div class="player" class:collapsed>

  <!-- Header bar — click to collapse/expand -->
  <button class="player-header" on:click={() => collapsed = !collapsed}>
    <span class="note">♪</span>
    <span class="title">NOW PLAYING</span>
    <span class="toggle">{collapsed ? '▲' : '▼'}</span>
  </button>

  <!-- Spotify embed — hidden when collapsed -->
  {#if !collapsed}
    <div class="embed-wrap">
      <iframe
        title="Spotify player"
        src="https://open.spotify.com/embed/playlist/37i9dQZF1DZ06evO4e5zOx?utm_source=generator&theme=0"
        width="100%"
        height="152"
        frameborder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      ></iframe>
    </div>

    <!-- Volume slider -->
    <div class="volume-row">
      <span class="vol-icon">{volume === 0 ? '✕' : '♪'}</span>
      <input
        type="range"
        min="0"
        max="100"
        bind:value={volume}
        class="vol-slider"
        aria-label="Volume"
      />
      <span class="vol-val">{volume}</span>
    </div>
  {/if}

</div>

<style>
  .player {
    position: fixed;
    bottom: 16px;
    left: 16px;
    z-index: 300;
    width: 280px;
    background: #0d0d1a;
    border: 3px solid #ff6b9d;
    box-shadow: 4px 4px 0 #000, 0 0 20px rgba(255,107,157,0.15);
    font-family: 'Press Start 2P', monospace;
    image-rendering: pixelated;
  }

  /* Pixel art header bar */
  .player-header {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    background: #1a1a3a;
    border: none;
    border-bottom: 3px solid #ff6b9d;
    color: #ff6b9d;
    font-family: 'Press Start 2P', monospace;
    font-size: 7px;
    padding: 8px 10px;
    cursor: pointer;
    letter-spacing: 1px;
    text-align: left;
  }

  .collapsed .player-header {
    border-bottom: none;
  }

  .player-header:hover {
    background: #222244;
  }

  .note {
    font-size: 10px;
    animation: note-bounce 1s steps(2) infinite;
  }

  .title {
    flex: 1;
  }

  .toggle {
    font-size: 6px;
    color: #7777aa;
  }

  /* Volume row */
  .volume-row {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 10px;
    background: #0d0d1a;
    border-top: 2px solid #1a1a3a;
  }

  .vol-icon {
    font-size: 9px;
    color: #ff6b9d;
    width: 10px;
    text-align: center;
    flex-shrink: 0;
  }

  .vol-val {
    font-size: 6px;
    color: #7777aa;
    width: 18px;
    text-align: right;
    flex-shrink: 0;
  }

  .vol-slider {
    flex: 1;
    -webkit-appearance: none;
    appearance: none;
    height: 6px;
    background: #1a1a3a;
    border: 2px solid #ff6b9d;
    outline: none;
    cursor: pointer;
    image-rendering: pixelated;
  }

  .vol-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 10px;
    height: 14px;
    background: #ff6b9d;
    cursor: pointer;
    border: none;
    border-radius: 0;
    image-rendering: pixelated;
  }

  .vol-slider::-moz-range-thumb {
    width: 10px;
    height: 14px;
    background: #ff6b9d;
    cursor: pointer;
    border: none;
    border-radius: 0;
  }

  .vol-slider::-webkit-slider-runnable-track {
    background: transparent;
  }

  /* Remove iframe default border/bg */
  .embed-wrap {
    display: block;
    line-height: 0;
  }

  .embed-wrap iframe {
    display: block;
    border: none;
  }

  @keyframes note-bounce {
    0%   { transform: translateY(0);   }
    50%  { transform: translateY(-2px); }
    100% { transform: translateY(0);   }
  }
</style>
