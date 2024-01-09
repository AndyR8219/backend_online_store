const mongoose = require('mongoose')
const roles = require('../constants/roles')

const UserSchema = mongoose.Schema(
  {
    login: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: Number,
      default: roles.USER,
    },
    cart_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cart',
    },
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
      },
    ],
  },
  { timestamps: true }
)

const User = mongoose.model('User', UserSchema)

module.exports = User
