const Product = require('../models/Product')

async function addProduct(product) {
  const newProduct = await Product.create(product)

  await newProduct.populate({
    path: 'comments',
    populate: 'author',
  })

  return newProduct
}

async function editProduct(id, product) {
  const newProduct = await Product.findByIdAndUpdate(id, product, {
    returnDocument: 'after',
  })

  await newProduct.populate({
    path: 'comments',
    populate: 'author',
  })

  return newProduct
}

function deleteProduct(id) {
  return Product.deleteOne({ _id: id })
}

async function getProducts(search = '', limit = 9, page = 1) {
  const [products, count] = await Promise.all([
    Product.find({ title: { $regex: search, $options: 'i' } })
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 }),
    Product.countDocuments({ title: { $regex: search, $options: 'i' } }),
  ])

  return {
    products,
    lastPage: Math.ceil(count / limit),
  }
}

function getProduct(id) {
  return Product.findById(id).populate({
    path: 'comments',
    populate: 'author',
  })
}

module.exports = {
  addProduct,
  editProduct,
  deleteProduct,
  getProducts,
  getProduct,
}
