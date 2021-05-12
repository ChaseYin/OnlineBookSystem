var mongoose = require('mongoose');
var vouchersSchema = require('../schemas/vouchers');
var passportLocalMongoose = require("passport-local-mongoose");

vouchersSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('Voucher',vouchersSchema);