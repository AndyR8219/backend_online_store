const mongoose = require('mongoose')
const mapComment = require('./mapComment')

module.exports = function (product) {
  return {
    title: product.title,
    imageUrl: product.image,
    description: product.description,
    price: product.price,
    quantity: product.quantity,
    category: product.category.title,
    comments: product.comments.map((comment) =>
      mongoose.isObjectIdOrHexString(comment) ? comment : mapComment(comment)
    ),
    id: product.id,
  }
}
