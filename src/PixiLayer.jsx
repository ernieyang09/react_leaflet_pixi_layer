import React, { Component } from 'react';
import L from 'leaflet';
import { MapLayer } from 'react-leaflet';
import * as PIXI from 'pixi.js';
import 'leaflet-pixi-overlay';
import img from './marker-icon.png';
import Node from './QuadTree';

// console.log(new Node('test'))

class PixiLayer extends MapLayer {

	initParams = () => ({
		frame: null,
		firstDraw: true,
		prevZoom: null,
		start: null,
	});


  createLeafletElement(props) {
		let { frame, firstDraw, prevZoom, start } = {...this.initParams()};
		const animation = this.props.animation;

		// console.log(props)
    const { map } = this.context;
		// console.log(map)

		const points = props.data.map((point) => {
			const graphic = new PIXI.Graphics();
			graphic.popup = L.popup()
				.setLatLng(point.location)
				.setContent('I am a circle.');
			graphic.interactive = true;
			return graphic;
		});

		let projectedCenters = [];
		var circleRadius = 30;

    const pixiContainer = new PIXI.Container();
		// pixiContainer.addChild(...points);
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
				projectedCenters = props.data.map(point => project(point.location)) ;

				circleRadius = 0.2;
				let test = new PIXI.Graphics();
				test.beginFill(0xff0033, 0.8);
				test.drawCircle(0, 0, circleRadius);
				test.endFill();
				points.forEach((point, i) => {
					// point.clear();
					// point.lineStyle(3 / scale, 0xff0000, 1);
					// point.beginFill(0xff0033, 0.8);
					// point.x = projectedCenters[i].x;
					// point.y = projectedCenters[i].y;
					// point.drawCircle(0, 0, circleRadius);
					// point.endFill();
					// console.log(point)
					let texture = test.generateCanvasTexture();
					const a = new PIXI.Sprite(test.generateCanvasTexture());
					a.x = projectedCenters[i].x;
					a.y = projectedCenters[i].y;
					a.interactive = true;
					// console.log(texture)
					pixiContainer.addChild(a)
				})
				// circleRadius = 1/ 32;
			}

			if (firstDraw || prevZoom !== zoom) {
				// points.forEach((point, i) => {
				// 	point.clear();
				// 	// point.lineStyle(3 / scale, 0xff0000, 1);
				// 	point.beginFill(0xff0033, 0.8);
				// 	point.x = projectedCenters[i].x;
				// 	point.y = projectedCenters[i].y;
				// 	point.drawCircle(0, 0, circleRadius);
				// 	point.endFill();
				// 	// console.log(point)
				// 	let texture = point.generateCanvasTexture();
				// 	const a = new PIXI.Sprite(point.generateCanvasTexture());
				// 	a.x = projectedCenters[i].x;
				// 	a.y = projectedCenters[i].y;
				// 	// console.log(texture)
				// 	pixiContainer.addChild(a)
				// })

			}

			function animate(timestamp) {
				var progress;
			  if (start === null) start = timestamp;
			  progress = timestamp - start;
			  var lambda = progress / animation.duration;
			  if (lambda > 1) lambda = 1;
			  lambda = lambda * (0.4 + lambda * (2.2 + lambda * -1.6));
				renderer.render(container);
			  if (progress < animation.duration) {
			    frame = requestAnimationFrame(animate);
			  }
			}

			if (animation && !firstDraw && prevZoom !== zoom) {
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
