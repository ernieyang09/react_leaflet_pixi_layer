import React, { Component } from 'react';
import L from 'leaflet';
import { MapLayer } from 'react-leaflet';
import * as PIXI from 'pixi.js';
import 'leaflet-pixi-overlay';
import img from './marker-icon.png';

class PixiLayer extends MapLayer {
	params = {
		frame: null,
		firstDraw: true,
		prevZoom: null,
		duration: 100,
		start: null,
	}

	animate = (timestamp) => {
		const { duration } = this.params;
		if (start === null) start = timestamp;
		const progress = timestamp - start;
		let lambda = progress / this.params.duration;
		if (lambda > 1) lambda = 1;
		lambda = lambda * (0.4 + lambda * (2.2 + lambda * -1.6));
		renderer.render(container);
		if (progress < duration) {
			frame = requestAnimationFrame(animate);
		}
	}

  createLeafletElement(props) {
		console.log(props)
    const { map } = this.context;
		console.log(map)

    var frame = null;
		var firstDraw = true;
		var prevZoom;

		var circleCenter = [51.508, -0.11];
		var projectedCenter;
		var circleRadius = 85;
		var circle = new PIXI.Graphics();

		circle.popup = L.popup()
			.setLatLng(circleCenter)
			.setContent('I am a circle.');
			[circle].forEach(function(geo) {
				geo.interactive = true;
			});
    const pixiContainer = new PIXI.Container();
		pixiContainer.addChild( circle);
		pixiContainer.interactive = true;
		pixiContainer.interactiveChildren = true;
		pixiContainer.buttonMode = true;
		pixiContainer.on('click', function(e) {
      const target = e.target;
			if (target && target.popup) {
				setTimeout(function() {target.popup.openOn(map);});
			}
	  });

    return L.pixiOverlay(function(utils){
			if (frame) {
				cancelAnimationFrame(frame);
				frame = null;
			}
			var zoom = utils.getMap().getZoom();
			var container = utils.getContainer();
			var renderer = utils.getRenderer();
			var project = utils.latLngToLayerPoint;
			var scale = utils.getScale();

			if (firstDraw) {
				projectedCenter = project(circleCenter);
				circleRadius = circleRadius / scale;
			}
			if (firstDraw || prevZoom !== zoom) {
				circle.clear();
				circle.lineStyle(3 / scale, 0xff0000, 1);
				circle.beginFill(0xff0033, 0.5);
				circle.x = projectedCenter.x;
				circle.y = projectedCenter.y;
				circle.drawCircle(0, 0, circleRadius);
				circle.endFill();

			}
			var duration = 100;
			var start;
			function animate(timestamp) {
				var progress;
			  if (start === null) start = timestamp;
			  progress = timestamp - start;
			  var lambda = progress / duration;
			  if (lambda > 1) lambda = 1;
			  lambda = lambda * (0.4 + lambda * (2.2 + lambda * -1.6));
				renderer.render(container);
			  if (progress < duration) {
			    frame = requestAnimationFrame(animate);
			  }
			}
			if (!firstDraw && prevZoom !== zoom) {
				start = null;
				frame = requestAnimationFrame(animate);
			}
			firstDraw = false;
			prevZoom = zoom;
			renderer.render(container);

		},pixiContainer,{
			forceCanvas: false,
		});
  }

  render() {
    return null;
  }
}

export default PixiLayer;
