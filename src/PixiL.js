import L from 'leaflet';
import * as PIXI from 'pixi.js';

const PixiCanvasLayer = L.Layer.extend({
  options: {
    radius: 5,
    forceCanvas: false,
    resolution: L.Browser.retina ? 2 : 1,
    projectionZoom: function(map) {return (map.getMaxZoom() + map.getMinZoom()) / 2;}
  },

  initialize: function (pixiContainer, options) {
    L.setOptions(this, options);
    L.stamp(this);
    this._pixiContainer = pixiContainer;
    this._rendererOptions = {
      transparent: true,
      resolution: this.options.resolution,
      antialias: true,
      forceCanvas: this.options.forceCanvas
    };
  },

  setData: function(dataSet) {

  },

  _initContainer: function() {
    if (this._container) { return; }
    this._renderer = PIXI.autoDetectRenderer(this._rendererOptions);
    this._container = L.DomUtil.create('div', 'leaflet-pixi-overlay');
    if (this._zoomAnimated) {
      L.DomUtil.addClass(this._container, 'leaflet-zoom-animated');
    }
    this._container.appendChild(this._renderer.view);
    this.getPane().appendChild(this._container);
  },

  onAdd: function() {
    this._initContainer();
    const map = this._map;
    this._initialZoom = this.options.projectionZoom(map);
    this._wgsOrigin = L.latLng([0, 0]);
    this._wgsInitialShift = map.project(this._wgsOrigin, this._initialZoom);
    this._mapInitialZoom = map.getZoom();
    // this._scale = map.getZoomScale(this._mapInitialZoom, this._initialZoom);
    // const _layer = this;
    window.a = this
    this._update();
  },

  onRemove: function() {
    L.DomUtil.remove(this._container);
  },

  _update: function() {
    const mapSize = this._map.getSize();
    this._center = this._map.getCenter();
    this._zoom = this._map.getZoom();

    const view = this._renderer.view;
    if (!this._renderer.size || this._renderer.size.x !== mapSize.x || this._renderer.size.y !== mapSize.y) {
      if (this._renderer.gl) {
        this._renderer.resolution = this._renderer.rootRenderTarget.resolution = this.options.resolution;
      }
      this._renderer.resize(mapSize.x, mapSize.y);
      view.style.width = mapSize.x + 'px';
      view.style.height = mapSize.y + 'px';
      if (this._renderer.gl) {
        var gl = this._renderer.gl;
        if (gl.drawingBufferWidth !== this._renderer.width) {
          this._renderer.resolution = this._renderer.rootRenderTarget.resolution = this.options.resolution * gl.drawingBufferWidth / this._renderer.width;
          this._renderer.resize(mapSize.x, mapSize.y);
        }
      }
      this._renderer.size = mapSize;
    }
    var shift = this._map.latLngToLayerPoint(this._wgsOrigin)
      ._subtract(this._wgsInitialShift.multiplyBy(this._scale));
    // this._pixiContainer.scale.set(this._scale);
    this._pixiContainer.position.set(shift.x, shift.y);
    // console.log(shift,this._scale)
    // this._drawCallback(this.utils);
  }

});

export default PixiCanvasLayer;
