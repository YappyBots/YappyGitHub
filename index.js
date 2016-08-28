let express = require('express');
let exphbs  = require('express-handlebars');
let path    = require('path');

let app = express();
let server = require('http').Server(app);
let io = require('socket.io')(server);

let Log = require('./lib/Logger');

const stopSignals = [
  'SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
  'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
];
const PORT = process.env.OPENSHIFT_NODEJS_PORT || 8080;
const IP = process.env.OPENSHIFT_NODEJS_IP || 'localhost';

Log.Socket(io);

let SocketReady = false;

require('./bot');

io.on('connection', socket => {
  if (SocketReady) return false;
  Log.Logger.debug('Socket.IO Connected!');
  SocketReady = true;
});
app.engine('hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs'
}));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
  res.render('home', {
    logs: Log.Logger.logs
  });
});

Log.Logger.info(`=> Starting app on ${IP || 'localhost'}:${PORT}`);


server.listen(PORT, IP, () => {
  Log.Logger.info(`=> Listening on ${IP || 'localhost'}:${PORT}`);
});
