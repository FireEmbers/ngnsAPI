//Test Case conditions
// 50x50 cells;
// 2x2 km;
// 5% moisture
// forecast for 2h

var embers = require('..');
var write2D = require('embersutils').write2D;
var path = require('path');

var embersToNGNS = require(path.join(__dirname, '../', 'src', 'pathToNGNS'));
var fs = require('fs');

var ignitionPt = //[ 41 + 47 / 60 + 6.39/3600,- (8 + 8/60 + 26.43/3600)];
[41.7718400422817, -7.9167833239285];

var U = 1;
var alpha= 135;
var std = 10;

embers(ignitionPt, U, alpha, function(kmlMaps, pathArrays){
  
  fs.writeFileSync(path.join(__dirname, 'kml' ,'min30.kml'), kmlMaps['min30'], {encoding: 'utf8'});
  fs.writeFileSync(path.join(__dirname, 'kml' ,'min60.kml'), kmlMaps['min60'], {encoding: 'utf8'});
  fs.writeFileSync(path.join(__dirname, 'kml' ,'min120.kml'), kmlMaps['min120'], {encoding: 'utf8'});

  writePathArray(path.join(__dirname, 'path' ,'min30.dat'), pathArrays['min30']);
  writePathArray(path.join(__dirname, 'path' ,'min60.dat'), pathArrays['min60']);
  writePathArray(path.join(__dirname, 'path' ,'min90.dat'), pathArrays['min120']);

  fs.writeFileSync (path.join(__dirname, 'path' ,'NGNSoutput.txt'), embersToNGNS(pathArrays), {encoding: 'utf8'});

});


function writePathArray(filename, array){

  var file = fs.createWriteStream(filename);
  file.on('error', function(err){ 
    return console.log('Error on writing path coordinates file')
  });
  array.forEach( function(v){
    file.write(v.join(',')+'\n');
  });
  file.end();
}





