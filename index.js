var engine = require('embersengine');
var getGisMap = require('gisClient');
var cconv = require('cconv');
var ignToKml = require('ignMapToKml');
var path = require('path');
var pathToNGNS = require(path.join(__dirname, 'src', 'pathToNGNS'));

module.exports = function(ignitionPt, U, alpha, callback){

  var rows = 50;
  var cols = 50;

  var height = 2000;
  var width = 2000;

  var moisture = 5; //percentage 

  //compute boundaries in ETRS89 LAEA (srid 3035)
  //to pass to the postgis client 
  var boundaries = computeBoundaries(ignitionPt, rows, cols, height, width);
  function computeBoundaries(cA, rows, cols, height, width){

    var sridA = 4258;
    var sridB = 3035;

    var f = true;

    cB = cconv(sridA, sridB, cA, f);

    var W = cB[0] - width/2;
    var E = cB[0] + width/2;
    var N = cB[1] + height/2;
    var S = cB[1] - height/2;

    var boundaries = {
      north: N,
      south: S,
      east: E,
      west: W,
      r: rows,
      c: cols
    };

    return boundaries;
  }

  var clcMap;
  var aspectMap;
  var slopeMap;
  var ignMaps = new Array(3);

  getClcMap();

  function getClcMap(){

    getGisMap(boundaries, 'postgis', onClcMap);

    function onClcMap(map){

      clcMap = JSON.parse(map);

      getTerrainMap();
    }
  }

  function getTerrainMap(){
    getGisMap(boundaries, 'grass',onTerrainMap);

    function onTerrainMap(terrainMaps){

      terrainMaps = JSON.parse(terrainMaps);

      aspectMap = terrainMaps["aspect"];
      slopeMap = terrainMaps["slope"];

      computeIgnMaps();

    }
  }

  function computeIgnMaps(){


    //data Unit is [% moisture, Wind Speed in m/s, wind direction degrees clockwise from north]

    var dataUnit = [ moisture, U, alpha];

    ignMap = JSON.parse(Run(dataUnit));

    function Run(dataUnit){

      return engine(dataUnit, rows, cols, aspectMap, slopeMap, clcMap, height, width);
    }

    postProcessMaps();
  }

  function postProcessMaps(){


    var min30 = ignToKml(ignMap, 30, ignitionPt, rows, cols, height, width);
    var min60 = ignToKml(ignMap, 60, ignitionPt, rows, cols, height, width);
    var min120 = ignToKml(ignMap, 120, ignitionPt, rows, cols, height, width);

    var kmlMaps = {
      'min30': min30['kml'],
      'min60': min60['kml'],
      'min120': min120['kml']
    };

    var pathArrays = {
      'min30': min30['path'],
      'min60': min60['path'],
      'min120': min120['path']
    }

    callback(kmlMaps, pathToNGNS(pathArrays));
  }

}