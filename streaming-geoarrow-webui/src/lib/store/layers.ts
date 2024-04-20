import { writable, type Readable } from 'svelte/store';
import { Layer } from '@deck.gl/core';

class LayerStore implements Readable<Layer[]> {
  public subscribe;

  public push(layer: Layer) {
    this.update(layers => {
      layers.push(layer);
      return layers;
    })
  }

  public remove(layerID: string) {
    this.update(layers => {
      return layers.filter(layer => layer.id != layerID)
    })
  }

  public empty() {
    this.set([]);
  }

  constructor() {
    const { subscribe, set, update } = writable<Layer[]>([]);
    this.subscribe = subscribe;
    this.set = set;
    this.update = update
  }

  private set;
  private update;
}

export const layers = new LayerStore();

