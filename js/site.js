/*** site.css ***/

'use strict';

/** global variables: **/

var lake_id = 'GLO_84.485_28.48833';
var lake_x = 84;
var lake_y = 28;
var data_lakes = 'data/lakes_by_id.json';
var data_geometry = 'data/geometry/' + lake_x + '/' + lake_y + '/' +
                    lake_id + '.json';
var data_temperature = 'data/temperature/' + lake_x + '/' + lake_y + '/' +
                       lake_id + '.json';
var data_area = 'data/area/' + lake_x + '/' + lake_y + '/' +
                lake_id + '.json';
var data_volume = 'data/volume/' + lake_x + '/' + lake_y + '/' +
                  lake_id + '.json';
var data_depth = 'data/depth/' + lake_x + '/' + lake_y + '/' +
                 lake_id + '.json';
var page_data = {
  /* lake data: */
  'lake': null,
  /* geometry data: */
  'geometry': null,
  /* temperature data: */
  'temperature': null,
  /* area data: */
  'area': null,
  /* volume data: */
  'volume': null,
  /* depth data: */
  'depth': null,
  /* geometry color map (R viridis mako): */
  'geometry_colors': [
    "#def5e5ff", "#d9f2e0ff", "#d4f1dcff", "#cfeed7ff", "#c9edd3ff", "#c4eacfff",
    "#bfe9cbff", "#b9e6c7ff", "#b3e4c3ff", "#ade3c0ff", "#a7e1bcff", "#a0dfb9ff",
    "#99ddb6ff", "#93dbb5ff", "#8bdab2ff", "#83d8b0ff", "#7bd6afff", "#74d4adff",
    "#6cd3adff", "#65d0adff", "#5fcdadff", "#59ccadff", "#54c9adff", "#50c6adff",
    "#4cc3adff", "#48c1adff", "#46beadff", "#43bbadff", "#41b8adff", "#3fb5adff",
    "#3db3adff", "#3bafadff", "#3aadacff", "#38aaacff", "#37a7acff", "#36a4abff",
    "#35a1abff", "#359fabff", "#359baaff", "#3499aaff", "#3496a9ff", "#3492a8ff",
    "#3490a8ff", "#348da7ff", "#348aa6ff", "#3487a6ff", "#3485a5ff", "#3482a4ff",
    "#357ea4ff", "#357ca3ff", "#3579a2ff", "#3576a2ff", "#3573a1ff", "#3670a0ff",
    "#366da0ff", "#366a9fff", "#37689fff", "#37649eff", "#38629dff", "#395e9cff",
    "#3a5c9bff", "#3b589aff", "#3c5598ff", "#3d5296ff", "#3e4f94ff", "#3f4c91ff",
    "#40498eff", "#40478aff", "#414387ff", "#414083ff", "#413e7eff", "#403c79ff",
    "#403a75ff", "#3f3770ff", "#3e356cff", "#3e3367ff", "#3c3162ff", "#3b2f5eff",
    "#3a2c59ff", "#382a55ff", "#372851ff", "#35264cff", "#342548ff", "#322243ff",
    "#31213fff", "#2e1e3bff", "#2c1c37ff", "#2a1b33ff", "#28192fff", "#26172aff",
    "#231526ff", "#211423ff", "#1e111fff", "#1b0f1bff", "#190e18ff", "#160b14ff",
    "#140910ff", "#11070cff", "#0f0609ff", "#0b0405ff"
  ]
};
var plot_div = document.getElementById('plot_div');

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

/* function to load lake data: */
async function load_lake_data() {
  /* get data: */
  await fetch(
    data_lakes,
    {'cache': 'no-cache'}
  ).then(async function(data_req) {
    var lakes_data = await data_req.json();
    page_data['lake'] = lakes_data[lake_id];
  });
  /* load page text: */
  load_text();
};

/* function to load bits of text on page: */
function load_text() {
  /* set title and header text: */
  var title_el = document.getElementById('title_page');
  title_el.innerHTML += ' - ' + lake_id;
  var header_el = document.getElementById('header_lake_id');
  header_el.innerHTML = lake_id;
  /* add lake info text: */
  var info_el = document.getElementById('header_text');
  var info_text = '';
  var info_keys = [
    'GLO_ID', 'COUNTRY', 'BASIN', 'CONNECTIVITY', 'LONGITUDE', 'LATITUDE'
  ];
  for (var i = 0; i < info_keys.length; i++) {
    var info_key = info_keys[i];
    info_text += '<p>' + info_keys[i].toLowerCase() + ': ' +
                 page_data['lake'][info_key] + '</p>';
  };
  info_el.innerHTML = info_text;
};

/* function to load geometry data: */
async function load_geometry_data() {
  /* get data: */
  await fetch(
    data_geometry,
    {'cache': 'no-cache'}
  ).then(async function(data_req) {
    page_data['geometry'] = await data_req.json();
  });
  /* get data: */
  var data = page_data['geometry'];
  /* draw the geometry plot: */
  geometry_plot(data);
};

/* function to draw geometry plot: */
function geometry_plot(data) {
  /* gep map element: */
  var map_div = document.getElementById('geometry_plot_div');
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
  /* define its_live glacial velocit layer: */
  var gv_layer = L.tileLayer(
    'https://its-live-data.s3-us-west-2.amazonaws.com/velocity_mosaic/v2/static/v_tiles_global/{z}/{x}/{y}.png', {
      'attribution': 'ITS_LIVE'
    }
  );
  /* all tile layers: */
  var tile_layers = {
    'Sentinel-2': s2_layer,
    'Carto': carto_layer,
    'Open Street Map': osm_layer,
    'Glacial Velocity': gv_layer
  };
  /* init polygon layers: */
  var poly_layers = {};
  /* init min / max lat / lon: */
  var min_lat = 90;
  var max_lat = -90;
  var min_lon = 180;
  var max_lon = -180;
  /* get geometry color map: */
  var geometry_colors = page_data['geometry_colors'];
  var color_count = geometry_colors.length;
  /* loop through yars and load polygons: */
  for (var i = (data['years'].length -1); i > -1; i--) {
    /* get color for this polygon: */
    if (data['years'].length == 1) {
      var poly_color_index = Math.round(
        0.5 * (color_count - 1)
      );
    } else {
      var poly_color_index = Math.round(
        (i / (data['years'].length - 1)) * (color_count - 1)
      );
    }
    var poly_color = geometry_colors[poly_color_index];
    /* add polygon: */
    var poly_year = parseInt(data['years'][i]) + '.0';
    var poly_layer = L.geoJSON(
      data['data'][poly_year],
      {style: function () { return {color: poly_color}; }}
    );
    poly_layer.bindTooltip('' + parseInt(data['years'][i]) + '');
    var poly_key = ' ' + parseInt(data['years'][i]);
    poly_layers[poly_key] = poly_layer;
    var poly_bounds = poly_layer.getBounds();
    min_lat = Math.min(min_lat, poly_bounds.getSouth())
    max_lat = Math.max(max_lat, poly_bounds.getNorth())
    min_lon = Math.min(min_lon, poly_bounds.getWest())
    max_lon = Math.max(max_lon, poly_bounds.getEast())
  };
  /* center coords: */
  var center_lat = (max_lat + min_lat) / 2;
  var center_lon = (max_lon + min_lon) / 2;
  /* define map: */
  var map = L.map(map_div, {
    /* map layers: */
    layers: [
      s2_layer
    ],
    /* map center: */
    center: [
      center_lat,
      center_lon,
    ],
    /* define bounds: */
    maxBounds: [
      [min_lat - 0.1, max_lat + 0.1],
      [min_lon -0.1, max_lon + 0.1],
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
  /* add layer control: */
  L.control.layers(
    tile_layers, poly_layers, {collapsed: true, sortLayers: false}
  ).addTo(map);
};

/* function to load temperature data: */
async function load_temperature_data() {
  /* get data: */
  await fetch(
    data_temperature,
    {'cache': 'no-cache'}
  ).then(async function(data_req) {
    page_data['temperature'] = await data_req.json();
  });
  /* get data: */
  var data = page_data['temperature'];
  /* draw the temperature plot: */
  temperature_plot(data);
};

/* function to draw temperature plot: */
function temperature_plot(data) {
  /* init scatter plot data: */
  var scatter_data = [];
  /* loop through data ids: */
  var data_ids = data['data_ids'];
  for (var i = 0; i < data_ids.length; i++) {
    /* get data for this id: */
    var data_id = data_ids[i];
    var id_data = data['data'][data_id];
    /* get x values: */
    var x = id_data['times'];
    if (x[0] == '') {
      var x = id_data['start_dates'];
    };
    var y = id_data['temperatures'];
    /* temperature plot: */
    var scatter_temperature = {
      'name': data_id,
      'type': 'scatter',
      'mode': 'markers',
      'x': x,
      'y': y
    };
    /* plot data, in order of plotting: */
    scatter_data.push(scatter_temperature);
  };
  /* scatter plot layout: */
  var scatter_layout = {
    'xaxis': {
      'type': 'date',
      'hoverformat': '%Y-%m-%d'
    }
  };
  /* scatter plot config: */
  var scatter_conf = {
    'showLink': false,
    'linkText': '',
    'displaylogo': false,
    'modeBarButtonsToRemove': [
      'autoScale2d',
      'lasso2d',
      'hoverClosestCartesian',
      'hoverCompareCartesian',
      'toggleSpikelines'
    ],
    'responsive': true
  };
  /* create the scatter plot: */
  var scatter_plot = Plotly.newPlot(
    temperature_plot_div, scatter_data, scatter_layout, scatter_conf
  );
};

/* function to load area data: */
async function load_area_data() {
  /* get data: */
  await fetch(
    data_area,
    {'cache': 'no-cache'}
  ).then(async function(data_req) {
    page_data['area'] = await data_req.json();
  });
  /* get data: */
  var data = page_data['area'];
  /* draw the area plot: */
  area_plot(data);
};

/* function to draw area plot: */
function area_plot(data) {
  /* init scatter plot data: */
  var scatter_data = [];
  /* loop through data ids: */
  var data_ids = data['data_ids'];
  for (var i = 0; i < data_ids.length; i++) {
    /* get data for this id: */
    var data_id = data_ids[i];
    var id_data = data['data'][data_id];
    /* get x values: */
    var x = id_data['area_years'];
    var y = id_data['areas'];
    /* area plot: */
    var scatter_area = {
      'name': data_id,
      'type': 'scatter',
      'mode': 'lines+markers',
      'x': x,
      'y': y
    };
    /* plot data, in order of plotting: */
    scatter_data.push(scatter_area);
  };
  /* scatter plot layout: */
  var scatter_layout = {
    'xaxis': {
      'type': 'date',
      'hoverformat': '%Y'
    }
  };
  /* scatter plot config: */
  var scatter_conf = {
    'showLink': false,
    'linkText': '',
    'displaylogo': false,
    'modeBarButtonsToRemove': [
      'autoScale2d',
      'lasso2d',
      'hoverClosestCartesian',
      'hoverCompareCartesian',
      'toggleSpikelines'
    ],
    'responsive': true
  };
  /* create the scatter plot: */
  var scatter_plot = Plotly.newPlot(
    area_plot_div, scatter_data, scatter_layout, scatter_conf
  );
};

/* function to load volume data: */
async function load_volume_data() {
  /* get data: */
  await fetch(
    data_volume,
    {'cache': 'no-cache'}
  ).then(async function(data_req) {
    page_data['volume'] = await data_req.json();
  });
  /* get data: */
  var data = page_data['volume'];
  /* draw the volume plot: */
  volume_plot(data);
};

/* function to draw volume plot: */
function volume_plot(data) {
  /* x values are years: */
  var x = data['years'];
  /* init y values: */
  var y = [];
  /* init hover text values: */
  var hover_text = [];
  /* loop through years: */
  for (var i = 0; i < x.length; i++) {
    /* get data for this year: */
    var data_year = x[i];
    y.push(data['data'][data_year]['VOLUME']);
    /* store hover text: */
    hover_text[i] = '<b>volume:</b> ' + data['data'][data_year]['VOLUME'] + '<br>' +
                    '<b>method:</b> ' + data['data'][data_year]['METHOD'] + '<br>' +
                    '<b>data source:</b> ' + data['data'][data_year]['DATA_SOURCE'] + '<br>' +
                    '<b>doi:</b> ' + data['data'][data_year]['DOI'];
  };
  /* volume plot: */
  var scatter_volume = {
    'type': 'scatter',
    'mode': 'lines+markers',
    'x': x,
    'y': y,
    'hoverinfo': 'text',
    'hovertext': hover_text
  };
  var scatter_data = [scatter_volume];
  /* scatter plot layout: */
  var scatter_layout = {};
  /* scatter plot config: */
  var scatter_conf = {
    'showLink': false,
    'linkText': '',
    'displaylogo': false,
    'modeBarButtonsToRemove': [
      'autoScale2d',
      'lasso2d',
      'hoverClosestCartesian',
      'hoverCompareCartesian',
      'toggleSpikelines'
    ],
    'responsive': true
  };
  /* create the scatter plot: */
  var scatter_plot = Plotly.newPlot(
    volume_plot_div, scatter_data, scatter_layout, scatter_conf
  );
};

/* function to load depth data: */
async function load_depth_data() {
  /* get data: */
  await fetch(
    data_depth,
    {'cache': 'no-cache'}
  ).then(async function(data_req) {
    page_data['depth'] = await data_req.json();
  });
  /* get data for first data id: */
  var data_id = page_data['depth']['data_ids'][0];
  var data = page_data['depth']['data'][data_id];
  /* get x, y, and z data: */
  var x = data['grid_lon'];
  var y = data['grid_lat'];
  var z = data['grid_depth'];
  /* draw the depth plot: */
  depth_plot(x, y, z);
};

/* function to draw depth plot: */
function depth_plot(x, y, z) {
  /* 3d depth plot: */
  var surface_depth = {
    'type': 'surface',
    'x': x,
    'y': y,
    'z': z,
    'surfacecolor': 'Blues',
    'colorscale': 'Blues'
  };
  /* plot data, in order of plotting: */
  var surf_data = [surface_depth];
  /* surface plot layout: */
  var surf_layout = {};
  /* surface plot config: */
  var surf_conf = {
    'showLink': false,
    'linkText': '',
    'displaylogo': false,
    'modeBarButtonsToRemove': [
      'autoScale2d',
      'lasso2d',
      'hoverClosestCartesian',
      'hoverCompareCartesian',
      'toggleSpikelines'
    ],
    'responsive': true
  };
  /* create the surf plot: */
  var surf_plot = Plotly.newPlot(
    depth_plot_div, surf_data, surf_layout, surf_conf
  );
};

/* set up the page: */
function load_page() {
  load_lake_data();
  load_geometry_data();
  load_temperature_data();
  load_area_data();
  load_volume_data();
  load_depth_data();
}

/** add listeners: **/

/* on page load: */
window.addEventListener('load', function() {
  /* set up the page ... : */
  load_page();
});
