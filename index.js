const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
var http = require('http');
const morgan = require("morgan");
const { setupDb } = require('./services/db.js');

const { startIntervals } = require('./intervals');

require('dotenv').config();

//process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

setupDb();

const app = express();
const port = process.env.PORT || 3176;
const nodesRouter = require('./routes/nodes');
const serversRouter = require('./routes/servers');

const helmet = require('helmet');

// Logging
//app.use(morgan('dev'));


app.use(bodyParser.json());
app.use(helmet());

var allowedOrigins = ['https://scrthost.xiphiar.com', 'https://triviumnode.com', 'http://localhost:8085', 'http://localhost:8082', 'http://localhost:3000', 'http://anode1.trivium.xiphiar.com:3000'];

app.use(cors({
  origin: function(origin, callback){

    // allow requests with no origin 
    // (like mobile apps or curl requests)
    if(!origin) return callback(null, true);

    if(allowedOrigins.indexOf(origin) === -1) {
      var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

app.use('/nodes', nodesRouter);
app.use('/servers', serversRouter);

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get('/', (req, res) => {
  res.json({'message': 'ok'});
})

http.createServer(app).listen(port);
console.log(`Example app listening at http://localhost:${port}`)

startIntervals();

module.exports = app;
