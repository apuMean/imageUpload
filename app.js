var express = require('express');
var fs = require('fs'); 
var request = require('request');
var url = require('url');
var progress = require('progress-stream');
var bodyParser=require('body-parser');
var disp='';
var app = express();
var _=require("underscore");
var jsonfile=require("./data.json");


var multer = require('multer');


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        
        cb(null, file.originalname );

    }
});


// app.use(bodyparser());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());
app.use(express.static('./'));


var upload = multer({
    storage: storage,
    
}).fields([
    { name: "fileName", maxCount: 1 } 
]);




app.post('/uploads', function (req, res, next) {

  var prog = progress({time:100},function(progress){ 
    var len = this.headers['content-length'];
    var transf = progress.transferred;
    var result = Math.round(transf/len * 100)+'%';
    console.log(result);
  });

  req.pipe(prog);
  prog.headers = req.headers;

    upload(prog, res, function (err) { 
        if (err) {
            res.status(err.status || 500).json({ "error": { "status_code": err.status || 500, "message": err.code } });
            return;
        } else {


            if (prog.files.fileName) {

                res.writeHead(200,{'Content-Type':'text/html'});
                var reqJSON = JSON.stringify(prog.files.fileName, null, 2);
                    
                var dat={path:prog.files.fileName[0].path};

                fs.appendFile('data.json',JSON.stringify(dat)+",\n", (err) => {
                        if (err) throw err;                        
                        console.log('added successfully');
                        });
                    res.write("<h1>Uploaded from file</h2><img style='max-width:20%' src='" + prog.files.fileName[0].path + "'/><pre>" + prog.files.fileName[0].path + "</pre><a href='/'>Go back</a>");
                res.end();
           
           
            }
               
            
                    }
    });
});
/////////////////////////////////////////////////////////////////////////////////////////////
app.get('/recent', function (req, res, next) {

    fs.readFile('data.json','utf8', (err, data) => {
    if (err) throw err;

    var data=data.substring(0,data.length-2)+"]";

    var str=JSON.parse(data); 
    

    for(i=0;i<=str.length-1;i++){
      
      disp+="<img style='max-width:20%' src='" + str[i].path + "'/><h5>" + str[i].path + "</h5>";
        console.log(str[i].path);
    }
  });

/////////////////////////////////////////////////////////////////////////////////////////////
                    
                
                res.write("<html>"+disp+"</html>");
                disp="";
                res.end();});


app.post('/search', function (req, res, next) {

    var contents = fs.readFileSync('./data.json').toString();
    console.log(contents);
    console.log("searching");
   // res.send(contents);
    var x = req.body.search;
  console.log(x);
var m='uploads/'+x;
console.log(m);
    var text;
    var i;
    var obj = JSON.parse(contents);
    for (i = 0; i < obj.length ; i++) {
        if (obj[i].path ==m) {
            console.log("Image present");

text = "<img style='max-width:40%' src='" + obj[i].path + "'/><h5>" + obj[i].path + "</h5>";
       res.write("<html>" + text + "</html>");
      text = "";
        res.end();
        }

    }

    if (i == obj.length - 1) {
        console.log("Image not available");
        res.send("not present");
    }


next();
});


    
//Delete the file mynewfile2.txt:

// app.post('/delete', function (req, res, next) {

//     var del = req.body.del;

//     console.log(del);

//     delete jsonfile.splice(5, 1);

//     var afterdelete = JSON.stringify(jsonfile)

//     console.log(jsonfile);

//     fs.writeFile('./data.json', afterdelete, (err) => {

//         if (err) throw err;

//         console.log('The file has been saved!');

//     });
    
// });
// app.post('/del', function (req, res, next) {
//    var contents = fs.readFileSync('./data.json').toString();
//    console.log("before........");
//    console.log(contents);
   
//    // res.send(contents);
//    var x = req.body.del;
  
   
//    contents=JSON.parse(contents);
// //    var ob = fs.readFileSync('./form_log.json','UTF-8');
// // var jsonOb = JSON.parse(ob);
//    contents =  _.where(contents, {path:m });
//    console.log(contents);
//    delete contents.req.body.del;
//    console.log("after...........");
//    console.log(contents); 
//    res.send("image deleted..");  
   


// });
app.post('/del', function (req, res, next) {
   var contents = fs.readFileSync('./data.json').toString();
   console.log("before........");
   console.log(contents);
   
   // res.send(contents);
   var x = req.body.del;
   var m='uploads/'+x;
console.log(m);
   
   contents=JSON.parse(contents);
   contents = _.without(contents, _.findWhere(contents, {path: m}));
   console.log("after...........");
   console.log(contents); 
   res.send("image deleted..");  
   


});



        
               
app.listen(3000, function () {
    console.log("Working on port 3000");
});
