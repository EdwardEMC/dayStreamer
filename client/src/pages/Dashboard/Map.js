import React, { Component } from "react";
import { LoadScript } from '@react-google-maps/api'
import DashMap from "../../components/Dashboard/DashMap";
// import "./style.css";

class Map extends Component {
  render() {
    return (
      <LoadScript
        id="script-loader"
        //change this to new one
        googleMapsApiKey="AIzaSyCPo2a9WyXNAIwuMBgu8AXuCatBsc17TSo"
      >
        <DashMap /> 
      </LoadScript> 
    );
  };
};

export default Map;