module.exports = function (cart_items) {
  return {
    cartId: cart_items.cart_id,
    quantity: cart_items.quantity,
    itemId: cart_items.id,
    product: {
      id: cart_items.product_id.id,
      image: cart_items.product_id.image,
      price: cart_items.product_id.price,
      quantity: cart_items.product_id.quantity,
      title: cart_items.product_id.title,
    },
  }
}
