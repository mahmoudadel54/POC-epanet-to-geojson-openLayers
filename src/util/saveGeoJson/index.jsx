import { saveAs } from 'file-saver';

export function saveGeoJson(geoJson, filename) {

    const blob = new Blob([JSON.stringify(geoJson)], {type: "text/plain;charset=utf-8"});
    saveAs(blob, `${filename}.json`);

}