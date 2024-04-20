import { layers } from './store/layers'
import type { Position } from "@deck.gl/core";
import { TileLayer } from "@deck.gl/geo-layers";
import { BitmapLayer, PathLayer, GeoJsonLayer } from "@deck.gl/layers";
import { parse } from "@loaders.gl/core";
import { WKBLoader } from "@loaders.gl/wkt";

export function initBaseMapLayer() {
  const tileLayer = new TileLayer<ImageBitmap>({
    id: 'base-map',
    // https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Tile_servers
    data: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],

    // Since these OSM tiles support HTTP/2, we can make many concurrent requests
    // and we aren't limited by the browser to a certain number per domain.
    maxRequests: 20,

    pickable: true,
    highlightColor: [60, 60, 60, 40],
    // https://wiki.openstreetmap.org/wiki/Zoom_levels
    minZoom: 0,
    maxZoom: 19,
    tileSize: 256,
    zoomOffset: devicePixelRatio === 1 ? -1 : 0,
    renderSubLayers: (props) => {
      const [[west, south], [east, north]] = props.tile.boundingBox;
      const { data, ...otherProps } = props;

      return [
        new BitmapLayer(otherProps, {
          image: data,
          bounds: [west, south, east, north],
        }),
        new PathLayer<Position[]>({
          id: `${props.id}-border`,
          data: [
            [
              [west, north],
              [west, south],
              [east, south],
              [east, north],
              [west, north],
            ],
          ],
          getPath: (d) => d,
          getColor: [255, 0, 0],
          widthMinPixels: 4,
        }),
      ];
    },
  });

  layers.push(tileLayer);
}

export async function initEntities() {
  const data = (await fetch("http://localhost:8000/arrow").then((rawData) =>
    parse(rawData, WKBLoader, {
      worker: false,
      wkb: {
        shape: "binary-geometry",
      },
    }),
  )) as any;

  console.debug(data);

  const geoLayer = new GeoJsonLayer({
    id: "geo-layer",
    data: {
      type: "FeatureCollection",
      shape: "binary-feature-collection",
      features: [data],
    },
    getFillColor: [0, 255, 0, 255],
    getLineColor: [0, 255, 0, 255],
    getLineWidth: 2000,
    getPointRadius: 2000,
    getElevation: 10,
  });

  layers.push(geoLayer);
}
