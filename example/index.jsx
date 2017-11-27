import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Map, TileLayer } from 'react-leaflet';

const position = [51.505, -0.09];

class App extends Component {
  render () {
    return (
      <Map center={position} zoom={13}>
        <TileLayer
          url="https://cartodb-basemaps-a.global.ssl.fastly.net/rastertiles/voyager_labels_under/{z}/{x}/{y}.png"
        />
      </Map>
    );
  }
}


ReactDOM.render(
    <App />,
  document.getElementById('Root'),
);
