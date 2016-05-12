var redis = require('redis');
var express = require('express');
var stream = require('connect-stream');

var client = redis.createClient(); //creates a new client
client.on('connect', function() {
    console.log('Connected to Redis');
});

var connection = mysql.createConnection({ //Connect to mysql database
  host     : '',
  user     : '',
  password : '',
  port     : '',
  database : ''
});

var globalDir = ""; //this indicate to connect-stream where to fetch your mp4 files.

function storeNshorten(element, destination){ //store a record and generate unique id
        var uniqueShorten = new Date().getTime().toString(36);
        client.exists("short:element:"+idPicture3D+":"+idMovie, function(err, reply) {
                if (reply === 1) {
                        console.log('>>> Record already exists');
                } else {
                        console.log(">>> Adding record "+uniqueShorten+" for element "+element+" to destination "+ destination);
                        client.set("short:element:"+element+":"+destination, uniqueShorten);
                        client.set("short:element:"+uniqueShorten, destination);
                        }
        });
}

var app = express();

app.use(stream((globalDir)));

app.get('/', function(req, res) { //just exist to see if server is on. Not needed
res.setHeader('Content-Type', 'text/plain');
res.end("OK");
});

app.get('/:short', function(req, res) {
        var reqShort = req.params.short.replace('.mp4', ''); //so you can query either yourdomain.tld/XXXXXX or yourdomain.tld/XXXXXX.mp4
        client.exists("short:element:"+reqShort, function(err, reply) {
                if (reply === 1) {
                        client.get("short:element:"+reqShort, function(err, reply) {
                                res.stream(reply); //return your mp4 file with correct header.
                        });
                } else {
					 res.end("uho"); //if nothing exists for asked short, return uho (could be better with actual 404 error but meh)
                }
        });
});



app.listen(80);

