<script>
  // SplashScreen.svelte — Intro splash shown on first load
  // "I LOVE TETO!!!" then Japanese, then fades out

  import { onMount, createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  let showLine1  = false;  // "I LOVE TETO!!!"
  let showLine2  = false;  // "テトが大好き!!!"
  let fadingOut  = false;

  onMount(() => {
    // Line 1 pops in immediately
    setTimeout(() => { showLine1 = true;  }, 300);
    // Line 2 follows shortly after
    setTimeout(() => { showLine2 = true;  }, 1100);
    // Start fading out
    setTimeout(() => { fadingOut = true;  }, 2800);
    // Tell parent we're done so it unmounts us
    setTimeout(() => { dispatch('done');  }, 3500);
  });

  function skip() {
    fadingOut = true;
    setTimeout(() => dispatch('done'), 600);
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="splash" class:fade-out={fadingOut} on:click={skip}>

  <div class="content">
    {#if showLine1}
      <div class="line line1">I LOVE TETO!!!</div>
    {/if}
    {#if showLine2}
      <div class="line line2">テトが大好き!!!</div>
    {/if}
    {#if showLine2}
      <div class="hint">click to skip</div>
    {/if}
  </div>

  <!-- Scanlines for drama -->
  <div class="scanlines"></div>
</div>

<style>
  .splash {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: #1a1a2e;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .splash.fade-out {
    animation: fade-out 0.6s steps(6) forwards;
  }

  .scanlines {
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0,0,0,0.12) 2px,
      rgba(0,0,0,0.12) 4px
    );
    pointer-events: none;
  }

  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 28px;
    text-align: center;
    padding: 24px;
  }

  .line {
    font-family: 'Press Start 2P', monospace;
    color: #ff6b9d;
    text-shadow:
      4px  4px 0 #000,
      0    0  30px rgba(255, 107, 157, 0.6);
    line-height: 1.4;
  }

  .line1 {
    font-size: clamp(28px, 6vw, 64px);
    animation: pop-in 0.4s steps(4) forwards;
  }

  .line2 {
    font-size: clamp(22px, 4.5vw, 52px);
    color: #fff;
    text-shadow:
      3px 3px 0 #ff6b9d,
      0   0  20px rgba(255,107,157,0.4);
    animation: pop-in 0.4s steps(4) forwards;
  }

  .hint {
    font-family: 'Press Start 2P', monospace;
    font-size: 8px;
    color: #3a3a6a;
    letter-spacing: 2px;
    animation: blink 1s steps(1) infinite;
    margin-top: 12px;
  }

  @keyframes pop-in {
    0%   { opacity: 0; transform: scale(0.5) translateY(20px); }
    40%  { opacity: 1; transform: scale(1.08) translateY(-4px); }
    70%  { transform: scale(0.97); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }

  @keyframes fade-out {
    0%   { opacity: 1; }
    100% { opacity: 0; pointer-events: none; }
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0; }
  }
</style>
