import React, { Component } from 'react';
import L from 'leaflet';
import { MapLayer } from 'react-leaflet';
import * as PIXI from 'pixi.js';
import 'leaflet-pixi-overlay';
import img from './marker-icon.png';

class PixiLayer extends MapLayer {
  createLeafletElement(props) {
    const { map } = this.context;
    var frame = null;
		var firstDraw = true;
		var prevZoom;

		var polygonLatLngs = [
				[51.509, -0.08],
				[51.503, -0.06],
				[51.51, -0.047],
				[51.509, -0.08]
			];
		var projectedPolygon;
		var circleCenter = [51.508, -0.11];
		var projectedCenter;
		var circleRadius = 85;
		var triangle = new PIXI.Graphics();
		triangle.popup = L.popup()
			.setLatLng([51.5095, -0.063])
			.setContent('I am a polygon.');
		var circle = new PIXI.Graphics();

		circle.popup = L.popup()
			.setLatLng(circleCenter)
			.setContent('I am a circle.');
			[triangle, circle].forEach(function(geo) {
				geo.interactive = true;
			});
    const pixiContainer = new PIXI.Container();
		pixiContainer.addChild(triangle, circle);
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
				projectedPolygon = polygonLatLngs.map(function(coords) {return project(coords);});
				projectedCenter = project(circleCenter);
				circleRadius = circleRadius / scale;
			}
			if (firstDraw || prevZoom !== zoom) {
				triangle.clear();
				triangle.lineStyle(3 / scale, 0x3388ff, 1);
				triangle.beginFill(0x3388ff, 0.2);
				triangle.x = projectedPolygon[0].x;
				triangle.y = projectedPolygon[0].y;
				projectedPolygon.forEach(function(coords, index) {
					if (index == 0) triangle.moveTo(0, 0);
					else triangle.lineTo(coords.x - triangle.x, coords.y - triangle.y);
				});
				triangle.endFill();
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
    console.log(this)
    return null;
  }
}

export default PixiLayer;
