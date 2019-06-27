require('dotenv').config();
const path = require('path'),
      fs = require('fs'),
      Koa = require('koa'),
      Pug = require('koa-pug'),
      static = require('koa-static'),
      koaBody = require('koa-body'),
      session = require('koa-session');
      
const flash = require('koa-flash-simple');    
const config = require('./config.json');
if (!process.env.PORT || !process.env.SECRET || !process.env.USER || !process.env.PASS) {
  console.log("Создайте файл .env с параметрами PORT, SECRET, USER, PASS - Приложение остановлено");
  process.exit();
}
const app = new Koa();

const pug = new Pug({
  viewPath: path.join(__dirname, 'template', 'pages'),
  basedir: path.join(__dirname, 'template', 'pages'),
  pretty: true,
  noCache: true,
  app: app
})

app.use(koaBody({
  formidable: {
    uploadDir: path.join(process.cwd(), 'public', 'upload')
  },
  multipart: true
}))

app.use(session({
    key: 'koa:sess',
    maxAge: 'session',
    overwrite: true, /** (boolean) can overwrite or not (default true) */
    httpOnly: true, /** (boolean) httpOnly or not (default true) */
    signed: false, /** (boolean) signed or not (default true) */
    rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
    renew: false, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
  }, app)
)

app.use(flash());

app.use(static(path.join(__dirname, 'public')));

const router = require('./routes');
app.use(router.routes());
app.use(router.allowedMethods());

app.use(async (ctx, next) => {
  try {
    await next();
    let err = new Error('Not found');
    err.status = 404;
    ctx.app.emit('error', err, ctx);
  } catch (err) {
    ctx.app.emit('error', err, ctx);
  }
})

app.on('error', (err, ctx) => {
  ctx.status = err.status || 500;
  ctx.render('error', {message: err.message, error: err})
});

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