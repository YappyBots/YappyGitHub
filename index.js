require('dotenv').config();

const express = require('express');
const exphbs  = require('express-handlebars');
const path    = require('path');
const Log = require('./lib/Logger');

const app = express();
const bodyParser = require('body-parser');
const server = require('http').Server(app);
const io = require('socket.io')(server);

const GithubWebhooks = require('./Github/webhooks');

const IP = process.env.WEB_IP || null;
const PORT = process.env.WEB_PORT || 8080;

Log.Socket(io);

let SocketReady = false;

require('./bot');

io.on('connection', () => {
  if (SocketReady) return false;
  Log.Logger.debug('Socket.IO Connected!');
  SocketReady = true;
});
app.engine('hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs'
}));
app.set('view engine', 'hbs');
app.use(bodyParser.urlencoded({
  extended: true,
  limit: '250kb'
}));
app.use(bodyParser.json({
  limit: '250kb'
}));
app.use(express.static(path.resolve(__dirname, './public')));

app.use((req, res, next) => {
  if (req.headers['content-type'] === 'application/x-www-form-urlencoded' && req.body && req.body.payload) {
    req.body = JSON.parse(req.body.payload);
  }
  next();
});

app.get('/', (req, res) => {
  res.render('home', {
    logs: Log.Logger.logs
  });
});

app.post('/', GithubWebhooks);

app.use((err, req, res, next) => {
  res.status(err && err.status || 500);
  res.send(err && err.stack || err);
  Log.Logger.error(err);
});

Log.Logger.info(`=> Starting app on ${IP || 'localhost'}:${PORT}`);
server.listen(PORT, IP, () => {
  Log.Logger.info(`=> Listening on ${IP || 'localhost'}:${PORT}`);
});
