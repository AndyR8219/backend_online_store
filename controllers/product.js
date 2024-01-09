const Category = require('../models/Category')
const Product = require('../models/Product')

const addProduct = async (dataProduct) => {
  let category = null
  const findIdCategory = await Category.findOne({
    title: dataProduct.category,
  })
  if (findIdCategory) {
    category = findIdCategory._id
  } else {
    const newCategory = await Category.create({ title: dataProduct.category })
    category = newCategory._id
  }
  const newProduct = await Product.create({ ...dataProduct, category })

  await newProduct.populate([
    { path: 'comments', populate: 'author' },
    { path: 'category', populate: 'title' },
  ])

  return newProduct
}

const editProduct = async (id, product) => {
  const findIdCategory = await Category.findOne({
    title: product.category,
  })
  const newProduct = await Product.findByIdAndUpdate(
    id,
    { ...product, category: findIdCategory },
    { new: true }
  )

  await newProduct.populate([
    {
      path: 'comments',
      populate: 'author',
    },
    { path: 'category', populate: 'title' },
  ])

  return newProduct
}

const deleteProduct = (id) => {
  return Product.deleteOne({ _id: id })
}

const getProducts = async (
  search = '',
  limit = 9,
  page = 1,
  selectedCategories
) => {
  let categoryFilter = {}

  if (selectedCategories && selectedCategories.length > 0) {
    categoryFilter = {
      category: { $in: selectedCategories },
    }
  }
  const [products, count, categories] = await Promise.all([
    Product.find({
      title: { $regex: search, $options: 'i' },
      ...categoryFilter,
    })
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .populate({ path: 'category', populate: 'title' }),
    Product.countDocuments({
      title: { $regex: search, $options: 'i' },
      ...categoryFilter,
    }),
    Category.find(),
  ])
  return {
    products,
    lastPage: Math.ceil(count / limit),
    categories,
  }
}

const getProduct = (id) => {
  return Product.findById(id).populate([
    {
      path: 'comments',
      populate: 'author',
    },
    { path: 'category', populate: 'title' },
  ])
}

module.exports = {
  addProduct,
  editProduct,
  deleteProduct,
  getProducts,
  getProduct,
}
