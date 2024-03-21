var express = require('express');
var bodyparser = require('body-parser');
var app = express();
var mongoose = require('mongoose');
var session = require('express-session');
var redis = require('redis');
var redisStore = require('connect-redis')(session);
var client  = redis.createClient();

var flag=true; //inital assumption
app.use(session({
    secret: 'shhhhh',
    store: new redisStore({ host: 'localhost', port: 7889, client: client,ttl : 260}),
    saveUninitialized: false,
    resave: false
  }));


mongoose.connect("mongodb+srv://test:test1234@todo-qqfes.mongodb.net/test?retryWrites=true&w=majority", { useUnifiedTopology: true, useNewUrlParser: true });

app.use(express.urlencoded({
    extended:true
}));
app.use(express.json());

var a;

  const WorkerSchema = new mongoose.Schema({
    worker_id: {
      type: String,
      default: "0",
      
    },
    worker_name: {
      type: String,
      required: true
    },
    worker_pwd: {
      type: String,
      required: true
    },
    worker_mail: {
      type: String
    }
  });

  const MachineSchema = new mongoose.Schema({
    machine_id: {
      type: String,
      default: "0",
      required: true
    },
    machine_type: {
      type: String
    },
    machine_lat: {
      type: String,
      required: true
    },
    machine_lon: {
      type: String,
      required: true
    },
    machine_status: {
      type: Boolean,
      default: true
    },
    machine_problem: {
      type: String
    }
  });

  const WorkSchema = new mongoose.Schema({
    worker_mail: {
      type: String,
      default: "0",
      required: true
    },
    machine_id: {
      type: String,
      default: "0",
      required: true
    },
    work_status: {
      type: String,
      default: "None"
    },
    worker_location:{
      type:[Object],
      default:[]
  },
  time:{
      type:[Date],
      default:[]
  },
  options:{
    type:[String],
    default:[]
  }
  });

  var worker=mongoose.model('WorkerSchema',WorkerSchema);
  var machine=mongoose.model('MachineSchema',MachineSchema);
  var work=mongoose.model('WorkSchema',WorkSchema);
  
  //work({worker_mail:"rajesh@gmail.com",machine_id:"2",work_status:"fault"}).save();

var urlencodedParser = bodyparser.urlencoded({ extended: false });

app.use('/assets',express.static('./public/assets'));

app.get('/choice',function(req,res){
    res.render('choice');
});

app.get('/signin',function(req,res){
    res.render('signin');
});

app.post('/signin',async function(req,res){
  var w= await worker.find(req.body);
  if(w){
       req.session.key=req.body.worker_mail;
      // req.session.flag=false;
      res.render('login');
  }else{
      console.log("invalid");
  }
});

app.get('/plot',function(req,res){
  work.find({},function(err,data){
    var r = {wrenchtime:0,authorizedbreaks:0,personaltime:0,toolsmaterials:0,receivinginstr:0};
    for(var i=0;i<data.length;i++){
      for(var j=0;j<data[i].time.length-1;j=j+2){
        var g = data[i].options[j];
        const diffTime = Math.abs(data[i].time[j+1] - data[i].time[j]);
        console.log(diffTime);
        // console.log(data[i].time[j]);
        if(g!=undefined)
        r[g]+=diffTime;
      }
    }
    var b = [];
    b.push(['options','timespent']);
    for(var key in r) { 
        b.push([ key ,r[key]]);
    }
    res.render('plot',{d:b});
  });
});

app.get('/signup',function(req,res){
    res.render('signup');
});

app.post('/signup',async function(req,res){
    console.log(req.body);
    await worker(req.body).save();
    res.render('signin');
});

app.get('/',function(req,res){
    res.render('index');
});


app.get('/login',function(req,res){
    if(a===undefined){
        a=[];
    }
    res.render('login');
});

app.get('/show',function(req,res){
    if(a===undefined){
        a=[];
    }
    console.log(a);
    res.render('sample',{d:a,f:flag});
});


app.get('/option',function(req,res){
    res.render('options');
});

app.get('/time',async function(req,res){
  
  flag=~flag;
  var d=new Date();
  var w=await work.findOne({worker_mail:req.session.key,work_status:"working"});

  w.time.push(d);
 await work(w).save();

    res.send('sample',{d:a,f:flag});

});

app.post('/option',urlencodedParser,async function(req,res){
  flag=~flag;
  var d=new Date();
  var w=await work.findOne({worker_mail:req.session.key,work_status:"working"});
  w.options.push(req.body.options);
  w.time.push(d);
 await work(w).save();
    res.send(undefined);
});

app.post('/login',urlencodedParser,async function(req,res){
    if(a===undefined){
        a=[];
    }
    a.push(req.body);
    var d = new Date();
   //  worker.updateOne({"worker_mail":req.session.key},{$push:{"worker_location":req.body}});
   var w=await work.findOne({worker_mail:req.session.key,work_status:"working"});
    w.worker_location.push(req.body);
    work_status="working"
  //  w.time.push(d);
   await work(w).save();
    res.send(undefined);
});


app.set('view engine','ejs');
var PORT = process.env.PORT || 3000;
app.listen(PORT);


console.log("you are listening to port 3000");