import L from 'leaflet';
import * as PIXI from 'pixi.js';
import QuadTree from './QuadTree';


const PixiCanvasLayer = L.Layer.extend({
  options: {
    radius: 5,
    // @option updateWhenIdle: Boolean = (depends)
		// Load new tiles only when panning ends.
		// `true` by default on mobile browsers, in order to avoid too many requests and keep smooth navigation.
		// `false` otherwise in order to display new tiles _during_ panning, since it is easy to pan outside the
		// [`keepBuffer`](#gridlayer-keepbuffer) option in desktop browsers.
		updateWhenIdle: L.Browser.mobile,

		// @option updateWhenZooming: Boolean = true
		// By default, a smooth zoom animation (during a [touch zoom](#map-touchzoom) or a [`flyTo()`](#map-flyto)) will update grid layers every integer zoom level. Setting this option to `false` will update the grid layer only when the smooth animation ends.
		updateWhenZooming: true,

		// @option updateInterval: Number = 200
		// Tiles will not update more than once every `updateInterval` milliseconds when panning.
		updateInterval: 200,
    forceCanvas: false,
    useAbsoluteRadius: true,
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
    this._dataBounds = new L.LatLngBounds(dataSet);
    this._quad = new QuadTree(this._boundsToQuery(this._dataBounds), false, 6, 6);
    dataSet.forEach((d)=> {
      this._quad.insert({
        x: d[1],
        y: d[0]
      })
    });
  },

  _boundsToQuery: function(bounds) {
      if (bounds.getSouthWest() == undefined) { return {x: 0, y: 0, width: 0.1, height: 0.1}; }  // for empty data sets
      return {
          x: bounds.getSouthWest().lng,
          y: bounds.getSouthWest().lat,
          width: bounds.getNorthEast().lng-bounds.getSouthWest().lng,
          height: bounds.getNorthEast().lat-bounds.getSouthWest().lat
      };
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
    window.a = this
    this._update();
  },

  onRemove: function() {
    L.DomUtil.remove(this._container);
  },

  getEvents: function () {
    var events = {
      // zoom: this._onZoom,
      moveend: this._update,
      // zoomend: this._zoomChange
    };
    // if (this._zoomAnimated) {
    //   events.zoomanim = this._onAnimZoom;
    // }
    if (!this.options.updateWhenIdle) {
			// update tiles on move, but not more often than once per given interval
			events.move = L.Util.throttle(this._update, this.options.updateInterval, this);
		}
    // console.log(events)
    return events;
  },

  _draw: function(coordinates) {
    const container = this._pixiContainer;
    container.removeChildren();

    coordinates.forEach((point) => {
      const projectedCenter = this._project(point);
      let test = new PIXI.Graphics();
      test.beginFill(0xff0033, 0.8);
      test.drawCircle(0, 0, 5);
      test.endFill();
      test.x = projectedCenter.x;
      test.y = projectedCenter.y;
      test.interactive = true;
      container.addChild(test)

    })
    this._renderer.render(container);
  },

  _project: function(point) {
    return this._map.project(L.latLng(point.y, point.x));
  },

  _getLatRadius: function () {
        return (this.options.radius / 40075017) * 360;
    },

    _getLngRadius: function () {
        return this._getLatRadius() / Math.cos(L.LatLng.DEG_TO_RAD * this._latlng.lat);
    },

    // call to update the radius
    projectLatlngs: function () {
        var lngRadius = this._getLngRadius(),
            latlng2 = new L.LatLng(this._latlng.lat, this._latlng.lng - lngRadius, true),
            point2 = this._map.latLngToLayerPoint(latlng2),
            point = this._map.latLngToLayerPoint(this._latlng);
        this._radius = Math.max(Math.round(point.x - point2.x), 1);
    },

    // the radius of a circle can be either absolute in pixels or in meters
    _getRadius: function() {
        if (this.options.useAbsoluteRadius) {
            return this._radius;
        } else{
            return this.options.radius;
        }
    },

  _update: function(e) {
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

    var shift = this._map.getPixelOrigin();
    this._pixiContainer.position.set(-shift.x, -shift.y);
    // console.log(this._pixiContainer)
    //console.log(shift)

    var coordinates = this._quad.retrieveInBounds(this._boundsToQuery(this._map.getBounds()));
    this._draw(coordinates);
    // this._drawCallback(this.utils);
  }

});

export default PixiCanvasLayer;
