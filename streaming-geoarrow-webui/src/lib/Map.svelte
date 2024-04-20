<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { Deck } from "@deck.gl/core";
  import { type Unsubscriber } from "svelte/store";

  import { layers } from "./store/layers";
  import { initBaseMapLayer, initEntities } from './layers';

  let canvas: HTMLCanvasElement;
  let deckGL: Deck;
  let unsubscribers: Unsubscriber[];

  onMount(() => {
    deckGL = new Deck({
      initialViewState: {
        longitude: -122.4,
        latitude: 37.74,
        zoom: 11,
      },
      controller: true,
      canvas: canvas,
    });

    const layerUnsubscriber = layers.subscribe((layers) => {
      deckGL.setProps({
        layers,
      });
    });

    initBaseMapLayer();
    initEntities();

    unsubscribers = [layerUnsubscriber];
  });

  onDestroy(() => {
    for (const unsubscriber of unsubscribers) {
      unsubscriber();
    }
  });
</script>

<canvas bind:this={canvas}></canvas>
