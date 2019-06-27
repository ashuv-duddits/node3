const db = require('../models/db')();


exports.get = async (ctx) => {
  if (ctx.session.isAdmin) {
    return ctx.redirect('/admin');
  }
  ctx.status = 200;
  ctx.render('login');
}

exports.post = async (ctx) => {
  let user = db.stores.file.store.user;
  if (user.email == ctx.request.body.email && user.password == ctx.request.body.password) {
    ctx.session.isAdmin = true;
    ctx.redirect('/admin');
  } else {
    ctx.session.isAdmin = false;
    ctx.redirect('/login');
  }
}