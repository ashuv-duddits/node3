const db = require('../models/db')();
const nodemailer = require('nodemailer');
const config = require('../config.json');

exports.get = async (ctx, next) => {
  try {
    let data = {
      products: db.get('products'),
      skills: db.get('skills'),
      msgemail: ctx.flash.get() ? ctx.flash.get().msgemail : null
    }
    ctx.render('index', data);
  } catch (error) {
    console.error(error);
    ctx.status = 404;
  }
}

exports.post = async (ctx) => {
  try {
    if (!ctx.request.body.name || !ctx.request.body.email || !ctx.request.body.message) {
      ctx.flash.set({msgemail: "Заполнены не все поля!"});
      return ctx.redirect('/#sendmail');
    }
    const transporter = nodemailer.createTransport(config.mail.smtp);
    const mailOptions = {
      from: `"${ctx.request.body.name}" <${ctx.request.body.email}>`,
      to: config.mail.smtp.auth.user,
      subject: config.mail.subject,
      text: ctx.request.body.message.trim().slice(0, 500) + `\n Отправлено с: <${ctx.request.body.email}>`
    }
    let sendMail = function(options) {
      return new Promise(function(resolve, reject) {
        transporter.sendMail(options, function(error, info) {
          if (error) {
            ctx.flash.set({msgemail: "Произошла ошибка при отправке письма!"});
            return ctx.redirect('/#sendmail');
          }
          resolve();
        })
      })
    }
    await sendMail(mailOptions);
    ctx.flash.set({msgemail: "Письмо успешно отправлено!"});
    ctx.redirect('/#sendmail');
  } catch (error) {
    console.error(error);
    ctx.status = 500;
  }
}