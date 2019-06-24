const validation = function(fields, files) {

  if (files.photo.originalname === '' || files.photo.size === 0) {
    return {status: 'Не загружена картинка!', err: true}
  }
  if (!fields.name) {
    return {status: 'Не указано название товара', err: true}
  }
  if (!fields.price) {
    return {status: 'Не указана цена товара', err: true}
  }
  return {status: 'Ок', err: false}
}

module.exports = validation;