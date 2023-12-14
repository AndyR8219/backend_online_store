const Product = require('../models/Product')

function addProduct(product) {
  return Product.create(product)
}

async function editProduct(id, product) {
  const newProduct = await Product.findByIdAndUpdate(id, product, {
    returnDocument: true,
  })

  return newProduct
}

function deleteProduct(id) {
  return Product.deleteOne({ _id: id })
}

async function getProducts(search = '', limit = 10, page = 1) {
  const [products, count] = await Promise.all([
    Product.find({ title: { $regex: search, $options: 'i' } })
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 }),
    Product.countDocument({ title: { $regex: search, $options: 'i' } }),
  ])

  return {
    products,
    lastPage: Math.ceil(count / limit),
  }
}

function getProduct(id) {
  return Product.findById(id)
}

module.exports = {
  addProduct,
  editProduct,
  deleteProduct,
  getProducts,
  getProduct,
}
