const express = require('express');
const exphbs  = require('express-handlebars');
const path    = require('path');
const Log = require('./lib/Logger');

const app = express();
const bodyParser = require('body-parser');
const server = require('http').Server(app);
const io = require('socket.io')(server);

const GithubWebhooks = require('./Github/webhooks');

const PORT = process.env.OPENSHIFT_NODEJS_PORT || process.env.YAPPY_GITHUB_PORT || process.env.PORT || 8080;
const IP = process.env.OPENSHIFT_NODEJS_IP || process.env.YAPPY_GITHUB_IP || process.env.IP || null;

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
