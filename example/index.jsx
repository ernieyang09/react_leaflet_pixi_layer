import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Map, TileLayer } from 'react-leaflet';
import PixiLayer from '../src/PixiLayer';
import PixiLayer2 from '../src/PixiLayer2';

const position = [51.505, -0.09];

const data = [...Array(300)].map(()=>({
  location: [
    51.54574790241904 + Math.random() * (51.46422135690053 - 51.54574790241904),
    0.09312629699707033 + Math.random() * (-0.27311325073242193 - 0.09312629699707033)
  ],
  data: {}
}))

class App extends Component {


  render () {
    return (
      <Map center={position} zoom={14}>
        <TileLayer
          url="//stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png"
        />
        <PixiLayer2
          data={data}
          level={{ filter: 'rssi', icon: ['0xff0000',,'0xffff00','0x00ff00'], range: []}}
          animation={{duration: 1000}}
        />
        {/* <PixiLayer
          data={data}
          level={{ filter: 'rssi', icon: ['0xff0000',,'0xffff00','0x00ff00'], range: []}}
          animation={{duration: 1000}}
        /> */}
      </Map>
    );
  }
}


ReactDOM.render(
    <App />,
  document.getElementById('Root'),
);
