module.exports = function (user) {
  return {
    id: user.id,
    login: user.login,
    roleId: user.role,
    createdAt: user.createdAt,
    cartItems: user.cart_id.cart_items,
    cartId: user.cart_id._id,
  }
}
