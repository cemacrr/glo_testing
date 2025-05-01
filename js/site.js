'use strict';

/** global variables: **/

/* map div: */
var map_div = document.getElementById('map_div');

/* map data variable: */
var map_data = null;

/** leaflet mouse position control: **/

L.Control.MousePosition = L.Control.extend({
  options: {
    position: 'bottomleft',
    separator: ', ',
    emptyString: 'lat: --, lon: --',
    lngFirst: false,
    numDigits: 3,
    lngFormatter: function(lon) {
      return 'lon:' + lon.toFixed(3)
    },
    latFormatter: function(lat) {
      return 'lat:' + lat.toFixed(3)
    },
    prefix: ''
  },

  onAdd: function (map) {
    this._container = L.DomUtil.create('div', 'leaflet-control-mouseposition');
    L.DomEvent.disableClickPropagation(this._container);
    map.on('mousemove', this._onMouseMove, this);
    this._container.innerHTML=this.options.emptyString;
    return this._container;
  },

  onRemove: function (map) {
    map.off('mousemove', this._onMouseMove)
  },

  _onMouseMove: function (e) {
    var lng = this.options.lngFormatter ? this.options.lngFormatter(e.latlng.lng) : L.Util.formatNum(e.latlng.lng, this.options.numDigits);
    var lat = this.options.latFormatter ? this.options.latFormatter(e.latlng.lat) : L.Util.formatNum(e.latlng.lat, this.options.numDigits);
    var value = this.options.lngFirst ? lng + this.options.separator + lat : lat + this.options.separator + lng;
    var prefixAndValue = this.options.prefix + ' ' + value;
    this._container.innerHTML = prefixAndValue;
  }

});

L.Map.mergeOptions({
    positionControl: true
});

L.Map.addInitHook(function () {
    if (this.options.positionControl) {
        this.positionControl = new L.Control.MousePosition();
    }
});

L.control.mousePosition = function (options) {
    return new L.Control.MousePosition(options);
};

/** functions: **/

/* function to load site data: */
async function load_data() {
  /* init map_data: */
  map_data = {};

  /* thulagi 1990: */
  await fetch(
    'data/thulagi/thulagi_1990.geojson',
    {'cache': 'no-cache'}
  ).then(async function(data_req) {
    map_data['thulagi_1990'] = await data_req.json();
  }); 
  /* thulagi 2000: */
  await fetch(
    'data/thulagi/thulagi_2000.geojson',
    {'cache': 'no-cache'}
  ).then(async function(data_req) {
    map_data['thulagi_2000'] = await data_req.json();
  }); 
  /* thulagi 2010: */
  await fetch(
    'data/thulagi/thulagi_2010.geojson',
    {'cache': 'no-cache'}
  ).then(async function(data_req) {
    map_data['thulagi_2010'] = await data_req.json();
  }); 

  /* now draw the map: */
  draw_map();

};

/* map drawing function: */
function draw_map() {

  /* check if map exists: */
  if (map_div._leaflet_id != undefined) {
    /* return if map exists: */
    return;
  };

  /* define sentinel-2 layer: */
  var s2_layer = L.tileLayer(
    'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2023_3857/default/g/{z}/{y}/{x}.jpg', {
      'attribution': '<a href="https://s2maps.eu/" target="_blank">Sentinel-2 cloudless</a>'
    }
  );

  /* define cartodb layer: */
  var carto_layer = L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
      'attribution': '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
      'subdomains': 'abcd'
    }
  );

  /* define openstreetmap layer: */
  var osm_layer = L.tileLayer(
    'https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      'attribution': '&copy; <a href="https://osm.org/copyright" target="_blank">OpenStreetMap</a> contributors'
    }
  );

  /* all tile layers: */
  var tile_layers = {
    'Sentinel-2': s2_layer,
    'Carto': carto_layer,
    'Open Street Map': osm_layer
  };

  /* define map: */
  var map = L.map(map_div, {
    /* map layers: */
    layers: [
      s2_layer
    ],
    /* map center: */
    center: [
      28.49,
      84.484
    ],
    /* define bounds: */
    maxBounds: [
      [28, 29],
      [84, 85],
    ],
    maxBoundsViscosity: 1.0,
    /*  zoom levels: */
    zoom:    14,
    minZoom: 12,
    maxZoom: 16
  });

  /* remove prefix from attribution control: */
  var map_atrr_control = map.attributionControl;
  map_atrr_control.setPrefix(false);
  /* add mouse pointer position: */
  L.control.mousePosition().addTo(map);
  /* add scale: */
  L.control.scale().addTo(map);

  /* add polygons ... thulagi 1990: */
  var thulagi_1990 = L.geoJSON(
    map_data['thulagi_1990']['features'][0],
    {style: function () { return {color: '#6666cc'}; }}
  );
  thulagi_1990.bindTooltip('Thulagi 1990');
//  thulagi_1990.addTo(map);
  /* ... thulagi 2000 ... : */
  var thulagi_2000 = L.geoJSON(
    map_data['thulagi_2000']['features'][0],
    {style: function () { return {color: '#66cc66'}; }}
  );
  thulagi_2000.bindTooltip('Thulagi 2000');
//  thulagi_2000.addTo(map);
  /* ... thulagi 2010: */
  var thulagi_2010 = L.geoJSON(
    map_data['thulagi_2010']['features'][0],
    {style: function () { return {color: '#cc6666'}; }}
  );
  thulagi_2010.bindTooltip('Thulagi 2010');
  thulagi_2010.addTo(map);

  /* all polygon layers: */
  var poly_layers = {
    'Thulagi 1990': thulagi_1990,
    'Thulagi 2000': thulagi_2000,
    'Thulagi 2010': thulagi_2010
  };

  /* add layer control: */
  L.control.layers(tile_layers, poly_layers, {collapsed: true}).addTo(map);

};

/* set up the page: */
function load_page() {
  load_data();
}

/** add listeners: **/

/* on page load: */
window.addEventListener('load', function() {
  /* set up the page ... : */
  load_page();
});
