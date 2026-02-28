<script>
  // Bedroom.svelte — Rotating background
  // Starts on background2, cycles to background1, repeats every 30s

  import { onMount, onDestroy } from 'svelte';

  const BACKGROUNDS = [
    '/background2.jpg',
    '/background1.png',
  ];

  let current = 0;   // index of the visible background
  let next    = 1;   // index of the incoming background
  let transitioning = false;
  let rotateTimer;

  function rotate() {
    transitioning = true;

    // After the crossfade finishes, snap current to the new one
    setTimeout(() => {
      current       = next;
      next          = (next + 1) % BACKGROUNDS.length;
      transitioning = false;
    }, 800); // matches transition duration below
  }

  onMount(() => {
    rotateTimer = setInterval(rotate, 30_000);
  });

  onDestroy(() => clearInterval(rotateTimer));
</script>

<div class="room">
  <!-- Current (outgoing) background -->
  <img
    class="bg"
    class:fade-out={transitioning}
    src={BACKGROUNDS[current]}
    alt=""
    draggable="false"
  />

  <!-- Next (incoming) background — sits underneath, revealed as top fades -->
  <img
    class="bg bg-next"
    src={BACKGROUNDS[next]}
    alt=""
    draggable="false"
  />
</div>

<style>
  .room {
    position: fixed;
    inset: 0;
    z-index: 0;
    overflow: hidden;
    background: #1a1a2e;
  }

  .bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    display: block;
    pointer-events: none;
    user-select: none;
    z-index: 2;
  }

  /* Incoming image sits below */
  .bg-next {
    z-index: 1;
  }

  /* Stepped opacity fade — choppy pixel art feel */
  .bg.fade-out {
    animation: stepped-fade 0.8s steps(6) forwards;
  }

  @keyframes stepped-fade {
    0%   { opacity: 1; }
    100% { opacity: 0; }
  }
</style>
