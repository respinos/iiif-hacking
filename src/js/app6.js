import Viewer from './app6.svelte';

const $viewer = document.querySelector('#viewer');
const manifestUrl = $viewer.dataset.manifestUrl;
new Viewer({
  target: $viewer,
  props: {
    manifestUrl: manifestUrl,
  }
});