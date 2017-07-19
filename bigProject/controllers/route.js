var formidable = require('formidable');
var db = require('../modules/db.js');
var md5 = require('../modules/md5.js');
var fs = require('fs');
var gm = require("gm");
var ObjectId = require('mongodb').ObjectID;//将字符串类型转换为对象
var sd = require('silly-datetime');
/*√显示首页*/
exports.showIndex=function(req,res,next){
    //检索数据库，查找此人的头像
    if (req.session.login == "1") {//如果登陆了
        var username = req.session.username;
        var login = true;
    } else {//没有登陆
        var username = "";  //制定一个空用户名
        var login = false;
    }
    //查找登录后用户的头像
    db.find('register',{'use':username},function(err,data){
        if(data.length==0){
            var avatar='moren.jpg';
        }else{
            var avatar=data[0].avatar;
        }
        db.findAllCount('leave',function(count){
            count=Math.ceil(count/6);
            res.render('index',{
                'count':count,
                'login':login,
                'username':username,
                'active':'index',//页面对应的按钮
                'avatar':avatar//用户头像
            });
        });
    });
};
/*√显示注册页面*/
exports.showRegister=function(req,res){
    res.render('register',{
        "login":req.session.login=="1"?true:false,
        "username": req.session.login == "1" ? req.session.username : "",
        "active":"register"
    });
};
/*√显示登录页面*/
exports.showEnter=function(req,res){
    res.render('login',{
        "login":req.session.login=="1"?true:false,
        "username": req.session.login == "1" ? req.session.username : "",
        "active":"enter"
    });
};
/*√退出*/
exports.showQuit=function(req,res){
    req.session.login = false;
    req.session.active = "index";
    res.redirect("/");
};
/*√注册信息提交*/
exports.showForm=function(req,res,next){
    var use = req.query.user;
    var pwd = req.query.pwd;
    pwd = md5(pwd);
    /*入库 检查用户名是否存在*/
    db.find('register',{'use':use},function(err,data){
        if(err){res.send('-3');return;}
        if (data.length != 0){res.send("-1");return;}//用户名被占用
        db.insertOne('register',{"use":use,'pwd':pwd,"avatar":"moren.jpg"},function(err,data){
            if(err){res.send('-3');return;}
            req.session.login='1';
            req.session.username=use;
            res.send('1');
        })
    })
};
/*√登录信息提交*/
exports.showRing=function(req,res,next){
  var use=req.query.user;
  var pwd=md5(req.query.password);
    db.find('register',{'use':use},function(err,data){
       if(err){res.send('-3');return;}
       if(data.length==0){res.send('-1');return;}//用户名不存在
        if(data[0].pwd==pwd){
            //登录成功 绑定登录的对象和状态
            req.session.login="1";
            req.session.username = use;
            res.send("1");  //登陆成功
            return;
        }else{
            res.send("-2");//密码错误
            return;
        }
    });
};
/*√更换头像-跳转截图页面*/
exports.showChange=function(req,res){
    if (req.session.login != "1") {
        res.send("非法闯入，这个页面要求登陆！");
        return;
    }
  res.render('change',{
      'login':true,
      'username':req.session.username || "wl",
      'active':''
  });
};
/*上传图片*/
exports.showPortrait=function(req,res,next){
    if (req.session.login!= "1") {
        res.end("非法闯入，这个页面要求登陆！");
        return;
    }
    //接受表单提交的图片
    var form = new formidable.IncomingForm();
    // form.uploadDir = path.normalize(__dirname + "/../avatar");//绝对路径
    form.uploadDir="./avatar";
    form.parse(req, function (err, fields, files){
        var oldpath = files.avatar.path;
        var newpath = "./avatar/" + req.session.username + ".jpg";
        fs.rename(oldpath, newpath, function (err) {
            if (err) {res.send("失败");return;}
            req.session.avatar = req.session.username + ".jpg";
            //跳转到切的业务
            res.render("cut",{
                avatar: req.session.avatar
            });
        });
    });
};
//剪裁头像 必须是登录状态
exports.showCut=function(req,res,next){
    //必须保证登陆
    if (req.session.login != "1") {
        res.end("非法闯入，这个页面要求登陆！");
        return;
    }
    res.render("cut", {
        avatar: req.session.avatar
    })
};
//执行剪裁头像 ,必须是登录状态
exports.doCut=function(req,res,next){
    if (req.session.login != "1") {
        res.end("非法闯入，这个页面要求登陆！");
        return;
    }
    //这个页面接收几个GET请求参数
    //w、h、x、y
    var filename = req.session.avatar;
    var w = req.query.width;
    var h = req.query.height;
    var x = req.query.left;
    var y = req.query.top;
    // console.log("w",w);
    gm("./avatar/" + filename)
        .crop(w, h, x, y)
        .resize(100, 100, "!")
        .write("./avatar/" + filename, function (err) {
            if (err) {
                console.log(err);
                res.send("-1");
                return;
            }
            //更改数据库当前用户的avatar这个值
            db.updateMany("register", {"use": req.session.username}, {
                $set: {"avatar": req.session.avatar}
            }, function (err, results) {
                res.send("1");
            });
        });
};
//√留言板提交
exports.showSubmit=function(req,res) {
    var time = sd.format(new Date, " YYYY-MM-DD HH:mm:ss");
    var name = req.query.name;
    var message = req.query.message;
    db.find('register',{'use':name},function(err,data){//根据名字查找头像
         if(err){return;}
         if(data.length!=0){
            var avatar=data[0].avatar;
         }
         db.insertOne('leave',{'use':name,'message':message,'time':time},function(err,result){
         if(err){return;}
            res.send(result);
            return;
         });
    });
};
/*分页*/
exports.findByPage=function(req,res){
    /*获取页面传入的页码 转成数字*/
    var page=parseInt(req.query.page);
    db.find('leave',{},{'pageSize':6,'page':page,'sort':{'time':1}},function(err,result){
        if(err){return;}
        res.send(result);
    });
};
/*分页->查找用户头像*/
exports.findByUsername=function(req,res){
    var use=req.query.use;
    var content='';
    db.find('register',{'use':use},function(err,data){
        for(var i=0;i<data.length;i++){
            if(use==data[i].use){
                content=data[i].avatar;//拿到头像
            }
        }
        res.send(content);
        return;
    });
};