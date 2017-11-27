import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Map, TileLayer } from 'react-leaflet';
import PixiLayer from '../src/PixiLayer';

const position = [51.505, -0.09];

class App extends Component {
  render () {
    return (
      <Map center={position} zoom={14}>
        <TileLayer
          url="//stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png"
        />
        <PixiLayer />
      </Map>
    );
  }
}


ReactDOM.render(
    <App />,
  document.getElementById('Root'),
);
