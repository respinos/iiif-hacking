let manifest;
let canvases;
let $viewer;
let evt;

let manifestUrl = '../data/clark1ic.003109971.json';

console.log("AHOY", manifesto);

$viewer = document.querySelector('#viewer');
// $viewer.innerHTML = `<pre x-text="message"></pre>`;
// $viewer.setAttribute('x-data', `{ message: "Hello, La Jolla", ready: false }`);

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

