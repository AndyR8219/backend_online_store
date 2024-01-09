const mongoose = require('mongoose')

const Cart_itemsSchema = mongoose.Schema(
  {
    cart_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cart',
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    quantity: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
)

const Cart_items = mongoose.model('Cart_items', Cart_itemsSchema)

module.exports = Cart_items
