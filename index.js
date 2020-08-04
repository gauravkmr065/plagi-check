//server
var port = process.env.PORT || 9000
require('dotenv').config()
const path = require('path');
// load express
const express = require('express');
const bodyparser = require('body-parser');
var ejs = require('ejs');
var multer = require('multer');
const fs = require("fs");
const mongo = require("mongodb");
const assert = require("assert");
const mongoose = require("mongoose");
const {createWorker} = require("tesseract.js");
const worker = createWorker({
  logger: m => console.log(m)
});
mongoose.connect('mongodb://localhost:27017/test', { useNewUrlParser: true,useUnifiedTopology: true });

var Schema = new mongoose.Schema({
  data:String
});
var dats = mongoose.model('emp',Schema);


//storage engine
const storage = multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null,"./upload");
  },
  filename:(req,file,cb)=>{
    cb(null, file.originalname)
  }
});

//init upload
const upload = multer({
  storage:storage 
}).single('myImage')
   


var app = express()

app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: false }))

// display these files statically as they are
app.use('/', express.static(path.join(__dirname, '/public')))

// set the view engine to ejs
app.set('view engine', 'ejs')

// use routes
app.use('/result', require('./routes/check'))
app.use('/edit', require('./routes/check'))
app.use('/', require('./routes/check'))

app.get("/edit",function(req,res){
  res.redirect()
})

app.post('/upload',(req, res)=>{
  upload(req,res,err =>{
    (async () => {
      await worker.load();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      const { data: { text } } = await worker.recognize(`./upload/${req.file.originalname}`);
     res.render("upload",{data:text} );
      await worker.terminate();
    })();
    })
  })
   
 











app.listen(port, () => {
  console.log(`Server up on port ${port}`)
})
