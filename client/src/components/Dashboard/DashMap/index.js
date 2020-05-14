import React, { useState, useEffect } from "react";
import { GoogleMap } from "@react-google-maps/api";
import MapContent from "../../MapContent";
import MapOnline from "../../MapOnline";
import "./style.css";

function DashMap() {
  const [center, setCenter] = useState();

  useEffect(() => {
    showPosition()
  }, [])

  function showPosition() {
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        setCenter(
          {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            zoom: 10
          });
      }, 
      setCenter(
        {
          lat: -33.8688,
          lng: 151.2093,
          zoom: 3
        })
      )
    }
    // incase the browser doesn't support navigator
    else {
      setCenter(
        {
          lat: -33.8688,
          lng: 151.2093,
        });
    }
  }

  let map;
  const onMapLoad = loadedMap => (map = loadedMap);
  const centerChanged = () =>
    map && setCenter({ lat: map.center.lat(), lng: map.center.lng() });

  // Determine which map content to load
  const mapType = window.location.href.split("/map-type/")
 
  if(mapType[1] === "map") {
    return (
      <div id="main">
        <GoogleMap
          id="map"
          zoom={10}
          center={center}
          onLoad={onMapLoad}
          onCenterChanged={centerChanged}
        > 
          <MapContent />
        </GoogleMap>
      </div>
    );
  }
  else if(mapType[1] === "online") {
    return (
      <GoogleMap
        id="map"
        zoom={10}
        center={center}
        onLoad={onMapLoad}
        onCenterChanged={centerChanged}
      >
        <MapOnline />
      </GoogleMap>
    );
  }
};

export default DashMap;