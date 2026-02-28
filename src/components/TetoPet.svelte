<script>
  // TetoPet.svelte — Teto desktop pet
  // Bigger, more active, can walk AND fly around the screen

  import { onMount, onDestroy } from 'svelte';
  import { feedTeto, playWithTeto } from '../stores/gameStore.js';
  import ContextMenu from './ContextMenu.svelte';

  // ─── Cute things Teto says when clicked ──────────────────────────────────────
  const QUIPS = [
    '♡', '✨', '～♪', 'hehe', 'uwu', '♡♡♡',
    '(◕‿◕)', 'nyaa~', 'ehe~', '(´• ω •`)',
    '♪～', '( ˘ ³˘)♥', 'teto!', '✦✦✦',
    '(≧◡≦)', 'hihi~', '♡( ◡‿◡ )', 'boing!',
  ];

  // ─── Dimensions ──────────────────────────────────────────────────────────────
  const SPRITE_H    = 180;   // bigger!
  const FLOOR_OFFSET = 30;   // px from bottom of screen

  // ─── Position ─────────────────────────────────────────────────────────────────
  let x = 400;
  let y = 0;

  // Dynamic floor — reads UI panel positions from the DOM so Teto can stand on them
  function effectiveFloor() {
    const base = window.innerHeight - FLOOR_OFFSET;
    for (const sel of ['.player', '.counter']) {
      const el = document.querySelector(sel);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (x >= r.left - 10 && x <= r.right + 10) return r.top;
    }
    return base;
  }

  // ─── Physics (gravity when not flying) ───────────────────────────────────────
  let vy         = 0;
  const GRAVITY  = 2.5;
  const BOUNCE   = 0.38;
  const SETTLE_V = 1.5;

  // ─── Movement AI ─────────────────────────────────────────────────────────────
  let walkTarget = null;   // X target (ground walk)
  let walkSpeed  = 3;
  let isFlying   = false;  // true when Teto is airborne by choice
  let flyTargetX = null;   // free-flight 2D target
  let flyTargetY = null;
  let flySpeed   = 3;
  let landTimer  = null;   // auto-land after flying for a bit

  // ─── Animation state ──────────────────────────────────────────────────────────
  let facing = 'right';
  let anim   = 'idle';    // idle | walk | sleep | held | eat | fly

  // ─── Sprite selection ─────────────────────────────────────────────────────────
  $: spriteSrc = getSrc(anim, facing, isFlying);

  function getSrc(a, dir, flying) {
    if (flying)        return '/tetofront.png';  // face-forward while airborne
    if (a === 'walk')  return dir === 'right' ? '/tetoright.png' : '/tetoleft.png';
    return '/tetofront.png';
  }

  // ─── Drag state ───────────────────────────────────────────────────────────────
  let isDragging = false;
  let isFalling  = false;
  let dragOffX   = 0;
  let dragOffY   = 0;
  let lastMX     = 0;
  let lastMY     = 0;
  let relVY      = 0;

  // ─── Eating ───────────────────────────────────────────────────────────────────
  let isEating  = false;
  let eatTimer  = null;
  let showBread = false;

  // ─── Spin (double-click) ──────────────────────────────────────────────────────
  let isSpinning = false;
  let spinTimer  = null;

  // ─── UI ───────────────────────────────────────────────────────────────────────
  let showMenu  = false;
  let menuX     = 0;
  let menuY     = 0;
  let bubbleText  = '';
  let showBubble  = false;
  let bubbleTimer = null;

  // ─── Game loop ────────────────────────────────────────────────────────────────
  let loopId;

  // Keep Teto inside the screen horizontally
  function clampX() {
    x = Math.max(50, Math.min(window.innerWidth - 50, x));
  }

  function tick() {
    if (isDragging) { clampX(); anim = 'held'; return; }

    const curFloor = effectiveFloor();

    // ── Flying mode: move freely in 2D ──
    if (isFlying) {
      anim = 'fly';
      if (flyTargetX !== null && flyTargetY !== null) {
        const dx   = flyTargetX - x;
        const dy   = flyTargetY - y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < flySpeed) {
          x = flyTargetX;
          y = flyTargetY;
          flyTargetX = flyTargetY = null;
        } else {
          x += (dx / dist) * flySpeed;
          y += (dy / dist) * flySpeed;
          facing = dx > 0 ? 'right' : 'left';
        }
        x = Math.max(50, Math.min(window.innerWidth  - 50, x));
        y = Math.max(10, Math.min(window.innerHeight - 60, y));
      }
      return;
    }

    // ── Gravity / falling ──
    if (y < curFloor || isFalling) {
      vy += GRAVITY;
      y   = Math.min(y + vy, curFloor);

      if (y >= curFloor) {
        y = curFloor;
        if (Math.abs(vy) > SETTLE_V) {
          vy = -vy * BOUNCE;
        } else {
          vy = 0;
          isFalling = false;
        }
      }
      clampX();
      anim = 'idle';
      return;
    }

    // ── Step up onto a platform (floor rose under Teto) ──
    if (y > curFloor) {
      y  = curFloor;
      vy = 0;
    }

    // ── On the floor / platform ──
    if (false)    { anim = 'sleep'; return; }
    if (isEating) { anim = 'eat';   return; }

    if (walkTarget !== null) {
      const dx = walkTarget - x;
      if (Math.abs(dx) <= walkSpeed) {
        x = walkTarget;
        walkTarget = null;
        anim = 'idle';
      } else {
        const step = Math.sign(dx) * walkSpeed;
        x += step;
        facing = step > 0 ? 'right' : 'left';
        anim = 'walk';
        clampX();
      }
    } else {
      anim = 'idle';
    }
  }

  // ─── AI: schedule next move ───────────────────────────────────────────────────
  let aiTimer;

  function scheduleMove() {
    // More active pacing — shorter delays
    const delay = 400 + Math.random() * 2500;

    aiTimer = setTimeout(() => {
      if (!isDragging && !false && !isEating) {
        const margin = 70;

        // 35% chance to fly
        if (!isFlying && Math.random() < 0.35) {
          takeOff();
        } else if (!isFlying) {
          // Ground walk — full screen width, she can step onto panels
          walkTarget = 70 + Math.random() * (window.innerWidth - 140);
          walkSpeed  = 2.5 + Math.random() * 3;
        } else {
          // Already flying — pick a new flight destination
          setFlyTarget();
        }
      }
      scheduleMove();
    }, delay);
  }

  function takeOff() {
    isFlying  = true;
    walkTarget = null;
    vy        = 0;
    setFlyTarget();

    // Auto-land after 3-7 seconds
    clearTimeout(landTimer);
    landTimer = setTimeout(land, 3000 + Math.random() * 4000);
  }

  function setFlyTarget() {
    const margin = 80;
    flyTargetX = margin + Math.random() * (window.innerWidth  - margin * 2);
    flyTargetY = 10     + Math.random() * (window.innerHeight * 0.90);
    flySpeed   = 3 + Math.random() * 3;
  }

  function land() {
    isFlying   = false;
    isFalling  = true;
    flyTargetX = flyTargetY = null;
    vy         = 0;
  }

  // ─── Drag ─────────────────────────────────────────────────────────────────────
  function onSpriteMousedown(e) {
    if (e.button !== 0) return;
    e.preventDefault(); e.stopPropagation();
    startDrag(e.clientX, e.clientY);
  }

  function onDocMousemove(e)  { trackMove(e.clientX, e.clientY); }
  function onDocMouseup()     { if (isDragging) endDrag(); }

  function onSpriteTouchstart(e) {
    e.preventDefault();
    startDrag(e.touches[0].clientX, e.touches[0].clientY);
  }
  function onDocTouchmove(e) {
    if (!isDragging) return;
    trackMove(e.touches[0].clientX, e.touches[0].clientY);
  }
  function onDocTouchend() { if (isDragging) endDrag(); }

  function startDrag(cx, cy) {
    isDragging = true;
    isFalling  = false;
    isFlying   = false;
    walkTarget = flyTargetX = flyTargetY = null;
    clearTimeout(landTimer);
    dragOffX = cx - x;
    dragOffY = cy - y;
    lastMX   = cx;
    lastMY   = cy;
    relVY    = 0;
    showMenu = false;
  }

  function trackMove(cx, cy) {
    relVY  = cy - lastMY;
    lastMX = cx; lastMY = cy;
    if (isDragging) { x = cx - dragOffX; y = cy - dragOffY; }
  }

  function endDrag() {
    isDragging = false;
    isFalling  = true;
    vy         = relVY * 0.5;
    anim       = 'idle';
  }

  // ─── Click / right-click ──────────────────────────────────────────────────────
  function onSpriteClick(e) {
    if (isSpinning) return;
    e.stopPropagation();
    showMenu = false;
    const prev = bubbleText;
    do { bubbleText = QUIPS[Math.floor(Math.random() * QUIPS.length)]; }
    while (bubbleText === prev && QUIPS.length > 1);
    showBubble = true;
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => { showBubble = false; }, 1800);
  }

  function onSpriteDblClick(e) {
    e.stopPropagation();
    showBubble = false;
    isSpinning = true;
    clearTimeout(spinTimer);
    spinTimer = setTimeout(() => { isSpinning = false; }, 600);
  }

  function onContextMenu(e) {
    e.preventDefault(); e.stopPropagation();
    menuX = e.clientX; menuY = e.clientY;
    showMenu = true;
  }

  function onDocClick() { showMenu = false; }

  // ─── Context actions ──────────────────────────────────────────────────────────
  function handleFeed() {
    feedTeto();
    showMenu = false;
    isEating = showBread = true;
    clearTimeout(eatTimer);
    eatTimer = setTimeout(() => { isEating = showBread = false; }, 2200);
  }

  function handlePlay() { playWithTeto(); showMenu = false; }


  // ─── Lifecycle ────────────────────────────────────────────────────────────────
  onMount(() => {
    x = window.innerWidth / 2;
    y = window.innerHeight - FLOOR_OFFSET;

    loopId = setInterval(tick, 62);
    scheduleMove();

    document.addEventListener('mousemove', onDocMousemove);
    document.addEventListener('mouseup',   onDocMouseup);
    document.addEventListener('click',     onDocClick);
    document.addEventListener('touchmove', onDocTouchmove, { passive: false });
    document.addEventListener('touchend',  onDocTouchend);

    window.addEventListener('resize', () => {
      if (!isDragging && !isFalling && !isFlying) y = effectiveFloor();
    });
  });

  onDestroy(() => {
    clearInterval(loopId);
    clearTimeout(aiTimer);
    clearTimeout(eatTimer);
    clearTimeout(bubbleTimer);
    clearTimeout(landTimer);
    clearTimeout(spinTimer);
    document.removeEventListener('mousemove', onDocMousemove);
    document.removeEventListener('mouseup',   onDocMouseup);
    document.removeEventListener('click',     onDocClick);
    document.removeEventListener('touchmove', onDocTouchmove);
    document.removeEventListener('touchend',  onDocTouchend);
  });
</script>

<!-- ── Teto ── -->
<div
  class="teto"
  class:walk={anim === 'walk'}
  class:held={isDragging}
  class:asleep={false}
  class:flying={isFlying}
  class:spin={isSpinning}
  style="left: {x}px; top: {y}px;"
  on:mousedown={onSpriteMousedown}
  on:click={onSpriteClick}
  on:dblclick={onSpriteDblClick}
  on:contextmenu={onContextMenu}
  on:touchstart={onSpriteTouchstart}
>
  <img class="sprite" src={spriteSrc} alt="Teto" draggable="false" />

  {#if showBread}
    <div class="bread-float">🍞</div>
  {/if}

  {#if false}
    <div class="zzz">z z z</div>
  {/if}

  <!-- Shadow only while on the ground -->
  {#if !isFlying && !isDragging}
    <div class="shadow"></div>
  {/if}
</div>

<!-- Speech bubble -->
{#if showBubble}
  <div class="bubble" style="left: {x}px; top: {y - SPRITE_H - 12}px;">
    {bubbleText}
    <div class="bubble-tail"></div>
  </div>
{/if}

<!-- Context menu -->
{#if showMenu}
  <ContextMenu
    x={menuX} y={menuY}
    on:feed={handleFeed}
    on:play={handlePlay}
    on:close={() => showMenu = false}
  />
{/if}

<style>
  .teto {
    position: fixed;
    z-index: 100;
    /* left/top = center-X, bottom-Y of sprite */
    transform: translateX(-50%) translateY(-100%);
    cursor: grab;
    user-select: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    touch-action: none;
  }

  .teto:active { cursor: grabbing; }

  .sprite {
    width: auto;
    height: 180px;
    image-rendering: auto;
    display: block;
    pointer-events: none;
  }

  /* ── State animations ── */

  .walk .sprite {
    animation: bob 0.28s steps(2) infinite;
  }

  .held .sprite {
    animation: swing 0.45s steps(2) infinite;
  }

  .asleep .sprite {
    transform: rotate(22deg) !important;
    transform-origin: bottom center;
  }

  /* Flying: gentle 3-step bob, slight tilt */
  .flying .sprite {
    animation: fly-bob 0.9s steps(3) infinite;
    filter: drop-shadow(0 8px 16px rgba(255,107,157,0.5));
  }

  /* Floating bread */
  .bread-float {
    position: absolute;
    bottom: calc(100% + 4px);
    left: 50%;
    transform: translateX(-50%);
    font-size: 22px;
    pointer-events: none;
    animation: bread-rise 1.2s steps(8) forwards;
  }

  /* ZZZ */
  .zzz {
    font-family: 'Press Start 2P', monospace;
    font-size: 7px;
    color: #8888cc;
    margin-top: 2px;
    white-space: nowrap;
    animation: zzz-drift 2s steps(4) infinite;
  }

  /* Ground shadow */
  .shadow {
    width: 80px;
    height: 10px;
    background: rgba(0, 0, 0, 0.28);
    border-radius: 50%;
    margin-top: 2px;
    filter: blur(4px);
  }

  /* ── Speech bubble ── */
  :global(.bubble) {
    position: fixed;
    z-index: 200;
    transform: translateX(-50%) translateY(-100%);
    background: #fff8fc;
    border: 3px solid #ff6b9d;
    box-shadow: 3px 3px 0 #000;
    padding: 8px 14px;
    font-family: 'Press Start 2P', monospace;
    font-size: 12px;
    color: #cc3377;
    white-space: nowrap;
    pointer-events: none;
    animation: bubble-pop 1.8s ease forwards;
  }

  :global(.bubble-tail) {
    position: absolute;
    bottom: -11px;
    left: 50%;
    transform: translateX(-50%);
    width: 0; height: 0;
    border-left:  7px solid transparent;
    border-right: 7px solid transparent;
    border-top:   10px solid #ff6b9d;
  }

  :global(.bubble-tail::after) {
    content: '';
    position: absolute;
    top: -13px; left: -5px;
    width: 0; height: 0;
    border-left:  5px solid transparent;
    border-right: 5px solid transparent;
    border-top:   8px solid #fff8fc;
  }

  /* ── Keyframes ── */

  @keyframes bob {
    0%   { transform: translateY(0);   }
    50%  { transform: translateY(-4px); }
    100% { transform: translateY(0);   }
  }

  @keyframes swing {
    0%   { transform: rotate(-8deg); }
    50%  { transform: rotate(8deg);  }
    100% { transform: rotate(-8deg); }
  }

  @keyframes fly-bob {
    0%   { transform: translateY(0)   rotate(-4deg); }
    33%  { transform: translateY(-8px) rotate(0deg);  }
    66%  { transform: translateY(-4px) rotate(4deg);  }
    100% { transform: translateY(0)   rotate(-4deg); }
  }

  @keyframes bubble-pop {
    0%   { opacity: 0; transform: translateX(-50%) translateY(-115%) scale(0.7); }
    10%  { opacity: 1; transform: translateX(-50%) translateY(-100%) scale(1.08); }
    18%  { transform: translateX(-50%) translateY(-100%) scale(1); }
    80%  { opacity: 1; }
    100% { opacity: 0; transform: translateX(-50%) translateY(-108%); }
  }

  @keyframes bread-rise {
    0%   { bottom: 4px;   opacity: 1; }
    40%  { bottom: 40px;  opacity: 1; }
    70%  { bottom: 75px;  opacity: 0.6; }
    100% { bottom: 110px; opacity: 0; }
  }

  .spin .sprite {
    animation: spin 0.6s steps(8) forwards !important;
  }

  @keyframes spin {
    0%   { transform: rotate(0deg)   scaleX(1);  }
    25%  { transform: rotate(90deg)  scaleX(0.2); }
    50%  { transform: rotate(180deg) scaleX(1);  }
    75%  { transform: rotate(270deg) scaleX(0.2); }
    100% { transform: rotate(360deg) scaleX(1);  }
  }

  @keyframes zzz-drift {
    0%   { transform: translateY(0)    translateX(0);   opacity: 1;   }
    33%  { transform: translateY(-5px) translateX(3px); opacity: 0.8; }
    66%  { transform: translateY(-10px) translateX(6px); opacity: 0.4; }
    100% { transform: translateY(-14px) translateX(9px); opacity: 0;  }
  }
</style>
