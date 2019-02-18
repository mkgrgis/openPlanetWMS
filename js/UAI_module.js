/**
 * JavaScript Object Notation intut function
 * @param {*} code code for log and status array
 * @param {*} URI 
 * @param {*} retf function after ok
 * @param {*} context context object for using in function after ok
 */

function IO_xml (code, URI, retf, context){ 
	IO_json (code, URI, retf, context, 'application/xml');
}

function IO_json (code, URI, retf, context, type = 'application/json'){
	IO_json.status[code] = false;
	var req = new XMLHttpRequest();
	req.overrideMimeType(type);
	req._context = context;
	req._retf = retf;
	req._code = code;	
	req.open('GET', URI, true);
	req.addEventListener('load', function(req) {
		var code = req.currentTarget._code;
		IO_json.status[code] = true;
		if (req.currentTarget.status != 200) {
			// обработать ошибку
			alert( '' + '\n' +req.currentTarget.status + ': ' + req.currentTarget.statusText ); 			
		  } else {
		var c = req.currentTarget._context;		
		console.log( code + " ✔")
		retf ({
			req: req,
			context : c
			});
		}
	}
	);
	req.send(null);
}
IO_json.status = {};

/**
 * "Union Astromomique Internationale" module: official shp => leaflet object layers + contur event
 * @param {*} leaflet_map L.map object
 * @param {*} paths { nomenclature_json, planet_shp, planet_wkt_json, baloon_directory } : nomenclature.json, PLANET_nomenclature.zip (shp), PLANET_nomenclature.json (wkt conture), png baloons
 * @param {*} retf 
 * @param {*} norm180 coord. 1= -180<*<180,  0 = 0<*<360
 * @param {*} lingua lingua
 */
function UAI_module(leaflet_map, paths, retf, options){
	this.status = false;
	this.options = options;
	this.lingua = (options && options.lingua) ? lingua : navigator.language.split('-')[0];
	this._lmap = leaflet_map;
	this._retf = retf;
	this.paths = paths;	
	this._knt = [];
	IO_json(
		'nom_univ', 
		paths.nomenclature_json, 
		function(o) {			
			o.context.UAI_nom = JSON.parse(o.req.currentTarget.responseText);
			o.context.nomencl_ok();
			},
		this
		);	
	var pp = paths.planet_shp.split('/');
	var planet = pp[pp.length - 1].split('_')[0];
	delete pp;
	UAI_module.req[planet] = this;
	shp(paths.planet_shp).then(UAI_module.shp_ok, UAI_module.shp_non).catch((error) => {
		console.log(error); // вывести ошибку; 
	});

	if (typeof paths.planet_wkt_json != 'undefined'){
		IO_json(
			'contures_wkt', 
			paths.planet_wkt_json,
			function(o) {			
				o.context.UAI_kontur = JSON.parse(o.req.currentTarget.responseText);			
				},
			this
			);
		}
}
 
UAI_module.req = [];
 
UAI_module.shp_ok = function(data) {
	console.log('shp ✔');
	var x = this;
	var p =data.fileName.split('_')[0];
	var el = UAI_module.req[p];
	el.shp_ok(data);
}

UAI_module.shp_non = function(data) {
	console.log('shp ✘ :' + data.message);
	var x = this;
	alert ('UAI shp ✘ :' + data.message);
}
 
UAI_module.prototype.shp_ok = function(data) {
	this.UAI_gr = {};
	this.UAI_el = {};
	this.data = data;
	this.nomencl_ok();
}
 
UAI_module.prototype.nomencl_ok = function() {
	if (typeof this.data == 'undefined' || typeof this.UAI_nom == 'undefined')
		return;
	
	this.shpfile = L.geoJson(this.data, {
		onEachFeature: UAI_module.UAI_obj_Process,
		_UAI_mod : this
		});
 
	delete this.data;
 
	this.sortage = [];
	for (kodo in this.UAI_gr){
		this.sortage.push(this.UAI_gr[kodo]);
	} delete kodo;
 
	this.sortage.sort(UAI_module.sortage);
 
	var UAI_layers = [];
 
	UAI_layers.push({
		//active: (this.options.active == true),
		name: "∀ UAI",
		layer: this.shpfile
	});
 
	for (var i in this.sortage){
		var UAI_l = this.sortage[i];
		var k = UAI_l._UAI_kodo;
		var no = this.UAI_nom[k];
		var text = '';
		text = this.nomencl_descr(k, text);
		text += " (" + k.toLowerCase() + ")";
		UAI_layers.push({
			name: text,
			layer: UAI_l
		});	 
	}
   
	this.UAI_layers = {
		group: "UAI",
		collapsed: true,
		layers: UAI_layers
	}
	this.status = true;	
	if (typeof this._retf == 'function')
		this._retf();
}

UAI_module.prototype.nomencl_descr = function(kodo, kl_desk){
	if (typeof this.UAI_nom[kodo] == 'undefined')
		return '';
	var no = this.UAI_nom[kodo];
	if (typeof no.plural[this.lingua] != 'undefined' && no.plural[this.lingua] != '')
		kl_desk += no.plural[this.lingua] + " ⇒ ";
	if (typeof no.plural.la != 'undefined' && no.plural.la != '')
		kl_desk += no.plural.la;
	else if (typeof no.singular[this.lingua] != 'undefined' && no.singular[this.lingua] != '')
		kl_desk += no.singular[this.lingua];
	else if (typeof no.singular.la != 'undefined' && no.singular.la != '')
		kl_desk += no.singular.la;
	else if (typeof no.singular.en != 'undefined' && no.singular.en != '')
		kl_desk += no.singular.en;
	return kl_desk;
}
 
UAI_module.UAI_obj_Process = function(feature, layer){
	this._UAI_mod._UAI_obj_Process(feature, layer);
}

UAI_module.prototype.search_layer = function () {
	return new L.Control.Search({
		position:'topleft',
		zoom: 4,
		layer: this.shpfile,
		initial: false,
		collapsed: true,
		propertyName: 'name',
		filterData: function(text, records) {
			var I, icase, regSearch, frecords = {};
			text = text.replace(/[.*+?^${}()|[\]\\]/g, '');  //sanitize remove all special characters
			if(text==='')
				return [];
			I = this.options.initial ? '^' : '';  //search only initial text
			icase = !this.options.casesensitive ? 'i' : undefined;
			
			regSearch = new RegExp(I + text, icase);
			for(var key in records) {
				var p = records[key].layer.feature.properties;
				if( regSearch.test(key) || regSearch.test(p.name_EBCDIC) || regSearch.test(p.UAI_id))
					frecords[key]= records[key];
			}
			return frecords;
		},		
		textCancel: '🔍✘',
		textErr: '∄',
		textPlaceholder: 'UAI ...'
	});
}

UAI_module.prototype._UAI_obj_Process = function(feature, layer){
// var utf8Encode=function(str){str=str.replace(/\r\n/g,"\n");var utftext="";for(var n=0;n<str.length;n++){var c=str.charCodeAt(n);if(c<128){utftext+=String.fromCharCode(c);}else if((c>127)&&(c<2048)){utftext+=String.fromCharCode((c>>6)|192);utftext+=String.fromCharCode((c&63)|128);}else{utftext+=String.fromCharCode((c>>12)|224);utftext+=String.fromCharCode(((c>>6)&63)|128);utftext+=String.fromCharCode((c&63)|128);}}return utftext;}
var utf8Decode=function(utftext){var string="";var i=0;var c=c1=c2=0;while(i<utftext.length){c=utftext.charCodeAt(i);if(c<128){string+=String.fromCharCode(c);i++;}else if((c>191)&&(c<224)){c2=utftext.charCodeAt(i+1);string+=String.fromCharCode(((c&31)<<6)|(c2&63));i+=2;}else{c2=utftext.charCodeAt(i+1);c3=utftext.charCodeAt(i+2);string+=String.fromCharCode(((c&15)<<12)|((c2&63)<<6)|(c3&63));i+=3;}}return string;};
 
	if (feature.properties) {
		var fp = feature.properties;
		fp.name_EBCDIC = fp.clean_name;
		delete fp.clean_name;
		if (fp.quad_code && fp.quad_name){
			fp.quad = {code: fp.quad_code, name : fp.quad_name};
			}
		delete fp.quad_name;
		delete fp.quad_code;
		fp.name = utf8Decode(fp.name);
		fp.origin = utf8Decode(fp.origin);
 
		var categ = fp.code;
		var url_el = fp.link.split('/');
		fp.UAI_id = Number(url_el[url_el.length-1]);
		fp.lim = [
			new L.LatLng(fp.max_lat, fp.min_lon),
			new L.LatLng(fp.min_lat, fp.max_lon)
				 ];
		delete fp.max_lat;
		delete fp.min_lon;
		delete fp.min_lat;
		delete fp.max_lon;		 
		fp.center = new L.LatLng(fp.center_lat, fp.center_lon);
		delete fp.center_lat;
		delete fp.center_lon;	  
		if (this.options && this.options.norm180 && layer._latlng.lng > 180.0)
			layer._latlng.lng -= 360.0;
		layer.options.icon = L.icon({
			iconUrl: this.paths.baloon_directory + '/' + categ.toLowerCase() +'.png',
			iconSize:	 [21, 34], // size of the icon
			iconAnchor:  [11, 34], // point of the icon which will correspond to marker's location
			popupAnchor: [0, -20]
			});	  
		layer.on('click', UAI_module.UAI_info_stabile);
		layer.on('mouseover', UAI_module.UAI_info_toolTip);	  
		if (typeof this.UAI_gr[categ] == 'undefined'){
			this.UAI_gr[categ] = new L.LayerGroup();
			this.UAI_gr[categ]._UAI_kodo = categ;
		}
		this.UAI_gr[categ].addLayer(layer);
		this.UAI_el[fp.UAI_id] = layer;
		feature.properties.UAI_module = this;
	}
}
 
UAI_module.sortage = function (a, b) {
	return a._UAI_kodo > b._UAI_kodo;
}
 
UAI_module.UAI_info_stabile = function(e) {
	var m = this.feature.properties.UAI_module;
	var l = e.sourceTarget;
	var UAI_id = l.feature.properties.UAI_id;
	var info = m.info(this.feature.properties, e.sourceTarget);
	l.unbindPopup();
	l.bindPopup(info, {
		maxHeight: 200	 
	});
	l.closeTooltip();
	l.openPopup();
	UAI_module.Kontur(e);   
}
 
UAI_module.UAI_info_toolTip = function(e) {
	var m = this.feature.properties.UAI_module;
	var l = e.sourceTarget;
	var UAI_id = l.feature.properties.UAI_id;
	if (typeof l.feature.UAI_info == 'undefined'){
		l.feature.UAI_info = 1;
		var info = m.info(this.feature.properties, l);
		l.bindTooltip(info, {	  
			interactive: true,
			permanent: false	//offset: [-11, -34]
			}).openTooltip();		  
	}
}
 
UAI_module.Kontur = function(e) {
	var p = e.sourceTarget.feature.properties;
	var m = p.UAI_module;
	var UAI_id = p.UAI_id;
	if (p.diameter == 0)
		return;
	m.addKontur(UAI_id, e.sourceTarget);
}
 
UAI_module.deKontur = function(e) {
	var obj = e.sourceTarget;
	var UAI_id = obj.options.UAI_id;
	var m = obj.options.UAI_module;
	m.deleteKontur(UAI_id);
}

UAI_module.Kontur_info = function(e) {
	var obj = e.sourceTarget;
	var UAI_id = obj.options.UAI_id;
	var m = obj.options.UAI_module;
	m.UAI_el[UAI_id].openTooltip();
}
 
UAI_module.prototype.addKontur = function (UAI_id, geoJson) {
	if (typeof this._knt[UAI_id] != 'undefined')
		return;
	var l = this.wktProcess(UAI_id, geoJson);
	if (typeof l != 'undefined'){
		this._knt[UAI_id] = l;   
		this._lmap.addLayer(l);
	}
}
 
UAI_module.prototype.deleteKontur = function (UAI_id) { 
	var l = this._knt[UAI_id];
	l.closeTooltip();		  
	l.closePopup();
	this._lmap.removeLayer(l);	 
	delete l;
	this._knt.splice(UAI_id, 1);   
}
 
UAI_module.prototype.info = function (fp, layer) {
	if (typeof this.UAI_nom != 'undefined' && typeof this.UAI_nom[fp.code] != 'undefined'){
		var nom_el = this.UAI_nom[fp.code];
		var descr = (typeof nom_el.text[this.lingua] != 'undefined') ? nom_el.text[this.lingua] : ((typeof nom_el.text.en != 'undefined') ? '[en]: ' +nom_el.text.en : '' );
	} else
		var descr = '';
	var infoHTML = '<b>' + fp.name + '</b> (' + fp.code + ')' + ((fp.diameter != 0)? (' ⌀≈' + fp.diameter + ' km ') : ' ') +
	'</br><a href= "' + fp.link + '"> № ' + fp.UAI_id + ' (' + fp.approvaldt.toISOString().substring(0,10) + ')</a>' + '</br>' + 
	' ensc. en :' + fp.origin + '</br>' +
	'(' + fp.ethnicity + ', '+ fp.continent + ')</br>' +   
	'⎕ ' + (fp.quad ? (fp.quad.code ? fp.quad.code : '∅') + ( fp.quad.name? ' (' + fp.quad.name + ')' : '') : '∅') + '</br>' +
	'[' + this.nomencl_descr(fp.code, '') + ' = ' + descr + ' ]';
	delete descr;
	delete nom_el;
	return infoHTML;
	//* type: Albedo Feature, approval: Adopted by IAU
}
 
UAI_module.prototype.norm180 = function (a) {
	if (! this.options || ! this.options.norm180)
		return a;
	var n = [];
	for (var i in a){
		if (a[i].x > 180.0)
			a[i].x -= 360.0;
		n.push([a[i].y, a[i].x]);
	}
	return n;
}
 
UAI_module.prototype.lineObj = function(obj_l, line, id) {
	var ll = L.polyline(line, { color: 'red', UAI_id: id, UAI_module:this });
	obj_l.addLayer(ll);
}
 
UAI_module.prototype.wktPolygon = function (p, id){
	var ll = this.norm180(p);
	return L.polygon(ll, { color: 'red', fillColor: '#f03', UAI_id: id, UAI_module:this });
}
 
UAI_module.prototype.wktProcess = function(id, geoJson) {	 
	if (typeof this.paths.planet_wkt_json == 'undefined')
		return;
	if (typeof this.UAI_kontur == 'undefined' || typeof this.UAI_kontur[id] == 'undefined'){
			console.warn('Non wkt ' + id + ' !');
			return;
	}
	var el_wkt = this.UAI_kontur[id];
	var txt = 'UAI: ' + id + ' ' + geoJson.feature.properties.name;   
	var kontur = new L.featureGroup ();
	kontur = this.wktGeoJson(el_wkt, kontur, id);
	kontur.bindTooltip(txt, {sticky: true});
	kontur.on("dblclick", UAI_module.deKontur);
	kontur.on("click", UAI_module.Kontur_info);
	return kontur;
}
	 
UAI_module.prototype.wktGeoJson = function(wkt_geom, kontur, kodo) {	 
	var wicket = new Wkt.Wkt();
	wicket.read(wkt_geom);
	var kontur = new L.featureGroup ();
	if (wicket.type == 'linestring'){
		var line = this.norm180(wicket.components);  
		this.lineObj(kontur, line, kodo);
	}
	if (wicket.type == 'multilinestring'){   
		for (var i in wicket.components){
				var line = this.norm180(wicket.components[i]);
				this.lineObj(kontur, line, kodo);
		}
	}
	if (wicket.type == 'polygon'){
		var l = this.wktPolygon(wicket.components[0], kodo);
		kontur.addLayer(l);  
	}
	if (wicket.type == 'multipolygon'){  
		for (var i in wicket.components){
			var l = this.wktPolygon(wicket.components[i][0], kodo);
			kontur.addLayer(l);
		}
	}
	return kontur;
}