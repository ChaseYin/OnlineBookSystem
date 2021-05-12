var mongoose = require('mongoose');
var servicesSchema = require('../schemas/services');
var passportLocalMongoose = require("passport-local-mongoose");

servicesSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('Service',servicesSchema);