var express = require('express');
var router = express.Router();
const request = require('request')
var Category = require('../models/Category');
var User = require("../models/User");
var Biller = require("../models/Biller");
var Service = require("../models/Service");
var Voucher = require("../models/Voucher");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");
var bcrypt = require('bcrypt');
var ejs = require('ejs')
var token = '';
var googleName = '';
var userID = '';
var billerId = 1;

var userName = '';
var Name = '';
var telephoneNumber = '';
var serviceLocation = ''


router.use(function(req,res,next){

  console.log('usersssssssss:'+req.userInfo._id)
  User.findOne({
    _id:req.userInfo._id
  }).then(userInfo => {
    if(!userInfo)
    {
      console.log('找不到此用户')
    }
    else{
     
      userName = userInfo.username
      Name = userInfo.name
      telephoneNumber = userInfo.tel
      console.log('userName是:'+userInfo.username)
      console.log('Name是:'+userInfo.name)
      console.log('telephoneNumber是:'+userInfo.tel)
    }


  
})

  
  // console.log('userInfo 包含:'+toString(req.userInfo))
  next();
})

var responseData;
router.use(function(req,res,next){
    responseData = {
        code:0,
        message:''
    }
    next();
})
var resData;
router.use(function(req,res,next){
  resData = {
      code:0,
      message:''
  }
  next();
})


const passport = require('passport');
const cors = require('cors')
const bodyParser = require('body-parser');
const { userInfo } = require('os');
const { stringify } = require('querystring');
require('./passport-setup')

router.use(cors())
router.use(bodyParser.urlencoded({extended: false}))
router.use(bodyParser.json())

router.get('/',function(req,res,next){
    // 读取所有的分类信息
    // Category.find().sort({_id:-1}).then((categories)=>{
    //     console.log(categories);
    // var googleName = req.body.username;
    // console.log("主页获得的googleName 是："+googleName);
        res.render('main/index',{
            userInfo:req.userInfo
            // categories:categories
        })
    // })
})

router.post('/google/return',function(req,res){
  // 读取所有的分类信息
  // Category.find().sort({_id:-1}).then((categories)=>{
  //     console.log(categories);
  resData.userInfo = {
    username: req.body.username,
    _id: req.body._id
  }
  console.log('resData是：'+resData)
  userInfo.username = googleName;
  // userInfo._id = 123;

  console.log("Post请求获得的google用户名是"+userInfo.username)
      //  res.render('main/index',{userInfo})
      // res.json(userInfo)
  // })
})



const isLoggedIn = (req, res, next) => {
    if(req.user){
        next();
    }
    else{
        res.sendStatus(401);
    }
}



router.get('/good', isLoggedIn, (req, res)=> {
  googleName = req.user.displayName;
  var userInfo={}
  console.log("google的用户名是：  "+googleName)
    //res.send(`Welcome to my application Mr ${req.user.displayName}!`)
    //console.log('userinfo 包含： ====='+req.user.username)
    responseData.message = 'Login Successfully!';
                    responseData.userInfo = {
                    username:googleName
                };  
                // res.json(responseData);
                // console.log(responseData);
                res.render('main/googleLoggedIn',{googleName:googleName});
})

router.get('/googleConsole', (req, res)=> {
                res.render('main/googleConsole',{googleName:googleName});
})



router.get('/failed', (req, res)=> res.send('Your authentation has been failed!'))

router.get('/google',passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/logout',(req,res) =>{
    req.session = null;
    req.logout();
    res.redirect('/')
})

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/failed' }),//authenticate failed!
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/good');
  });

  //forgot password here:

  router.get('/forgot', function(req, res) {
    res.render('main/forgot');
  });
  

  router.post('/forgot', function(req, res, next) {
    async.waterfall([
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done) {
        User.findOne({ username: req.body.email }, function(err, user) {
          if (!user) {
            //req.flash('error', 'No account with that email address exists.');
            return res.redirect('/forgot');
          }
  
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  
          user.save(function(err) {
            done(err, token, user);
          });
        });
      },
      function(token, user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: 'Gmail', 
          auth: {
            user: 'yinxiaof993@gmail.com',
            pass: 'yinxiaofeng0206'
          }
        });
        var mailOptions = {
          to: user.username,
          from: 'yinxiaof993993@gmail.com',
          subject: 'Node.js Password Reset By Xiaofeng Yin',
          text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + req.headers.host + '/reset/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          console.log('mail sent');
          res.redirect('/sentEmail')
          // res.render('main/sentEmail')
          // req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
          done(err, 'done');
        });
      }

    ], function(err) {
      if (err) 
      return next(err);
      res.redirect('/forgot');
    });
  });
  
  router.get('/sentEmail',function(req, res) {
    res.render('main/sentEmail')
  })

  router.get('/reset/:token', function(req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
      if (!user) {
        console.log('Password reset token is invalid or has expired.');
        return res.redirect('/forgot');
      }
      
      res.render('main/reset', {token: req.params.token});
    });
    //console.log("get重制密码页面成功！！")
  });

  // router.post('/reset',function(req, res){
  //   console.log(req.body)
  //   // let token = req.body.token
  //   console.log('token='+token)
  // })

  router.post('/reset', function(req, res) {
    //console.log('现在进入post方法！！！！：')
    async.waterfall([
      function(done) {
        //console.log('token是！！！：'+token)
        console.log('请求的密码是'+req.body.password)
        User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
          if (!user) {
            //req.flash('error', 'Password reset token is invalid or has expired.');
            //
            console.log("Password reset token is invalid or has expired.[2]");
            return res.redirect('back');
          }
          if(req.body.password === req.body.confirm) {
            user.setPassword(req.body.password, function(err) {
              user.resetPasswordToken = undefined;
              user.resetPasswordExpires = undefined;
              const saltRounds = 10;
              var password = req.body.password;
              var hashPassword = req.body.password;
              bcrypt.genSalt(saltRounds,function(err,salt){
                  bcrypt.hash(password,salt,function(err,hash){
                       hashPassword = hash;
                      // password = hash;
                      // repassword = hash;
                      storeUserData();
                  })
              })
              function storeUserData(){
                  //console.log('hashpassword是：'+hashPassword)
                  user.password = hashPassword
                  
                  //console.log("新的用户密码是"+user.password)
                  user.save();
                  console.log("Successfully changed password")
                  done(err, user);
              }
              
             //这里需要设置hash密码
            //   user.save(function(err) {
            //       if(err){console.log('没有设置成功')}
            //     req.logIn(user, function(err) {
            //       done(err, user);
            //     });
            //   });
            })
          } else {
              //req.flash("error", "Passwords do not match.");
              console.log('Password do not match')
              return res.redirect('back');
          }
        });
      },
      function(user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: 'Gmail', 
          auth: {
            user: 'yinxiaof993@gmail.com',
            pass: 'yinxiaofeng0206'
          }
        });
        var mailOptions = {
          to: user.username,
          from: 'yxfchase@gmail.com',
          subject: 'Your password has been changed',
          text: 'Hello,\n\n' +
            'This is a confirmation that the password for your account ' + user.username + ' has just been changed.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          //req.flash('success', 'Success! Your password has been changed.');
          done(err);
        });
      }
    ], function(err) {
      res.redirect('/changePassword');
    });
  });

  router.get('/changePassword',function(req,res,next){
    res.render('main/changePassword',{});
    //console.log('收获请求');
});
  router.get('/sentEmail',function(req,res,next){
    res.render('main/sentEmail',{});
    //console.log('收获请求');
});


router.get('/about',function(req,res,next){
    res.render('main/about',{});
    //console.log('收获请求');
});




router.get('/addBiller', function(req, res) {
  res.render('main/addBiller');
});

router.get('/manageUserInfo', function(req, res) {
  res.render('main/manageUserInfo');
  console.log('req是：'+req.userInfo._id)

});

router.post('/manageUserInfo', function(req, res, next) {
  console.log('post需要修改的用户名是：'+req.userInfo.username)
  console.log('收到的输入信息为：'+req.body.username)
  // username = req.userInfo.username
  // console.log('userID是：'+username)
  User.findOne({
    username:req.userInfo.username
}).then((userInfo)=>{
    if(userInfo){
      
      userInfo.setPassword(req.body.password, function(err) {
        userInfo.resetPasswordToken = undefined;
        userInfo.resetPasswordExpires = undefined;
        const saltRounds = 10;
        var password = req.body.password;
        var hashPassword = req.body.password;
        bcrypt.genSalt(saltRounds,function(err,salt){
            bcrypt.hash(password,salt,function(err,hash){
                 hashPassword = hash;
                // password = hash;
                // repassword = hash;
                storeUserData();
            })
        })
        function storeUserData(){
            //console.log('hashpassword是：'+hashPassword)
            userInfo.username = req.body.username;
            userInfo.name = req.body.name;
            userInfo.tel = req.body.telephone
            userInfo.password = hashPassword
            
            //console.log("新的用户密码是"+user.password)
            userInfo.save();
            console.log("Successfully changed password")
            // done(err, user);
        }
      })
      userInfo.save()
        console.log('找到了用户')
        res.redirect('/');
        return;
    }else{
      console.log('找不到用户')
      res.redirect('/');
    }
})

});


router.post('/addBiller', function(req, res, next) {
  console.log('post需要修改的用户名是：'+req.userInfo.username)
  console.log('收到的输入信息为：'+req.body.username)
  // billerId = billerId + 1
  var biller = new Biller({
    // biller_id : billerId + 1,
    username:req.userInfo.username,
    biller_name:req.body.billerName,
    biller_email:req.body.billerEmail
  });
 biller.save().then()
   res.redirect('/');
 


});

router.get('/updateBiller', function(req, res) {
  res.render('main/updateBiller');
});

router.get('/checkBiller', function(req, res) {
  console.log('收到checkbiller请求')
  Biller.find({
    'username': req.userInfo.username
}, function(err, docs){
     res.json(docs)
});

});

router.get('/updateBiller/:id', function(req, res) {
  
  var id = req.params.id;
  var username, billerName, billerEmail;
  console.log('获得的id是:'+id);
  


  Biller.findOne({
    _id:id
  }).then(billInfo => {
    if(!billInfo)
    {
      console.log('找不到biller')
    }
    else{
      console.log('找到biller了！')
      username = billInfo.username
      billerName = billInfo.biller_name
      billerEmail = billInfo.biller_email
    }
    res.render('main/updateOneBiller',{
      id:id,
      username:username,
      billerName:billerName,
      billerEmail:billerEmail
     
  })
})

 

});

router.post('/updateOneBiller', function(req, res) {
  var doc = JSON.stringify(req.body)
  console.log('收到请求1'+doc)  
  console.log('收到请求'+req.body.id)  
  // console.log('收到请求'+req.body.color)  

  Biller.findOne({
    _id:req.body.billerId
  }).then(billerInfo => {
    if(!billerInfo)
    {
      console.log('找不到需要更新的biller')
    }
    else{
      console.log('找到了需要更新的biller')
      billerInfo.biller_name = req.body.billerName
      billerInfo.biller_email = req.body.billerEmail
      billerInfo.save()
    }
    
  })
});


router.get('/manageService', function(req, res) {
  res.render('main/manageService');
});

router.post('/addService', function(req, res) {



  console.log('post需要修改的用户名是：'+req.body.serviceType)
  console.log('收到的输入信息为：'+req.body.serviceDetail)
  // billerId = billerId + 1
  var service = new Service({
    username: userInfo.username,
    // biller_id : billerId + 1,
    service_type:req.body.serviceType,
    service_detail:req.body.serviceDetail
  });
 service.save().then()
   res.redirect('/checkAllService');



});

router.get('/bookVoucher', function(req, res) {
  res.render('main/bookVoucher');
});

router.get('/checkService', function(req, res) {
  console.log('收到checkService请求')
  Service.find({
    'service_available' : true
}, function(err, docs){
     res.json(docs)
});

});

router.get('/applyService/:type', function(req, res) {

  
  var type = req.params.type;

  Service.findOne({
    service_type:type
  }).then(serviceInfo => {
    if(!serviceInfo)
    {
      console.log('找不到service')
    }
    else{
      console.log('找到了service！！！！！！！！！！！')
      serviceLocation = serviceInfo.service_detail
    }
    
  })
  
  console.log('要申请的服务是:'+type);

  res.render('main/applyService',{

    userId:req.userInfo._id,
    username:req.userInfo.username,
    name:req.userInfo.name,
    serviceType:type
  
   
})

  
});

router.post('/applyService', function(req, res) {
  var doc = JSON.stringify(req.body)
  console.log('收到请求1'+doc)  
  console.log('收到请求'+req.body.userId)  
  
  
  
  var voucher = new Voucher({
    // biller_id : billerId + 1,
    username:userName,
    voucher_userTel: telephoneNumber,
    voucher_userName: Name,
    voucher_type: req.body.serviceType,
    voucher_delivery: req.body.deliveryType,
    voucher_date: req.body.serviceDate,
    voucher_time: req.body.serviceTime,
    voucher_optionalInfo: req.body.optionalMessage,
    voucher_location: serviceLocation,
    voucher_accept: false

  });
  voucher.save().then()
  sendEmail()
 
  function sendEmail(){
    var smtpTransport = nodemailer.createTransport({
      service: 'Gmail', 
      auth: {
        user: 'yinxiaof993@gmail.com',
        pass: 'yinxiaofeng0206'
      }
    });
    var mailOptions = {
      to: '1456245356@qq.com',
      from: 'yinxiaof993@gmail.com',
      subject: Name + '  has applied a ' +  '[ ' + req.body.serviceType + ' ]'+ ' voucher just now',
      text: 'Customer name: ' + Name + '\n\n' +
            'Customer telephone: ' + telephoneNumber + '\n\n' +
            'Customer email: ' + userName + '\n\n' + 
            'Voucher Date: ' + req.body.serviceDate + '\n\n' + 
            'Voucher Time: ' + req.body.serviceTime + '\n\n' +
            'Voucher Delivery: ' + req.body.deliveryType + '\n\n' +
            'Optional message: ' + req.body.optionalMessage + '\n\n' +

        'This is a confirmation that someone has applied this service\n'
    };
    smtpTransport.sendMail(mailOptions, function(err) {
      //req.flash('success', 'Success! Your password has been changed.
    });

  }

   res.redirect('/');





});


router.get('/manageApplication', function(req, res) {
  res.render('main/manageApplication');
});

router.get('/checkVoucher', function(req, res) {
  console.log('收到checkService请求')
  Voucher.find({
    'voucher_accept' : false
}, function(err, docs){
     res.json(docs)
});

});

router.get('/checkIndividualVoucher', function(req, res) {
  console.log('收到个人的checkService请求')
  Voucher.find({
    'username' : userName
}, function(err, docs){
     res.json(docs)
});

});


router.get('/acceptVoucher/:id', function(req, res) {

  var voucherId = req.params.id;
  var location = ''



  Voucher.findOne({
    _id:voucherId
  }).then(voucherInfo => {
    if(!voucherInfo)
    {
      console.log('找不到需要接受的voucher')
    }
    else{
      console.log('找到了需要接受的voucher')
      voucherInfo.voucher_accept = true;
      voucherInfo.save()
      sendEmail()
      function sendEmail(){
        Service.findOne({
          service_type: voucherInfo.voucher_type
        }).then(serviceInfo => {
          if(!serviceInfo)
          {
              console.log('没有找到这个service')
          }
          else{
            location = serviceInfo.service_detail
          }
        })

        var smtpTransport = nodemailer.createTransport({
          service: 'Gmail', 
          auth: {
            user: 'yinxiaof993@gmail.com',
            pass: 'yinxiaofeng0206'
          }
        });
        var mailOptions = {
          to: voucherInfo.username,
          from: 'yinxiaof993@gmail.com',
          subject: 'Your application of ' +  '[ ' + voucherInfo.voucher_type + ' ]'+ ' has been approved just now',
          text: 'Customer name: ' + voucherInfo.voucher_userName + '\n\n' +
                'Customer telephone: ' + voucherInfo.voucher_userTel + '\n\n' +
                'Customer email: ' + voucherInfo.username + '\n\n' + 
                'Voucher Date: ' + voucherInfo.voucher_date + '\n\n' + 
                'Voucher Time: ' + voucherInfo.voucher_time + '\n\n' +
                'Voucher Delivery: ' + voucherInfo.voucher_delivery + '\n\n' +
                'Voucher Location: ' + voucherInfo.voucher_location + '\n\n' +
                'Optional message: ' + voucherInfo.voucher_optionalInfo + '\n\n' +
    
            'This is a confirmation that someone has applied this service\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          //req.flash('success', 'Success! Your password has been changed.
        });
    
      }
     
    }
  })

  
  


  res.render('main/manageApplication');
});


router.get('/cancelVoucher', function(req, res) {
  res.render('main/cancelVoucher');
});


router.get('/cancelVoucher/:id', function(req, res) {

  var voucherId = req.params.id;
  var location = ''



  Voucher.findOne({
    _id:voucherId
  }).then(voucherInfo => {
    if(!voucherInfo)
    {
      console.log('找不到需要拒绝的voucher')
    }
    else{
      console.log('找到了需要拒绝的voucher')
      voucherInfo.remove()
      sendEmail()
      function sendEmail(){
        var smtpTransport = nodemailer.createTransport({
          service: 'Gmail', 
          auth: {
            user: 'yinxiaof993@gmail.com',
            pass: 'yinxiaofeng0206'
          }
        });
        var mailOptions = {
          to: '1456245356@qq.com',
          from: 'yinxiaof993@gmail.com',
          subject: voucherInfo.voucher_userName + ' canceled his/her ' +  '[ ' + voucherInfo.voucher_type + ' ]'+ ' just now',
          text: 'Customer name: ' + voucherInfo.voucher_userName + '\n\n' +
                'Customer telephone: ' + voucherInfo.voucher_userTel + '\n\n' +
                'Customer email: ' + voucherInfo.username + '\n\n' + 
                'Voucher Date: ' + voucherInfo.voucher_date + '\n\n' + 
                'Voucher Time: ' + voucherInfo.voucher_time + '\n\n' +
                'Voucher Delivery: ' + voucherInfo.voucher_delivery + '\n\n' +
                'Voucher Location: ' + voucherInfo.voucher_location + '\n\n' +
                'Optional message: ' + voucherInfo.voucher_optionalInfo + '\n\n' +
    
            'This is a confirmation that' + voucherInfo.voucher_userName + ' have canceled his/her voucher\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          //req.flash('success', 'Success! Your password has been changed.
        });
    
      }
     
    }
  })

  
  


  res.render('main/manageApplication');
});

router.get('/checkAllService', function(req, res) {
  res.render('main/checkAllService');
});


module.exports = router;