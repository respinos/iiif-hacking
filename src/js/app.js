import Alpine from 'alpinejs';
import * as manifesto from 'manifesto.js';
 
window.Alpine = Alpine;
window.manifesto = manifesto;

let manifest;
let canvases;
let $viewer;
let evt;

let manifestUrl = '../data/clark1ic.003109971.json';

$viewer = document.querySelector('#viewer');
$viewer.setAttribute('x-data', true);
$viewer.innerHTML = `<pre x-text="$store.payload.message"></pre>
<template x-if="$store.payload.ready">
  <template x-for="canvas in $store.payload.canvases">
    <pre x-text="canvas.id"></pre>
  </template>
</template>
`;

Alpine.store('payload', {
  message: 'Initializing',
  ready: false,
})

Alpine.start();

setTimeout(() => {

  manifesto.loadManifest(manifestUrl).then(function(data) {
    manifest = manifesto.parseManifest(data);
    canvases = manifest.getSequences()[0].getCanvases();

    Alpine.store('payload', {
      message: `Loaded: ${canvases.length}`,
      manifest: manifest,
      canvases: canvases,
      ready: true,
    })

    console.log("OK?");
  })
  .catch(function() {
    console.log("ERROR", arguments);
  })

}, 1000);

console.log("loaded");