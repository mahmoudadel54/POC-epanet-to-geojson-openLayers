
import './App.css'
import MapComponent from './Components/Map';
// @js-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
// import RunToGeoJsonWorker from "worker-loader!./worker/runToGeoJson.worker";
// import { RunToGeoJsonWorkerType } from "./worker/runToGeoJson.worker"; 
function App() {

  return (
    <>
      <div>
<MapComponent />
     </div>
    </>
  )
}

export default App
