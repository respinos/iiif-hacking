let manifest;
let canvases;
let $viewer;
let evt;

let manifestUrl = '../data/clark1ic.003109971.json';

console.log("AHOY", manifesto);

$viewer = document.querySelector('#viewer');
// $viewer.innerHTML = `<pre x-text="message"></pre>`;
$viewer.setAttribute('x-data', `{ message: "Hello, La Jolla", ready: false }`);

setTimeout(() => {
  // x-data="{ message: 'Hello, La Jolla.' }" 
  $viewer.innerHTML = `<pre x-text="message"></pre>
<template x-if="ready">
<pre>BOO-YAH</pre>
</template>
`;
  evt = new CustomEvent("loaded", { detail: { message: 'Initializing', ready: false } });
  window.dispatchEvent(evt);

  manifesto.loadManifest(manifestUrl).then(function(data) {
    manifest = manifesto.parseManifest(data);
    canvases = manifest.getSequences()[0].getCanvases();

    evt = new CustomEvent("loaded", { 
      detail: { 
        message: `Loaded: ${canvases.length}`,
        ready: true,
      } 
    });
    window.dispatchEvent(evt);

    console.log("OK?");
  })
  .catch(function() {
    console.log("ERROR", arguments);
  })

}, 1000);

// function setup() {
//   return {
//     message: 'Message received.',

//     init() {
//       console.log("OK");
//     }
//   }
// }

// document.addEventListener('alpine:init', () => {
//   Alpine.data('payload', () => ({
//     message: 'Message received. La Jolla.'
//   }))
// });
