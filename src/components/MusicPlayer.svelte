<script>
  // MusicPlayer.svelte — Pixel-art audio player
  // Drop your audio files in public/music/ and add them to the tracks array below.

  import { onMount } from 'svelte';

  // ─── Your tracks ───────────────────────────────────────────────────────────
  const tracks = [
    { title: 'BIRDBRAIN',                src: '/music/BIRDBRAIN.mp3' },
    { title: 'CADMIUM COLORS',           src: '/music/Cadmium Colors.mp3' },
    { title: 'FIRE!!!',                  src: '/music/FIRE!!!.mp3' },
    { title: 'I WISH THAT I COULD FALL', src: '/music/I Wish That I Could Fall.mp3' },
    { title: 'MACHINE LOVE',             src: '/music/Machine Love.mp3' },
    { title: 'ROT FOR CLOUT',            src: '/music/ROT FOR CLOUT.mp3' },
    { title: 'STRAWBERRY',               src: '/music/Strawberry.mp3' },
  ];
  // ───────────────────────────────────────────────────────────────────────────

  let collapsed = false;
  let volume    = parseInt(localStorage.getItem('teto_volume') ?? '75');
  let playing   = false;
  let trackIndex = 0;
  let currentTime = 0;
  let duration    = 0;
  let audioEl;

  $: localStorage.setItem('teto_volume', String(volume));
  $: if (audioEl) audioEl.volume = volume / 100;

  $: currentTrack = tracks[trackIndex] ?? null;
  $: progress     = duration > 0 ? (currentTime / duration) * 100 : 0;
  $: timeStr      = fmt(currentTime);
  $: durStr       = fmt(duration);

  function fmt(s) {
    if (!s || isNaN(s)) return '0:00';
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  }

  function loadTrack(index, autoplay = false) {
    trackIndex = index;
    if (!audioEl || !tracks[index]) return;
    audioEl.src = tracks[index].src;
    audioEl.load();
    if (autoplay) audioEl.play().then(() => playing = true).catch(() => {});
    else playing = false;
  }

  function toggle() {
    if (!audioEl || !currentTrack) return;
    if (playing) {
      audioEl.pause();
      playing = false;
    } else {
      if (!audioEl.src || audioEl.src === window.location.href) {
        audioEl.src = currentTrack.src;
        audioEl.load();
      }
      audioEl.play().then(() => playing = true).catch(() => {});
    }
  }

  function prev() { loadTrack((trackIndex - 1 + tracks.length) % tracks.length, playing); }
  function next() { loadTrack((trackIndex + 1) % tracks.length, playing); }

  function onEnded() { loadTrack((trackIndex + 1) % tracks.length, true); }
  function onTimeUpdate() { currentTime = audioEl.currentTime; }
  function onDurationChange() { duration = isFinite(audioEl.duration) ? audioEl.duration : 0; }

  function seek(e) {
    if (!audioEl || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audioEl.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
  }

  onMount(() => {
    if (audioEl) {
      audioEl.volume = volume / 100;
      if (currentTrack) audioEl.src = currentTrack.src;
    }
  });
</script>

<!-- Native audio element (hidden) -->
<audio
  bind:this={audioEl}
  on:ended={onEnded}
  on:timeupdate={onTimeUpdate}
  on:durationchange={onDurationChange}
></audio>

<div class="player" class:collapsed>

  <!-- Header — click to collapse/expand -->
  <button class="player-header" on:click={() => collapsed = !collapsed}>
    <span class="note">♪</span>
    <span class="title">NOW PLAYING</span>
    <span class="toggle">{collapsed ? '▲' : '▼'}</span>
  </button>

  {#if !collapsed}
    {#if !currentTrack}
      <!-- Empty state -->
      <div class="no-tracks">NO TRACKS<br>LOADED</div>

    {:else}
      <!-- Track name -->
      <div class="track-name-wrap">
        <div class="track-name">{currentTrack.title}</div>
      </div>

      <!-- Playback controls -->
      <div class="controls">
        <button class="ctrl-btn" on:click={prev} disabled={tracks.length < 2}>◄◄</button>
        <button class="ctrl-btn play-btn" on:click={toggle}>
          {playing ? '■' : '▶'}
        </button>
        <button class="ctrl-btn" on:click={next} disabled={tracks.length < 2}>▶▶</button>
      </div>

      <!-- Progress bar (click to seek) -->
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="progress-bar" on:click={seek}>
        <div class="progress-fill" style="width: {progress}%"></div>
      </div>
      <div class="time-row">
        <span>{timeStr}</span>
        <span>{durStr}</span>
      </div>
    {/if}

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

  /* Header */
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

  .collapsed .player-header { border-bottom: none; }
  .player-header:hover { background: #222244; }

  .note {
    font-size: 10px;
    animation: note-bounce 1s steps(2) infinite;
  }

  .title { flex: 1; }

  .toggle {
    font-size: 6px;
    color: #7777aa;
  }

  /* Empty state */
  .no-tracks {
    padding: 20px;
    text-align: center;
    font-size: 7px;
    color: #555577;
    line-height: 2;
    letter-spacing: 1px;
  }

  /* Track name */
  .track-name-wrap {
    padding: 10px 12px 0;
    overflow: hidden;
  }

  .track-name {
    font-size: 7px;
    color: #c8c8e8;
    letter-spacing: 1px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
  }

  /* Controls */
  .controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 12px;
  }

  .ctrl-btn {
    background: #1a1a3a;
    border: 2px solid #ff6b9d;
    color: #ff6b9d;
    font-family: 'Press Start 2P', monospace;
    font-size: 8px;
    padding: 5px 8px;
    cursor: pointer;
    line-height: 1;
  }

  .ctrl-btn:hover:not(:disabled) { background: #2a1a3a; }
  .ctrl-btn:disabled { opacity: 0.3; cursor: default; }

  .play-btn {
    font-size: 12px;
    padding: 6px 14px;
    border-color: #ff6b9d;
  }

  /* Progress bar */
  .progress-bar {
    margin: 0 12px;
    height: 8px;
    background: #1a1a3a;
    border: 2px solid #333355;
    cursor: pointer;
    position: relative;
  }

  .progress-fill {
    height: 100%;
    background: #ff6b9d;
    transition: width 0.1s steps(5);
    pointer-events: none;
  }

  .time-row {
    display: flex;
    justify-content: space-between;
    padding: 4px 12px 8px;
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
  }

  .vol-slider::-moz-range-thumb {
    width: 10px;
    height: 14px;
    background: #ff6b9d;
    cursor: pointer;
    border: none;
    border-radius: 0;
  }

  .vol-slider::-webkit-slider-runnable-track { background: transparent; }

  @keyframes note-bounce {
    0%   { transform: translateY(0);   }
    50%  { transform: translateY(-2px); }
    100% { transform: translateY(0);   }
  }
</style>
