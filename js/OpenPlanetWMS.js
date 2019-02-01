// js lib for OpenPlanetWMS , GPL v3.0
function NASA_mars_layer_group (NASA_WMS, URI_base, lingua){
	function Mars_layer(id, WMS_dir, ext, z, attribution){
		var tl = new L.TileLayer(WMS_dir + '/{z}/{y}/{x}' + ext ,{
			maxZoom: z+1,
			attribution: attribution,
			id: 'mars.' + id
		});
		return tl;
	}
	var def_WMS ='/1.0.0/default/default028mm';
	var cr = 'NASA/ESA';
	var g = [];
	for (id in NASA_WMS){
		g.push({
			name: NASA_WMS[id].text[lingua],
			layer: Mars_layer(id, URI_base + '/' + NASA_WMS[id].adr + def_WMS, NASA_WMS[id].ext, NASA_WMS[id].z, cr)
		});
	}
	return g;
}

function default_graticule (){
	return [
		{
			name: "1°",
			layer: L.graticule({
				interval: 1,
				style: {
					color: '#ffffff',
					weight: 1
				}
			})
		},
		{
			name: "10°",
			layer: L.graticule({
				interval: 10,
				style: {
					color: '#EDF714',
					weight: 1
				}
			})
		}
	];	
}

function doubleToDegree(c60){
	var degree = Math.floor(c60);
	var rawMinute = Math.abs((c60 % 1) * 60);		
	var minute = Math.floor(rawMinute);
	var  second = Math.floor(Math.round((rawMinute % 1) * 60));
	return degree + '°' + minute + '′' + second + '″';
}

// Display coordinates
function onCoord(e){
		var c = e.latlng;
    document.getElementById('lat').innerHTML = "&nbspφ " + c.lat.toFixed(5);
    document.getElementById('lon').innerHTML = "&nbspλ " + c.lng.toFixed(5);
    document.getElementById('lat_60').innerHTML = "&nbspφ " + doubleToDegree(c.lat);
    document.getElementById('lon_60').innerHTML = "&nbspλ " + doubleToDegree(c.lng);
}
