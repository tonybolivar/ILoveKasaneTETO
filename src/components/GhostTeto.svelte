<script>
  export let x = 0;
  export let y = 0;
  export let username = '';
  export let facing = 'right';
  export let isFlying = false;
  export let anim = 'idle';

  $: spriteSrc = (isFlying || anim !== 'walk')
    ? '/tetofront.png'
    : facing === 'right' ? '/tetoright.png' : '/tetoleft.png';
</script>

<div
  class="ghost"
  class:walk={anim === 'walk'}
  class:flying={isFlying}
  style="left: {x}px; top: {y}px;"
>
  <div class="name">{username}</div>
  <img class="sprite" src={spriteSrc} alt="Ghost Teto" draggable="false" />
</div>

<style>
  .ghost {
    position: fixed;
    z-index: 90;
    transform: translateX(-50%) translateY(-100%);
    pointer-events: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    opacity: 0.55;
  }

  .sprite {
    width: auto;
    height: 180px;
    image-rendering: auto;
    display: block;
    filter: hue-rotate(40deg) brightness(0.8) saturate(0.65)
            drop-shadow(0 0 10px rgba(123,143,255,0.55));
  }

  .name {
    font-family: 'Press Start 2P', monospace;
    font-size: 5px;
    color: #7b8fff;
    background: rgba(13,13,26,0.88);
    border: 1px solid #7b8fff;
    padding: 3px 6px;
    white-space: nowrap;
    margin-bottom: 4px;
    letter-spacing: 0.5px;
    text-shadow: 0 0 6px #7b8fff;
  }

  .walk .sprite {
    animation: ghost-bob 0.28s steps(2) infinite;
  }

  .flying .sprite {
    animation: ghost-fly 0.9s steps(3) infinite;
  }

  @keyframes ghost-bob {
    0%   { transform: translateY(0);    }
    50%  { transform: translateY(-4px); }
    100% { transform: translateY(0);    }
  }

  @keyframes ghost-fly {
    0%   { transform: translateY(0)    rotate(-4deg); }
    33%  { transform: translateY(-8px) rotate(0deg);  }
    66%  { transform: translateY(-4px) rotate(4deg);  }
    100% { transform: translateY(0)    rotate(-4deg); }
  }
</style>
