# Simple HTML/JavaScript application for maps of Mars, Venus, Mercury, Titan etc.
Use public NASA WMS, Leaflet, search plugin, layer plugin, UAI data etc.
# gMarsWMS
Simple HTML/javascript Leaflet.js map of Mars from Google with official Union Astronomique International object nomenclature for Mars. Based on https://github.com/mkgrgis/OpenPlanetaryData


<img src="https://mkgrgis.github.io/mkgrgis/openPlanetWMS/openPlanetWMS_demo.png"/>

Demo http://mkgrgis.github.io/mkgrgis/openPlanetWMS/MarsMap.html

# Usage
Download and see MarsMap.html

# Dependences

Use results of this projects (incapsulated in /lib)
1. https://github.com/Leaflet/Leaflet

2. https://github.com/stefanocudini/leaflet-search ,

      eg. https://github.com/stefanocudini/leaflet-search/blob/master/src/leaflet-search.js 
  
      https://github.com/stefanocudini/leaflet-panel-layers/blob/master/src/leaflet-panel-layers.css
  
3. https://github.com/stefanocudini/leaflet-panel-layers ,

      eg. https://github.com/stefanocudini/leaflet-panel-layers/blob/master/src/leaflet-panel-layers.js
  
      https://github.com/stefanocudini/leaflet-panel-layers/blob/master/src/leaflet-panel-layers.css
  
4. https://github.com/calvinmetcalf/leaflet.shapefile ,

      eg. https://github.com/calvinmetcalf/leaflet.shapefile/blob/gh-pages/shp.js
  
5. https://github.com/arthur-e/Wicket

      eg. https://github.com/arthur-e/Wicket/blob/master/wicket.js
  
Full list of dependences see in html/js debugger network section.

# Some impotant files

  https://github.com/mkgrgis/OpenPlanetaryData/blob/master/%E2%99%82/MARS_nomenclature.json - contures of objects
  
  https://github.com/mkgrgis/OpenPlanetaryData/blob/master/%E2%99%82/MARS_nomenclature.zip - official (but not always actual) nomenclature, copyed from http://planetarynames.wr.usgs.gov/shapefiles/MARS_nomenclature.zip
  
  https://github.com/mkgrgis/OpenPlanetaryData/blob/master/universal/nomenclature.json - simple classificator of planetary nomenclature objects
  
  https://github.com/mkgrgis/OpenPlanetWMS/blob/master/mark - various ballons for objects
