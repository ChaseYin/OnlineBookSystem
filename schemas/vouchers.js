var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// 分类的表结构
module.exports =  new Schema({

    // 关联字段
    username:String,
    voucher_userTel:String,
    voucher_userName:String,
    voucher_type:String,
    voucher_delivery:String,
    voucher_date:Date,
    voucher_time:String,
    voucher_optionalInfo:String,
    voucher_location:String,
    voucher_accept:{
        type:Boolean,
        default:false
    }
});
