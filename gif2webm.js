var os = require('os');
var events = require('events');
var childProc = require('child_process');
var util = require('util');
var path = require('path');



/**
 * gif2webm constructor
 * @return {gif2webm} gif2webm constructor
 * @constructor
 */
var Gif2webm = function() {

  /**
   * gif2webm's EventEmitter
   * @type {events.EventEmitter}
   */
  events.EventEmitter.call(this);

  /**
   * 'identify' command and -format option.
   * @type {String}
   */
  this._identifyCmd = 'identify -format \'f=%m;c=%n;t=%A\' ';
  /**
   * 'convert' arguments to split gif|png into single frames
   * @type {String}
   */
  this._splitArgs = [];
  this._fileName = '';
  this._fileDir = '';
  this._fileExt = '';
  this._inPath = '';
  this._outputExt = '';
  return this;
};
util.inherits(Gif2webm, events.EventEmitter);


/**
 * Checks whether given file is a gif|png, animated and uses transparency.
 * Using ImageMagick's 'identify'.
 * @param  {!String} file Path to file to check.
 */
Gif2webm.prototype.identify = function(file) {

  file = '~/lsw.io/gif-to-webm/gifs/mcd/mcd.gif';

  this._inPath = file;
  this._fileDir = path.dirname(file);
  this._fileExt = path.extname(file);
  this._fileName = path.basename(file, this._fileExt);
  var execCmd = this._identifyCmd + file;
  var idProc = childProc.exec(execCmd);

  // 'identify' succeeded
  idProc.stdout.on('data', function(res) {

    var regX = /f=(GIF|PNG);c=([\d]*);t=(True|False)/;
    var match = res.match(regX);
    var frameCount = 0;
    var transparency = null;
    if (match && match.length) {
      this._outputExt = match[1].toLowerCase();
      frameCount = match[2];
      transparency = (match[3] === 'True') ? true : false;

      if (frameCount === '1') {
        return this.emit('error', 'This is no animation.');
      }

    } else {
      return this.emit('error',
          'Couldn\'t identify file. Is this really a GIF or PNG?');
    }

    return this.splitToFrames(frameCount, transparency);

  }.bind(this));

  // 'identify' failed
  idProc.stderr.on('data', function(err) {
    console.log(err.toString());
    return this.emit('error', 'Couldn\'t identify file. convert ERROR');
  }.bind(this));
};


/**
 * Splits animated GIF|PNG into frames.
 * Using ImageMagick's 'identify'.
 * @param  {!String} ext          Identified file extension.
 * @param  {!String} fCount       Number of frames in file.
 * @param  {Boolean} transparency Whether file uses transparency.
 */
Gif2webm.prototype.splitToFrames = function(fCount, transparency) {
  
  // add option to handle transparency
  // ImageMagick actually takes the first frame and adds it to
  // all subsequent ones. Otherwise 'avconv' would mess up badly.
  if (transparency) {
    this._splitArgs.push(' -coalesce');
  }

  var splitArgs = [' -coalesce' + ' ' + this._inPath + ' ' +
        this._fileName + '_frame_%0' + fCount.length + 'd.' + this._outputExt];

  console.log(splitArgs);

  var splitProc = childProc.spawn('convert', splitArgs);
  splitProc.stdout.on('data', function(res) {
    //console.log(res.toString());
  });
  splitProc.stderr.on('data', function(err) {
    console.log(err.toString());
  });

};

Gif2webm.prototype.method_name = function(first_argument) {
  // body...
};


/**
 * Expose constructor
 *
 * @public
 */
module.exports = Gif2webm;

var g2w = new Gif2webm();
g2w.on('error', function(err) {
  console.log('g2w error: ');
  console.log(err);
});
console.log(g2w);
g2w.identify();
