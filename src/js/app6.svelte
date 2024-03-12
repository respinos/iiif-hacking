<script>
  import { onMount } from 'svelte';
  import * as manifesto from 'manifesto.js';
  import OpenSeadragon from 'openseadragon';

  import { PaneGroup, Pane, PaneResizer } from "paneforge";

  export let manifestUrl = '../data/clark1ic.003109971.json';

  let message = 'Hello, La Jolla!';
  let loaded = false;
  let manifest;
  let canvases;
  let tileSources;
  let ranges;
  let canvasIdx = 1;
  let lastCanvasIdx;

  let dragonEl;
  let dragon;

  let detailsGroupEl;

  let btnZoomIn;
  let btnZoomOut;
  let btnHome;
  let btnFullPage;
  let btnNextCanvas;
  let btnPreviousCanvas;

  let imageToolbarOpen = false;
  let fx = {
    brightness: 100,
    contrast: 100,
    saturate: 100,
    grayscale: 0,
    invert: 0,
  };
  let fxToolsOpen = {
    brightness: false,
    contrast: false,
    saturate: false,
  }
  let fxFlipped = false;

  function fxRotate(delta) {
    let deg = dragon.viewport.getRotation();
    let next_deg = deg + delta;
    if ( next_deg < 0 ) { next_deg = 360 + next_deg; }
    dragon.viewport.setRotation(next_deg, true);
  }

  function updateFx(kv) {
    fx = Object.assign(fx, kv);
    let el = dragonEl.querySelector('.openseadragon-canvas');
    window.el = el;
    let filter = [];
    Object.keys(fx).forEach((key) => {
      filter.push(`${key}(${fx[key]}%)`);
    })
    el.style.filter = filter.join(' ');
    console.log("-- updateFx", kv, fx, el, filter, el.style.filter);
  }

  function revertImage() {
    updateFx({
      brightness: 100,
      contrast: 100,
      saturate: 100,
      grayscale: 0,
      invert: 0
    });
    // and rotate
    dragon.viewport.setRotation(0, true);
    // and flip
    dragon.viewport.setFlip(false);
  }

  function getInfoUrl(canvas) {
    let image = canvas.getImages()[0];
    let imageId = image.getResource().getServices()[0].id;
    return `${imageId}/info.json`;
  }

  function openCanvas(canvas, idx) {
    canvasIdx = idx + 1;
    dragon.goToPage(idx);
  }

  function gotoCanvasId(canvasId) {
    console.log("-- gotoCanvasId", canvasId);
    const canvas = canvases.find((c) => c.id == canvasId);
    const idx = canvases.findIndex((c) => c.id == canvasId);
    openCanvas(canvas, idx);
  }

  function togglePanels(event) {
    if (event.target.localName === 'sl-details') {
      [...detailsGroupEl.querySelectorAll('sl-details')].map(details => (details.open = event.target === details));
    }
  }

  function onCanvasChange(event) {
    console.log("-- onCanvasChange", canvasIdx, lastCanvasIdx);
    if ( canvasIdx <= 0 ) { canvasIdx = lastCanvasIdx; }
    else if ( canvasIdx > canvases.length ) { canvasIdx = lastCanvasIdx; }
    else {
      dragon.goToPage(canvasIdx - 1);
    }
  }
  
  // $: manifesto.loadManifest(manifestUrl).then((data) => {
  //   manifest = manifesto.parseManifest(data);
  //   canvases = manifest.getSequences()[0].getCanvases();
  // });

  $: if ( ! manifest ) {
    setTimeout(() => {
    manifesto.loadManifest(manifestUrl).then((data) => {
      manifest = manifesto.parseManifest(data);
      window.manifest = manifest;
      canvases = manifest.getSequences()[0].getCanvases();
      tileSources = [];
      canvases.forEach((canvas) => {
        tileSources.push(getInfoUrl(canvas));
      })
      let range = manifest.getTopRanges();
      if ( range.length ) {
        ranges = range[0].getRanges();
      }
      loaded = true;
    });
    }, 0)
  }

  $: if ( loaded && dragonEl !== undefined && dragon === undefined ) {
    // setTimeout(() => {
      dragon = OpenSeadragon({
        element: dragonEl,
        prefixUrl: "//openseadragon.github.io/openseadragon/images/",
        gestureSettingsMouse: {
          scrollToZoom: false,
          clickToZoom: false,
          dblClickToZoom: true,
          flickEnabled: true,
          pinchRotate: true
        },
        gestureSettingsTouch: {
          pinchRotate: true
        },
        showNavigationControl: true,
        zoomInButton: btnZoomIn,
        zoomOutButton: btnZoomOut,
        homeButton: btnHome,
        nextButton: btnNextCanvas,
        previousButton: btnPreviousCanvas,
        sequenceMode: true,
        tileSources: tileSources,
        initialPage: canvasIdx - 1,
      });

      dragon.addHandler('page', (event) => {
        console.log('-- page', event);
        canvasIdx = event.page + 1;
      })

      window.dragon = dragon;
    // }, 100);
    console.log("AHOY", loaded, dragonEl, getInfoUrl(canvases[canvasIdx]));
  }

  onMount(() => {
    setTimeout(() => {
      message = 'Message received, La Jolla.';
    }, 5000);
  })
</script>

<PaneGroup direction="horizontal">
  <Pane defaultSize={25} class="viewer--sidebar">
    <div style="max-height: 100%; padding: 1rem; display: grid; grid-template-rows: minmax(0, 1fr);">
    <sl-tab-group>
      <!-- <sl-tab slot="nav" panel="message">Message</sl-tab> -->
      {#if loaded}
        <sl-tab slot="nav" panel="items">Pages</sl-tab>
        {#if ranges}
        <sl-tab slot="nav" panel="ranges">Index</sl-tab>
        {/if}
      {/if}

      <sl-tab-panel name="message">
        <pre>{message}</pre>
      </sl-tab-panel>
      {#if loaded}
        <sl-tab-panel name="items">
          <div style="height: 100%; overflow: auto;">
          <ul class="list-unstyled flex flex-flow-column flex-align-center">
            {#each canvases as canvas, idx (canvas.id)}
              {@const image = canvas.getImages()[0]}
              {@const imageId = image.getResource().getServices()[0].id}
              <li class="w-80">
                <figure class="m-0 w-100">
                  <button 
                    on:click={openCanvas(canvas, idx)} 
                    type="button" 
                    class="button button--ghost flex flex-flow-column w-100 flex-align-center flex-justify-center gap-0_125 p-half"
                    >
                    <img loading="lazy" src="{imageId}/full/!150,150/0/default.jpg" alt="" class="border" />
                    <p class="text-xxx-small m-0">{canvas.getLabel().getValue()}</p>
                  </button>
                </figure>
              </li>
            {/each}
          </ul>
          </div>          
        </sl-tab-panel>
          {#if ranges}
          <sl-tab-panel name="ranges">
            <ul>
              {#each ranges as range}
                {@const label = range.getLabel().getValue()}
                {@const canvasId = range.getCanvasIds()[0]}
                <li>
                  <a href="#" on:click={gotoCanvasId(canvasId)}>{label}</a></li>
              {/each}
            </ul>
          </sl-tab-panel>
          {/if}
        {/if}
    </sl-tab-group>
    </div>
    {#if false}
    <div class="details-group" on:sl-show={togglePanels} bind:this={detailsGroupEl}>
      <sl-details summary="Message" open>
        <pre>{message}</pre>
      </sl-details>
      {#if loaded}
        {#if ranges}
          <sl-details summary="Index">
            <pre>THERE WOULD BE CONTENTS</pre>
          </sl-details>
        {/if}
        <sl-details summary="Items">
          <div style="height: 100%; overflow: auto;">
          <ul class="list-unstyled flex flex-flow-column flex-align-center">
            {#each canvases as canvas, idx (canvas.id)}
              {@const image = canvas.getImages()[0]}
              {@const imageId = image.getResource().getServices()[0].id}
              <li class="w-80">
                <figure class="m-0 w-100">
                  <button 
                    on:click={openCanvas(canvas, idx)} 
                    type="button" 
                    class="button button--ghost flex flex-flow-column w-100 flex-align-center flex-justify-center gap-0_125 p-half"
                    >
                    <img loading="lazy" src="{imageId}/full/!150,150/0/default.jpg" alt="" class="border" />
                    <p class="text-xxx-small m-0">{canvas.getLabel().getValue()}</p>
                  </button>
                </figure>
              </li>
            {/each}
          </ul>
          </div>
        </sl-details>
      {/if}
    </div>
    {/if}
  </Pane>
  <PaneResizer class="pane--resizer">
    <span class="material-icons">drag_indicator</span>
  </PaneResizer>
  <Pane defaultSize={75}>
    {#if loaded}
      <div class="image-viewer-pane">
        <div bind:this={dragonEl} class="image-viewer-wrap">
          <div class="image-tools-toolbar">
            {#if imageToolbarOpen}
              <button class="button button--square button--ghost"
                on:click={() => fxRotate(90)}>
                <span class="material-icons">rotate_right</span>
              </button>
              <button class="button button--square button--ghost"
                on:click={() => fxRotate(-90)}>
                <span class="material-icons">rotate_left</span>
              </button>
              <button class="button button--square button--ghost" 
                class:active={fxFlipped}
                on:click={() => {fxFlipped = !true; dragon.viewport.toggleFlip()}}>
                <span class="material-icons">swap_horiz</span>
              </button>
              <div style="position: relative;">
                <button class="button button--square button--ghost" 
                  class:active={fxToolsOpen.brightness}
                  on:click={() => fxToolsOpen.brightness = ! fxToolsOpen.brightness}>
                  <span class="material-icons">brightness_5</span>
                </button>
                <div class="image-options" class:hidden={!fxToolsOpen.brightness}>
                  <input type="range" orient="vertical" min="0" max="200" bind:value={fx.brightness} on:change={(evt) => updateFx({ brightness: evt.target.value })} />
                </div>
              </div>
              <div style="position: relative">
                <button class="button button--square button--ghost" 
                  class:active={fxToolsOpen.contrast}
                  on:click={() => fxToolsOpen.contrast = ! fxToolsOpen.contrast}>
                  <span class="material-icons">exposure</span>
                </button>
                <div class="image-options" class:hidden={!fxToolsOpen.contrast}>
                  <input type="range" orient="vertical" min="0" max="200" bind:value={fx.contrast} on:change={(evt) => updateFx({ contrast: evt.target.value })} />
                </div>
              </div>
              <div style="position: relative">
                <button class="button button--square button--ghost" 
                  class:active={fxToolsOpen.saturate}
                  on:click={() => fxToolsOpen.saturate = ! fxToolsOpen.saturate}>
                  <span class="material-icons">gradient</span>
                </button>
                <div class="image-options" class:hidden={!fxToolsOpen.saturate}>
                  <input type="range" orient="vertical" min="0" max="200" bind:value={fx.saturate} on:change={(evt) => updateFx({ saturate: evt.target.value })} />
                </div>
              </div>
              <button class="button button--square button--ghost" 
                class:active={fx.grayscale == 1}
                on:click={() => updateFx({grayscale: fx.grayscale == 100 ? 0 : 100})}>
                <span class="material-icons">tonality</span>
              </button>
              <button class="button button--square button--ghost" 
                class:active={fx.invert == 1}
                on:click={() => updateFx({ invert: fx.invert == 100 ? 0 : 100 })}>
                <span class="material-icons">invert_colors</span>
              </button>
              <button class="button button--square button--ghost" on:click={revertImage}>
                <span class="material-icons">replay</span>
              </button>
              <button class="button button--square button--ghost" on:click={() => {imageToolbarOpen = false}}>
                <span class="material-icons">close</span>
              </button>              
            {:else}
              <button class="button button--square button--ghost" on:click={() => {imageToolbarOpen = true}}>
                <span class="material-icons">tune</span>
              </button>
            {/if}
          </div>
        </div>
        <div class="image-viewer-toolbar bg-light">
          <button type="button" class="button button--ghost button--square" bind:this={btnZoomIn}>
            <span class="material-icons">add_circle_outline</span>
          </button>
          <button type="button" class="button button--ghost button--square" bind:this={btnZoomOut}>
            <span class="material-icons">remove_circle_outline</span>
          </button>
          <button type="button" class="button button--ghost button--square" bind:this={btnHome}>
            <span class="material-icons">home</span>
          </button>
          <button type="button" class="button button--ghost button--square" bind:this={btnFullPage}>
            <span class="material-icons">fullscreen</span>
          </button>
          <div style="width: 1px; height: 50%; background: #999; margin: 0 0.25rem;"></div>
          <div class="flex flex-flow-row flex-align-center" style="gap: 0.125rem; font-size: 0.875rem;">
            <label for="jumpToSeq" class="col-form-label">#</label>
            <input class="form-control" id="jumpToSeq" type="text" style="width: 4ch; text-align: center;" bind:value={canvasIdx} on:focus={() => lastCanvasIdx = canvasIdx} on:change={onCanvasChange} />
            <span style="text-wrap: none;"> / {canvases.length}</span>
          </div>
          <button type="button" class="button button--ghost button--square" bind:this={btnPreviousCanvas}>
            <span class="material-icons" style="transform: rotate(-90deg);">arrow_circle_up</span>
          </button>
          <button type="button" class="button button--ghost button--square" bind:this={btnNextCanvas}>
            <span class="material-icons" style="transform: rotate(90deg);">arrow_circle_up</span>
          </button>
        </div>
      </div>
    {:else}
    <pre>SEADRAGON</pre>
    {/if}
  </Pane>
</PaneGroup>

<style>

  /* .thumbnail-list {
    overflow: auto;
  } */

  .details-group {
    overflow: hidden;
  }

  sl-details {
    max-height: 100%;
  }

  sl-tab-group sl-tab {
    margin-top: 4px;
  }

  sl-tab-group sl-tab:first-child {
    margin-left: 4px;
  }

  sl-tab-group::part(base) {
    display: grid !important;
    grid-template-rows: min-content 1fr;
    max-height: 100%;
    overflow: hidden;
  }

  .image-viewer-pane {
    display: grid;
    grid-template-rows: 1fr min-content;
    /* gap: 0.5rem; */
    /* padding-bottom: 0.125rem; */

    height: 100%;
    width: 100%;

    position: relative;
  }

  .image-viewer-wrap {
    background: inherit;
    position: relative;
    max-height: 100%;
  }

  .image-viewer-toolbar {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.25rem;
  }

  .image-viewer-toolbar button {
    line-height: 0;
    margin: 0;
  }

  .image-tools-toolbar {
    position: absolute; 
    top: 10px; 
    right: 10px;
    display: flex;
    flex-direction: row;
    flex-wrap: none;
    align-items: center;
    justify-content: flex-end;
    gap: 0;
    z-index: 1000;
    box-shadow: 0px 10px 15px -3px rgba(0,0,0,0.1);
  }

  .image-tools-toolbar button {
    opacity: 0.8;
  }

  .image-tools-toolbar button {
    line-height: 0;
    margin: 0;
  }

  .image-tools-toolbar button:not(:first-child) {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  .image-tools-toolbar button:not(:last-child) {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  .image-tools-toolbar button + button {
    margin-left: -1px;
  }

  .image-tools-toolbar div > button {
    border-radius: 0;
    margin-left: -1px;
  }

  .bg-light {
    background: var(--color-neutral-100);
  }

  .button--square {
    padding: 0.5rem;
  }

  button.active {
    background: var(--color-neutral-200);
  }
  
  .image-options {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%) translateY(25%);
    /* transform: rotate(90deg) translate(42px, 27px);
    width: 100px; */
    height: 12rem;
    width: 2rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: var(--color-neutral-100);
    border-radius: 1rem;
    padding: 0.125rem;
    box-shadow: 0px 10px 15px -3px rgba(0,0,0,0.1);
  }

  .hidden {
    display: none !important;
  }

  /* input[type="range"] {
    appearance: slider-vertical;
    width: 1rem;
    height: 10rem;
    padding: 0 0.125rem;
    flex-grow: 1;
  } */

</style>