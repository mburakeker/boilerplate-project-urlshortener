require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const { Schema } = mongoose;
const urlSchema = new Schema({
    original_url:  {type:String, required: true},
    short_url: {type: String, required: true}
  });
const UrlModel = mongoose.model('Url',urlSchema);
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});
app.post('/api/shorturl',function(req,res){
  var regex = /(\b(https?):\/\/)[-A-Za-z0-9+&@#\/%?=~_|!:,.;]+[-A-Za-z0-9+&@#\/%=~_|]/;

  if(regex.test(req.body.url)){
    var id = mongoose.Types.ObjectId();
    var newObject = {short_url: id, original_url: req.body.url}
    UrlModel.create(newObject,function(err,obj){
      if(err) return console.error(err);
      res.json(newObject);
    })
  }
  else{
    res.json({error: 'invalid url'});
  }
})
app.get('/api/shorturl/:shortUrl',function(req,res){
  findByShortUrl(req.params.shortUrl,function(err,foundUrl){
    if(err){
      res.json({error: 'invalid url'});
    }
    else{
      res.redirect(foundUrl.original_url);  
    }
  })
})

const findByShortUrl = (shortUrl, done) => {
  UrlModel.findOne( {short_url: shortUrl} ,function(err,foundUrl){
    if(err) return console.error(err);
    done(null,foundUrl);
  })
};
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
