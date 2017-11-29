import L from 'leaflet';

class PixiCanvasLayer extends L.Layer {
  options = {
    padding: 0.1,
    forceCanvas: false,
    resolution: L.Browser.retina ? 2 : 1,
    projectionZoom: function(map) {return (map.getMaxZoom() + map.getMinZoom()) / 2;}
  }

  constructor(pixiContainer, options) {
    super();
    L.setOptions(this, options);
    L.stamp(this);
    this._pixiContainer = pixiContainer;
    this._rendererOptions = {
      transparent: true,
      resolution: this.options.resolution,
      antialias: true,
      forceCanvas: this.options.forceCanvas
    };
  }

  _initContainer = () => {
    if (this._container) { return; }
    this._container = L.DomUtil.create('div', 'leaflet-pixi-overlay');
  }

  onAdd = (map) => {
    this._initContainer();
    console.log(this)
  }

}

export default PixiCanvasLayer;
