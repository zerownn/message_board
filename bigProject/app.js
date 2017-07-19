var express=require('express');
var app=express();
var route=require('./controllers');
var session=require('express-session');
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));
app.set('view engine','ejs');//模板引擎
app.use(express.static('./public'));//静态页面
app.use("/avatar",express.static("./avatar"));//静态页面
app.get('/',route.showIndex);//首页
app.get('/register',route.showRegister);//注册页
app.get('/enter',route.showEnter);//登录页
app.get('/quit',route.showQuit);//退出
app.get('/form',route.showForm);//提交注册
app.get('/ring',route.showRing);//提交登录
app.get('/change',route.showChange);/*更换头像*/
app.post('/portrait',route.showPortrait);//上传头像
app.get('/cut',route.showCut);//剪裁头像页面
app.get("/doCut",route.doCut);//执行剪裁头像
app.get('/submit',route.showSubmit);//发表留言
app.get('/findByPage',route.findByPage);//分页
app.get('/findByUsername',route.findByUsername);//查找用户留言的头像
app.listen(3000);