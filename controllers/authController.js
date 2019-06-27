const db = require('../models/db')();


exports.get = (req, res) => {
  if (req.session.isAdmin) {
    return res.redirect('/admin');
  }
  res.status(200).render('login');
}

exports.post = (req, res) => {
  let user = db.stores.file.store.user;
  if (user.email == req.body.email && user.password == req.body.password) {
    req.session.isAdmin = true;
    res.redirect('/admin');
  } else {
    req.session.isAdmin = false;
    res.redirect('/login');
  }
}