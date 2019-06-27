const validation = require('../services/validation');
const path = require('path');
const db = require('../models/db')();
const fs = require('fs');

exports.get = async (ctx) => {
  try {
    let data = {
      msgfile: ctx.flash.get() ? ctx.flash.get().msgfile : null,
      msgskill: ctx.flash.get() ? ctx.flash.get().msgskill : null
    };
    ctx.status = 200;
    ctx.render('admin', data);
  } catch (error) {
    console.error(error);
    ctx.status = 404;
  }
}
exports.skills = async (ctx) => {
  if (!ctx.request.body.age || !ctx.request.body.concerts || !ctx.request.body.cities || !ctx.request.body.years) {
    ctx.flash.set({ msgskill: "Не все поля заполнены!" });
    return ctx.redirect('/admin');
  }
  let numberSkills = ctx.request.body;
  let textSkills = {
    age: "Возраст начала занятий на скрипке",
    concerts: "Концертов отыграл",
    cities: "Максимальное число городов в туре",
    years: "Лет на сцене в качестве скрипача"
  };
  let skills = [];
  Object.keys(numberSkills).forEach(function (key, index) {
    skills[index] = {
      number: numberSkills[key],
      text: textSkills[key]
    }
  })
  db.set('skills', skills);
  db.save();
  ctx.flash.set({ msgskill: "Скиллы успешно обновлены!" });
  ctx.redirect('/admin')
}
exports.upload = async (ctx, next) => {
  try {
    let fields = {
      name: ctx.request.body.name,
      price: ctx.request.body.price
    }
    let files = ctx.request.files;
    let valid = validation(fields, files);
    console.log('valid=', valid)
    if (valid.err) {
      if (files.photo.path) {
        fs.unlinkSync(files.photo.path);
      }
      ctx.flash.set({ msgfile: valid.status });
      return ctx.redirect('/admin')
    }
    let rename = function(oldPath, newPath) {
      return new Promise(function(resolve, reject) {
        fs.rename(oldPath, newPath, function (err) {
          if (err) {
            return console.error(err.message);
          }
          console.log('Rename completed!');
  
          let dir = fileName.substr(fileName.indexOf('\\'));
  
          let products = db.get('products') || [];
  
          products.push({
            name: fields.name,
            price: fields.price,
            file: dir
          })

          db.set('products', products);
          db.save();

          resolve()
        })
      })
    }
    const fileName = path.join('./public', 'upload', files.photo.name);
    if (files.photo.path) {
      await rename(files.photo.path, fileName);
      ctx.flash.set({ msgfile: "Товар успешно добавлен!" });
      ctx.redirect('/admin');
    }
  } catch (error) {
    console.error(error);
    ctx.status = 404;
  }
}