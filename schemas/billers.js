var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// 分类的表结构
module.exports =  new Schema({
    // 关联字段
    // biller_id:Number,
    username:String,
    biller_name:String,
    biller_email:String
});
