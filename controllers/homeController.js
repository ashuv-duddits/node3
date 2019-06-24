const db = require('../models/db')();
const nodemailer = require('nodemailer');
const config = require('../config.json');

exports.get = (req, res) => {
  let data = {
    products: db.get('products'),
    skills: db.get('skills'),
    msgemail: req.flash('msgemail')[0]
  }
  res.status(200).render('index', data);
}

exports.post = (req, res) => {
  if (!req.body.name || !req.body.email || !req.body.message) {
    req.flash('msgemail', "Заполнены не все поля!");
    return res.redirect('/#sendmail');
  }
  const transporter = nodemailer.createTransport(config.mail.smtp);
  const mailOptions = {
    from: `"${req.body.name}" <${req.body.email}>`,
    to: config.mail.smtp.auth.user,
    subject: config.mail.subject,
    text: req.body.message.trim().slice(0, 500) + `\n Отправлено с: <${req.body.email}>`
  }
  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      req.flash('msgemail', "Произошла ошибка при отправке письма!");
      return res.redirect('/#sendmail');
    }
    req.flash('msgemail', "Письмо успешно отправлено!");
    res.redirect('/#sendmail');
  })
}