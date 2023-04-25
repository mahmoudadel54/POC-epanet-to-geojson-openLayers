import React from "react";
import TileLayer from "ol/layer/Tile";
import { View, Map } from "ol";
import SourceOSM from "ol/source/OSM";
import UploadEpanetComp from "../uploadComp";
import './style.css'
import 'ol/ol.css'
function MapComponent() {
    const [map, setMap] = React.useState();
    React.useEffect(()=>{
        const osm = new TileLayer({
            title: "OSM",
            type: "base",
            visible: true,
            source: new SourceOSM(),
          });
         let map = new Map({
            target: 'mapDiv',
            layers: [osm],
            view: new View({
              // projection: "EPSG:4326",
              center: [0, 0],
              zoom: 2,
            }),
          });
          setMap(map);
          return ()=>{
            map?.setTarget(null);
          }
    },[])
  return <>
  <div id="mapDiv"></div>
  <UploadEpanetComp map={map} />
  </>
}

export default MapComponent;
