const express = require('express')
const fetch = require('node-fetch');
const fs = require('fs')
const app = express()
const apiKeyFileName = 'apikey.txt'
var apiKey

app.use(express.static('public'))

fs.readFile(apiKeyFileName, 'utf8', function(err, data) {
  if (err) throw err
  apiKey = data
});

app.get('/data', function(req, res){
  fetch("http://api.openweathermap.org/data/2.5/forecast?q=london&appid=" + apiKey)
    .then(response => response.json()).then(jsonData => res.send(jsonData))
})

var listener = app.listen(3000, function(){
  console.log('Listening on port ' + listener.address().port);
});
