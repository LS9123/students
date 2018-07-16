const express = require('express');    //导入express模块
const path = require('path')
const svgCaptcha = require('svg-captcha')
const bodyParser = require('body-parser')
const session = require('express-session')
// 导入mongodb模块 npm 
const MongoClient = require('mongodb').MongoClient;
// mongodb://localhost:27017  --- 数据库地址
const url = 'mongodb://localhost:27017';

let app = express();    //调用方法创建服务器
app.use(express.static('static'));    //静态资源托管 光标定位 填写静态资源文件件相对路径
// 使用express-session中间件 开启session
app.use(session({
    secret: 'keyboard cat',
  }))
// 使用body-parser中间件 解析form表单传递过来的数据
app.use(bodyParser.urlencoded({ extended: false }))
// 将传递过的数据解析为对象
app.use(bodyParser.json())
// 路由1
//get请求
app.get( '/login' ,  (req, res)=> {    //必须是,满足是get请求,且访问的是/path这个路径才会进入函数内部

    res.sendFile(path.join(__dirname,'static/views/login.html')   );
 
})
// 路由2
//post请求
app.post('/login',(req,res)=>{  //必须是,满足是post请求,且访问的是/path这个路径才会进入函数内部
    // console.log(req.body)
    let userName = req.body.userName
    let password = req.body.password
    let code = req.body.code.toLocaleLowerCase()
    if(code == req.session.captcha){
        
        MongoClient.connect(url, function (err, client) {

            // test-使用库的名字
            const db = client.db('test');
            // 链接到集合 hero-使用集合的名字
            const collection = db.collection('hero');
            // 精确查找 find({key:val,key1:val1,...}) 不给对象就是找全部
            collection.find({userName,password}).toArray((err, docs) => {
                if(err) console.log(err);
                if(docs.length){  
                    req.session.userInfo = {
                        userName,
                        password
                    }           
                    res.redirect('/index')               
                }else{
                    res.setHeader('content-type','text/html')
                    res.send("<script>alert('用户名或密码不正确');window.location='/login';</script>")
                }
            });
        });
    }else{
        res.setHeader('content-type','text/html')
        res.send("<script>alert('验证码不正确');window.location='/login';</script>")
    }
})
// 路由3
//get请求
app.get( '/login/captchaImg' ,  (req, res)=> {    //必须是,满足是get请求,且访问的是/path这个路径才会进入函数内部

    var captcha = svgCaptcha.create();
    req.session.captcha = captcha.text.toLocaleLowerCase();
    // console.log(captcha.text,captcha.data);
    res.type('svg');
    res.status(200).send(captcha.data);
 
})
// 路由4
//get请求
app.get( '/index' ,  (req, res)=> {    //必须是,满足是get请求,且访问的是/path这个路径才会进入函数内部
    if(req.session.userInfo){
        res.sendFile(path.join(__dirname,'static/views/index.html')  );
    }else{
        res.setHeader('content-type','text/html')
        res.send("<script>alert('请先登入');window.location='/login';</script>")
    }
})
// 路由5
//get请求
app.get( '/logout' ,  (req, res)=> {    //必须是,满足是get请求,且访问的是/path这个路径才会进入函数内部
    delete req.session.userInfo
    res.redirect('/login')
})
// 路由6
//post请求
app.get('/register',(req,res)=>{  //必须是,满足是post请求,且访问的是/path这个路径才会进入函数内部
    res.sendFile(path.join(__dirname,'static/views/register.html'))
})
// 路由7
//post请求
app.post('/register',(req,res)=>{  //必须是,满足是post请求,且访问的是/path这个路径才会进入函数内部
    let userName = req.body.userName
    let password = req.body.password
    // 创建链接
    MongoClient.connect(url, function (err, client) {

        // test-使用库的名字
        const db = client.db('test');
        // 链接到集合 hero-使用集合的名字
        const collection = db.collection('hero');
        // 精确查找 find({key:val,key1:val1,...}) 不给对象就是找全部
        collection.find({userName}).toArray((err, docs) => {
            if(err) console.log(err);
            if(!docs.length){
                collection.insertOne({
                    userName,
                    password
                }, (err, result) => {
                    console.log(result)
                    // 关闭链接
                    client.close();
                    res.redirect('/login')
                });
            }else{
                res.setHeader('content-type','text/html')
                res.send("<script>alert('用户名已存在');window.location='/login';</script>")
            }
        });

    });
})
app.listen(80,'127.0.0.1',()=>{console.log('success')});    //监听127.0.0.1:80


