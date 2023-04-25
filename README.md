# POC-epanet-to-geojson-openLayers
It is a simple POC that enable users upload epanet (.inp) file and convert it to geojson then display the layers on Map using openLayers + enable user to download the geojson layers. 
It is inspired from epaet-to-gis repository https://github.com/modelcreate/epanet-to-gis

## Some helpful info:

What is Epanet: It is a Software That Models the Hydraulic and Water Quality Behavior of Water Distribution Piping Systems.

What is Geojson: GeoJSON is a JSON based format designed to represent the geographical features with their non-spatial attributes.

A lot of mapping and GIS software packages support GeoJSON including GeoDjango, OpenLayers, and Geoforge software. It is also compatible with PostGIS and Mapnik. The API services of Google, yahoo and Bing maps also support GeoJSON.


What is Pipe networks: the network consists of pipes, nodes (junctions), pumps, valves, and storage tanks or reservoirs.

This POC enable convert inp file to network geojson layers and display them throught the map and ease downloading the geojson files if needed.

![image](https://user-images.githubusercontent.com/58145645/234270167-d85bedf4-4ca0-40a0-9d0b-316c3a8e93ad.png)
