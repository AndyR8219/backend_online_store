const mongoose = require('mongoose')

const CartSchema = mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    cart_items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart_items',
      },
    ],
  },
  { timestamps: true }
)

const Cart = mongoose.model('Cart', CartSchema)

module.exports = Cart
