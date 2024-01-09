const mongoose = require('mongoose')
const mapCart_items = require('./mapCart_items')

module.exports = function (cart) {
  return {
    cartItems: cart.cart_items.map((item) =>
      mongoose.isObjectIdOrHexString(item) ? item : mapCart_items(item)
    ),
  }
}
