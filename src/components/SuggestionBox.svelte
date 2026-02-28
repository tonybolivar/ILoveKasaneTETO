<script>
  // SuggestionBox.svelte — Pixel-art suggestion form → Discord webhook

  let open       = false;
  let text       = '';
  let status     = 'idle'; // idle | sending | success | error
  let errorMsg   = '';
  const MAX      = 500;

  $: remaining = MAX - text.length;

  async function submit() {
    if (!text.trim() || status === 'sending') return;
    status = 'sending';

    try {
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestion: text.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        errorMsg = data.error ?? 'something went wrong';
        status = 'error';
      } else {
        status = 'success';
        text   = '';
        setTimeout(() => { open = false; status = 'idle'; }, 2000);
      }
    } catch {
      errorMsg = 'could not reach server';
      status = 'error';
    }
  }

  function close() {
    open = false;
    text = '';
    status = 'idle';
  }

  function onKeydown(e) {
    if (e.key === 'Escape') close();
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit();
  }
</script>

<svelte:window on:keydown={onKeydown} />

<!-- Trigger button — top right -->
<button class="trigger" on:click={() => open = true} aria-label="Leave a suggestion">
  ✉ SUGGEST
</button>

<!-- Modal overlay -->
{#if open}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="overlay" on:click|self={close}>
    <div class="modal">

      <div class="modal-header">
        <span class="modal-title">✉ LEAVE A NOTE</span>
        <button class="close-btn" on:click={close}>✕</button>
      </div>

      {#if status === 'success'}
        <div class="feedback success">
          ♡ SENT! THANK YOU~
        </div>

      {:else}
        <textarea
          class="input"
          maxlength={MAX}
          placeholder="say something..."
          bind:value={text}
          disabled={status === 'sending'}
        ></textarea>

        <div class="footer-row">
          <span class="count" class:warn={remaining < 50}>{remaining}</span>

          {#if status === 'error'}
            <span class="feedback error">{errorMsg}</span>
          {/if}

          <button
            class="send-btn"
            on:click={submit}
            disabled={!text.trim() || status === 'sending'}
          >
            {status === 'sending' ? '...' : 'SEND ▶'}
          </button>
        </div>
      {/if}

    </div>
  </div>
{/if}

<style>
  /* ── Trigger button ── */
  .trigger {
    position: fixed;
    top: 16px;
    right: 16px;
    z-index: 300;
    background: #0d0d1a;
    border: 3px solid #7b8fff;
    color: #7b8fff;
    font-family: 'Press Start 2P', monospace;
    font-size: 7px;
    padding: 8px 12px;
    letter-spacing: 1px;
    box-shadow: 4px 4px 0 #000, 0 0 16px rgba(123,143,255,0.15);
    cursor: pointer;
  }

  .trigger:hover { background: #12122a; }

  /* ── Overlay ── */
  .overlay {
    position: fixed;
    inset: 0;
    z-index: 500;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* ── Modal ── */
  .modal {
    width: 340px;
    background: #0d0d1a;
    border: 3px solid #7b8fff;
    box-shadow: 6px 6px 0 #000, 0 0 30px rgba(123,143,255,0.2);
    font-family: 'Press Start 2P', monospace;
    image-rendering: pixelated;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #1a1a3a;
    border-bottom: 3px solid #7b8fff;
    padding: 10px 12px;
  }

  .modal-title {
    font-size: 8px;
    color: #7b8fff;
    letter-spacing: 1px;
  }

  .close-btn {
    background: none;
    border: none;
    color: #555577;
    font-size: 9px;
    cursor: pointer;
    font-family: 'Press Start 2P', monospace;
    padding: 0;
    line-height: 1;
  }

  .close-btn:hover { color: #ff6b9d; }

  /* ── Textarea ── */
  .input {
    display: block;
    width: 100%;
    height: 120px;
    background: #08080f;
    border: none;
    border-bottom: 2px solid #1a1a3a;
    color: #c8c8e8;
    font-family: 'Press Start 2P', monospace;
    font-size: 8px;
    line-height: 1.8;
    padding: 12px;
    resize: none;
    outline: none;
    box-sizing: border-box;
  }

  .input::placeholder { color: #333355; }
  .input:disabled { opacity: 0.5; }

  /* ── Footer row ── */
  .footer-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: #0d0d1a;
  }

  .count {
    font-size: 6px;
    color: #555577;
    flex-shrink: 0;
  }

  .count.warn { color: #ff6b9d; }

  /* ── Send button ── */
  .send-btn {
    margin-left: auto;
    background: #7b8fff;
    border: none;
    color: #0d0d1a;
    font-family: 'Press Start 2P', monospace;
    font-size: 7px;
    padding: 7px 12px;
    cursor: pointer;
    letter-spacing: 1px;
    flex-shrink: 0;
  }

  .send-btn:hover:not(:disabled) { background: #9aaaff; }
  .send-btn:disabled { opacity: 0.4; cursor: default; }

  /* ── Feedback messages ── */
  .feedback {
    font-size: 7px;
    letter-spacing: 1px;
  }

  .feedback.success {
    color: #4fffda;
    text-align: center;
    padding: 28px 12px;
    width: 100%;
  }

  .feedback.error {
    color: #ff6b9d;
    flex: 1;
    line-height: 1.6;
  }
</style>
