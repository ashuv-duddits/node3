const validation = require('../services/validation');
const path = require('path');
const db = require('../models/db')();
const fs = require('fs');

exports.get = (req, res) => {
  let data = {
    msgfile: req.flash('msgfile')[0],
    msgskill: req.flash('msgskill')[0]
  };
  res.status(200).render('admin', data);
}
exports.skills = (req, res) => {
  if (!req.body.age || !req.body.concerts || !req.body.cities || !req.body.years) {
    req.flash('msgskill', "Не все поля заполнены!");
    return res.redirect('/admin');
  }
  let numberSkills = req.body;
  let textSkills = {
    age: "Возраст начала занятий на скрипке",
    concerts: "Концертов отыграл",
    cities: "Максимальное число городов в туре",
    years: "Лет на сцене в качестве скрипача"
  };
  let skills = [];
  Object.keys(numberSkills).forEach(function(key, index) {
    skills[index] = {
      number: numberSkills[key],
      text: textSkills[key]
    }
  })
  db.set('skills', skills);
  db.save();
  req.flash('msgskill', "Скиллы успешно обновлены!");
  res.redirect('/admin')
}
exports.upload = (req, res) => {
  let files = {
    photo: {}
  };
  if (req.files.length !== 0) {
    let photo = req.files.map(function(item) {
      return item;
    })[0]
    files.photo = photo;
  } else {
    files.photo.originalname = '',
    files.photo.size = 0
  }
  let fields = {
    name: req.body.name,
    price: req.body.price
  }
  let valid = validation(fields, files);
  if (valid.err) {
    if (files.photo.path) {
      fs.unlinkSync(files.photo.path);
    }
    req.flash('msgfile', valid.status);
    return res.redirect('/admin')
  }
  const fileName = path.join('./public', 'upload', files.photo.originalname);
  if (files.photo.path) {
    fs.rename(files.photo.path, fileName, function(err) {

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
      req.flash('msgfile', "Товар успешно добавлен!");
      res.redirect('/admin')
    })
  }
}