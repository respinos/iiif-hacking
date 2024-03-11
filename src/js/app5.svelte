<script>
  import { onMount } from 'svelte';
  import * as manifesto from 'manifesto.js';
  import OpenSeadragon from 'openseadragon';

  import { PaneGroup, Pane, PaneResizer } from "paneforge";

  // icons
  import DotsSixVertical from 'phosphor-svelte/lib/DotsSixVertical';
  import PlusCircle from 'phosphor-svelte/lib/PlusCircle';
  import MinusCircle from 'phosphor-svelte/lib/MinusCircle';
  import House from 'phosphor-svelte/lib/House';
  import ArrowsOut from 'phosphor-svelte/lib/ArrowsOut';
  import ArrowCircleLeft from 'phosphor-svelte/lib/ArrowCircleLeft';
  import ArrowCircleRight from 'phosphor-svelte/lib/ArrowCircleRight';
  import DotOutline from 'phosphor-svelte/lib/DotOutline';

  export let manifestUrl = '../data/clark1ic.003109971.json';

  let message = 'Hello, La Jolla!';
  let loaded = false;
  let manifest;
  let canvases;
  let canvasIdx = 0;

  let dragonEl;
  let dragon;

  let btnZoomIn;
  let btnZoomOut;
  let btnHome;
  let btnFullPage;

  function getInfoUrl(canvas) {
    let image = canvas.getImages()[0];
    let imageId = image.getResource().getServices()[0].id;
    return `${imageId}/info.json`;
  }
  
  // $: manifesto.loadManifest(manifestUrl).then((data) => {
  //   manifest = manifesto.parseManifest(data);
  //   canvases = manifest.getSequences()[0].getCanvases();
  // });

  $: if ( ! manifest ) {
    setTimeout(() => {
    manifesto.loadManifest(manifestUrl).then((data) => {
      manifest = manifesto.parseManifest(data);
      canvases = manifest.getSequences()[0].getCanvases();
      loaded = true;
    });
    }, 0)
  }

  $: if ( loaded && dragonEl !== undefined ) {
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
      });
      dragon.open(getInfoUrl(canvases[canvasIdx]));
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
  <Pane defaultSize={25} style="display: grid; grid-template-rows: min-content 1fr;" class="bg-light text-dark">
    <pre>{message}</pre>
    {#if loaded}
    <pre>Loaded: {canvases.length}</pre>
    <div class="thumbnail-list">
      <ul class="list-unstyled d-flex flex-column align-items-center">
        {#each canvases as canvas (canvas.id)}
          {@const image = canvas.getImages()[0]}
          {@const imageId = image.getResource().getServices()[0].id}
          <li class="w-75">
            <figure class="w-100">
              <button on:click={dragon.open(getInfoUrl(canvas))} type="button" class="btn btn-outline-dark d-flex flex-column align-items-center justify-content-center w-100" style="gap: 0.125rem; padding: 0.5rem;">
                <img loading="lazy" src="{imageId}/full/!150,150/0/default.jpg" alt="" class="border" />
                <p class="fs-7 m-0">{canvas.getLabel().getValue()}</p>
              </button>
            </figure>
          </li>
        {/each}
      </ul>
    </div>
    {/if}
  </Pane>
  <PaneResizer class="position-relative d-flex align-items-center jusitfy-content-center bg-dark">
    <DotsSixVertical class="size-4 text-black" weight="bold" color="white" />
  </PaneResizer>
  <Pane defaultSize={75}>
    {#if loaded}
      <div class="image-viewer-pane">
        <div bind:this={dragonEl} class="image-viewer-wrap"></div>
        <div class="image-viewer-toolbar bg-light">
          <button type="button" class="btn btn-light" bind:this={btnZoomIn}>
            <PlusCircle size={32} />
          </button>
          <button type="button" class="btn btn-light" bind:this={btnZoomOut}>
            <MinusCircle size={32} />
          </button>
          <button type="button" class="btn btn-light" bind:this={btnHome}>
            <House size={32} />
          </button>
          <button type="button" class="btn btn-light" bind:this={btnFullPage}>
            <ArrowsOut size={32} />
          </button>
          <!-- <DotOutline size={32} weight="thin" /> -->
          <div style="width: 1px; height: 50%; background: #999; margin: 0 0.25rem;"></div>
          <div class="d-flex align-items-center flex-nowrap" style="gap: 0.125rem; font-size: 0.875rem; padding-left: 0.75rem;">
            <label for="jumpToSeq" class="col-form-label">#</label>
            <input class="form-control" id="jumpToSeq" type="text" style="width: 4ch; text-align: center;" bind:value={canvasIdx} />
            <span> / {canvases.length}</span>
          </div>
          <button type="button" class="btn btn-light">
            <ArrowCircleLeft size={32} />
          </button>
          <button type="button" class="btn btn-light">
            <ArrowCircleRight size={32} />
          </button>
        </div>
      </div>
    {:else}
    <pre>SEADRAGON</pre>
    {/if}
  </Pane>
</PaneGroup>

<style>

  .thumbnail-list {
    overflow: auto;
  }

  .image-viewer-pane {
    display: grid;
    grid-template-rows: 1fr min-content;
    gap: 0.125rem;
    /* padding-bottom: 0.125rem; */

    height: 100%;
    width: 100%;
  }

  .image-viewer-toolbar {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 0.125rem;
    padding: 0.125rem;
  }

  .fs-7 {
    font-size: 0.875rem;
  }

</style>