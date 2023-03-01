const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
var http = require('http');
const morgan = require("morgan");
const { setupDb } = require('./services/db.js');
const { checkDiskSpace } = require('./services/metrics.js');
const { endpoints } = require('./config/node_exporter');

require('dotenv').config();

//process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

setupDb();

const app = express();
const port = process.env.PORT || 3176;
const sslPort = process.env.SSLPORT || 3443;
const poolsRouter = require('./routes/pools');
const contractsRouter = require('./routes/contracts');
const tokensRouter = require('./routes/tokens');
const spyRouter = require('./routes/spy');
const nodesRouter = require('./routes/nodes');

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

app.use('/pools', poolsRouter);
app.use('/contracts', contractsRouter);
app.use('/tokens', tokensRouter);
app.use('/spytokens', spyRouter);
app.use('/nodes', nodesRouter);

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

const intervalFreeSpace = () => checkDiskSpace(endpoints)
setInterval(intervalFreeSpace, 1_800_000); //check every 30 minutes

module.exports = app;
