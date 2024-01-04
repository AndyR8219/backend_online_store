const Category = require('../models/Category')
const Product = require('../models/Product')

async function addProduct(dataProduct) {
  let category = null
  try {
    const findIdCategory = await Category.findOne({
      title: dataProduct.category,
    })
    if (findIdCategory) {
      category = findIdCategory._id
    } else {
      const newCategory = await Category.create({ title: dataProduct.category })
      category = newCategory._id
    }
  } catch (error) {
    throw ('Ошибка категории', error)
  }

  const newProduct = await Product.create({ ...dataProduct, category })

  await newProduct.populate([
    { path: 'comments', populate: 'author' },
    { path: 'category', populate: 'title' },
  ])

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

async function getProducts(
  search = '',
  limit = 9,
  page = 1,
  selectedCategories
) {
  try {
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
  } catch (error) {
    console.error('Error in getProducts:', error)
    throw error
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
