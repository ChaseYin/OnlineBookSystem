var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// 分类的表结构
module.exports =  new Schema({

    // 关联字段
    username: String,
    service_type:String,
    service_detail:String,
    service_available:{
        type:Boolean,
        default:true
    }
});
