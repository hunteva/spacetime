'use strict'
const quickOffset = require('./timezone/quick')
const findTz = require('./timezone/find')
const handleInput = require('./input')
const methods = require('./methods')
let timezones = require('../zonefile/unpack')

//fake timezone-support, for fakers (es5 class)
const SpaceTime = function(input, tz, options) {
  options = options || {}
  //the holy moment
  this.epoch = null
  //the shift for the given timezone
  this.tz = findTz(tz, timezones)
  //whether to output warnings to console
  this.silent = options.silent || true
  //add getter/setters
  Object.defineProperty(this, 'd', {
    //return a js date object
    get: function() {
      let offset = quickOffset(this)
      //every computer is somewhere- get this computer's built-in offset
      let bias = new Date(this.epoch).getTimezoneOffset() || 0
      //movement
      let shift = bias + (offset * 60) //in minutes
      shift = shift * 60 * 1000 //in ms
      //remove this computer's offset
      let epoch = this.epoch + shift
      let d = new Date(epoch)
      return d
    }
  })
  //add this data on the object, to allow adding new timezones
  Object.defineProperty(this, 'timezones', {
    get: function() {
      return timezones
    },
    set: function(obj) {
      timezones = obj
      return obj
    }
  })
  //parse the various formats
  if (input !== undefined || input === null) {
    let tmp = handleInput(this, input, tz, options)
    this.epoch = tmp.epoch
  }
}

//(add instance methods to prototype)
Object.keys(methods).forEach(k => {
  SpaceTime.prototype[k] = methods[k]
})

// ¯\_(ツ)_/¯
SpaceTime.prototype.clone = function() {
  return new SpaceTime(this.epoch, this.tz, {
    silent: this.silent
  })
}

//append more methods
require('./methods/query')(SpaceTime)
require('./methods/add')(SpaceTime)
require('./methods/same')(SpaceTime)
require('./methods/compare')(SpaceTime)
require('./methods/i18n')(SpaceTime)

module.exports = SpaceTime
