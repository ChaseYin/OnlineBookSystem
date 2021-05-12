var mongoose = require('mongoose');
var billersSchema = require('../schemas/billers');
var passportLocalMongoose = require("passport-local-mongoose");

billersSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('Biller',billersSchema);