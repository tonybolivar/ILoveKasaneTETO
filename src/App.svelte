<script>
  // App.svelte — Root component
  // Mounts the bedroom, Teto, and starts the stat decay loop

  import { onMount, onDestroy } from 'svelte';
  import { startDecayTimers } from './stores/gameStore.js';

  import Bedroom from './components/Bedroom.svelte';
  import TetoPet from './components/TetoPet.svelte';
  import MusicPlayer from './components/MusicPlayer.svelte';
  import SplashScreen from './components/SplashScreen.svelte';
  import VisitorCounter from './components/VisitorCounter.svelte';

  let splashDone = false;

  let stopTimers;

  onMount(() => {
    stopTimers = startDecayTimers();
  });

  onDestroy(() => {
    if (stopTimers) stopTimers();
  });
</script>

{#if !splashDone}
  <SplashScreen on:done={() => splashDone = true} />
{/if}

<!-- Bedroom is the full-screen background layer -->
<Bedroom />

<!-- Teto lives on top, wandering freely -->
<TetoPet />

<!-- Spotify music player — bottom left corner -->
<MusicPlayer ready={splashDone} />

<!-- Retro visitor counter — bottom right corner -->
<VisitorCounter />
