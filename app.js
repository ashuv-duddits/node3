require('dotenv').config();
const path = require('path'),
      fs = require('fs'),
      express = require('express'),
      bodyParser = require('body-parser'),
      session = require('express-session');

const multer = require('multer');
const upload = multer({ dest: path.join(process.cwd(), 'public', 'upload') });
const flash = require('connect-flash');    
const config = require('./config.json');
if (!process.env.PORT || !process.env.SECRET || !process.env.USER || !process.env.PASS) {
  console.log("Создайте файл .env с параметрами PORT, SECRET, USER, PASS - Приложение остановлено");
  process.exit();
}
const app = express();

app.set('views', path.join(__dirname, 'template', 'pages'));
app.set('view engine', 'pug');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
// parse multipart/form-data
app.use(upload.any());

app.use(session({
    secret: process.env.SECRET,
    key: 'sessionkey',
    cookie: {
      path: '/',
      httpOnly: true,
      maxAge: 60000
    },
    saveUninitialized: false,
    resave: false
  })
)

app.use(flash());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes'));

app.use(function(req, res, next) {
  let err = new Error('Not found');
  err.status = 404;
  next(err);
})

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {message: err.message, error: err})
})

app.listen(process.env.PORT, function(err) {
  if (err) {
    return console.log(err);
  }
  if (!fs.existsSync(path.join(__dirname, 'public', 'upload'))) {
    fs.mkdirSync(path.join(__dirname, 'public', 'upload'));
  }
  config.mail.smtp.auth.user = process.env.USER;
  config.mail.smtp.auth.pass = process.env.PASS;
  console.log('Сервер запущен на порту: ', process.env.PORT)
})