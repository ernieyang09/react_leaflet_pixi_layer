import React, { Component } from 'react';
import PropTypes from 'prop-types';
import L from 'leaflet';
import { MapLayer } from 'react-leaflet';
import * as PIXI from 'pixi.js';
import PixiCanvasLayer from './PixiL';
import img from './marker-icon.png';


class PixiLayer extends Component {
  static contextTypes = {
    layerContainer: PropTypes.shape({
      addLayer: PropTypes.func.isRequired,
      removeLayer: PropTypes.func.isRequired,
    }),
    map: PropTypes.instanceOf(L.Map),
    pane: PropTypes.string,
  }

  componentDidMount() {
    const pixiContainer = new PIXI.Container();
		pixiContainer.interactive = true;
		pixiContainer.interactiveChildren = true;
		pixiContainer.buttonMode = true;
		pixiContainer.on('click', function(e) {
      console.log(e)
      const target = e.target;
			if (target && target.popup) {
				setTimeout(function() {target.popup.openOn(map);});
			}
	  });
    const test = new PixiCanvasLayer(pixiContainer);
    test._data = this.props.data;
    test.setData(this.props.data.map(point => point.location))
    this.context.map.addLayer(test)

  }

  render() {
    // console.log(this.props)
    return null;
  }
}

export default PixiLayer;
