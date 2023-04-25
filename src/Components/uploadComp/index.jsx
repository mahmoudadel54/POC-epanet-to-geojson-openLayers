import { useState, useEffect, useRef } from "react";
//ol imports
import GeoJSON from "ol/format/GeoJSON";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
//utils
import { toGeoJson } from "../../util/inpToGeoJson";
import { saveGeoJson } from "../../util/saveGeoJson";
import SpinnerComp from "../Spinner";

function UploadEpanetComp({ map }) {
  const uploadRef = useRef();
  const [epanetInp, setEpanetInp] = useState(undefined);

  const [loadingData, setLoadingData] = useState(false);
  const [epanetGeojson, setEpanetGeoJson] = useState();
  // once the epanet file is uploaded, read it and get geojson data
  useEffect(() => {
      if (epanetInp) {
        setLoadingData(true);
          console.log("epanet file");
          console.log({ epanetInp });
          const result = toGeoJson(epanetInp);
          console.log({ map, result });
          setEpanetGeoJson(result);

        setLoadingData(false);

    };

  }, [epanetInp]);

  //add geojson to map
  useEffect(() => {
    if (epanetGeojson && map) {
      let zoomedToLayer = false;
      epanetGeojson.forEach((geojsonLayer, index) => {
        let source = new VectorSource({
          features: new GeoJSON({
            // featureProjection: "EPSG:3857", //the preview projection (defult proj of openLayers)
          }).readFeatures(geojsonLayer),
        });

        let layer = new VectorLayer({
          source: source,
          format: new GeoJSON(),
          name: "added-layer",
        });

        map.addLayer(layer);
        if (!zoomedToLayer && layer?.getSource()?.getExtent()) {
          map?.getView()?.fit(layer?.getSource()?.getExtent());
          zoomedToLayer = true;
        }
      });
    }
  }, [epanetGeojson]);

  //upload epanet handler
  const handleUploadEpaent = (evt) => {
    let files = evt.target.files;
    const reader = new FileReader();

    reader.onabort = () => console.log("file reading was aborted");
    reader.onerror = () => console.log("file reading has failed");
    reader.onload = () => {
      // Do whatever you want with the file contents
      const inpFile = reader.result;
      setEpanetInp(inpFile);
    };

    reader.readAsText(files[0]);
  };
  //handle reset map by removing all layers on map
  const resetMap = () => {
    setEpanetInp();
    let layers = map
      .getLayers()
      .getArray()
      .filter((lay) => lay.get("name"));
    if (layers.length) {
      uploadRef.current.value = "";
      layers.forEach((l) => map.removeLayer(l));
      map
        .getView()
        .fit(
          map
            .getLayerGroup()
            .getLayers()
            .array_[0].getSource()
            .projection.getExtent()
        );
    }
  };
  //handle downlopad geojson 
  const downloadGeojson = () => {
    if (epanetGeojson?.length) {
      epanetGeojson.forEach((layer) => {
        saveGeoJson(layer, layer?.layerName || "fileGeojson");
      });
    }
  };
  return (
    <>
      <div>
        {loadingData && <SpinnerComp />}
        <input
          ref={uploadRef}
          type="file"
          name="epanet"
          accept=".inp"
          id="epanet"
          onChange={handleUploadEpaent}
        />
        <span className="reset-btn" onClick={resetMap}>
          Reset
        </span>
        <span className="reset-btn" onClick={downloadGeojson}>
          Download Geojson files
        </span>
      </div>
    </>
  );
}

export default UploadEpanetComp;
