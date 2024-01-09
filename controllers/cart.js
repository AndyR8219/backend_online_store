const Cart = require('../models/Cart')
const Cart_items = require('../models/Cart_items')
const Product = require('../models/Product')

const getCart = async (cartId) => {
  const cart = await Cart.findById(cartId).populate({
    path: 'cart_items',
    populate: {
      path: 'product_id',
      model: 'Product',
    },
  })
  return cart
}

const addProductToCart = async (cart_id, { product_id, quantity }) => {
  const cart = await Cart.findById(cart_id)
  if (!cart) {
    throw new Error('Корзина не найден')
  }
  const product = await Product.findById(product_id)
  if (!product) {
    throw new Error('Товар не найден')
  }
  const existingCartItem = await Cart_items.findOne({ cart_id, product_id })
  if (existingCartItem) {
    existingCartItem.quantity += 1
    await existingCartItem.save()
  } else {
    const cartItem = await Cart_items.create({
      cart_id,
      product_id,
      quantity,
    })
    await cartItem.save()
    cart.cart_items.push(cartItem._id)
    await cart.save()
  }
  return cart
}

const deleteProductFromCart = async (cart_id, product_id) => {
  await Cart_items.deleteOne({ cart_id, product_id })
}

const updateQuantityProductInCart = async (cart_id, itemId, quantity) => {
  const cart = await Cart.findById(cart_id)
  if (!cart) {
    throw new Error('Корзина не найден')
  }

  const updatedCartItem = await Cart_items.findByIdAndUpdate(
    itemId,
    { quantity },
    { new: true }
  )
  if (!updatedCartItem) {
    throw new Error('Товар в корзине не найден')
  }
  return updatedCartItem
}

module.exports = {
  getCart,
  addProductToCart,
  deleteProductFromCart,
  updateQuantityProductInCart,
}
