const mongoose = require('mongoose')

const OrderSchema = mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    cart_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cart',
    },
    total: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
)

const Order = mongoose.model('Order', OrderSchema)

module.exports = Order
