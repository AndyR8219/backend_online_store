require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const mapUser = require('./helpers/mapUser')
const mapProduct = require('./helpers/mapProduct')
const mapComment = require('./helpers/mapComment')
const mapCategory = require('./helpers/mapCategory')
const mapCart = require('./helpers/mapCart')
const {
  register,
  login,
  getUsers,
  getRoles,
  updateUser,
  deleteUser,
} = require('./controllers/user')
const {
  addProduct,
  editProduct,
  deleteProduct,
  getProducts,
  getProduct,
} = require('./controllers/product')
const {
  getCart,
  addProductToCart,
  deleteProductFromCart,
  updateQuantityProductInCart,
} = require('./controllers/cart')
const { addComment, deleteComment } = require('./controllers/comment')
const hasRole = require('./middleware/hasRole')
const ROLES = require('./constants/roles')
const checkAuth = require('./middleware/checkAuth')

const app = express()

app.use(express.json())
app.use(cookieParser())

app.post('/auth/register', async (req, res) => {
  try {
    const { user, token } = await register(req.body.login, req.body.password)
    res
      .cookie('token', token, { httpOnly: true })
      .send({ error: null, user: mapUser(user) })
  } catch (error) {
    res.send({ error: error.message || 'Unknow error' })
  }
})

app.post('/auth/login', async (req, res) => {
  try {
    const { loginUser, token } = await login(req.body.login, req.body.password)

    res
      .cookie('token', token, { httpOnly: true })
      .send({ error: null, user: mapUser(loginUser) })
  } catch (error) {
    res.status(401).send({ error: error.message || 'Unknow error' })
  }
})

app.post('/auth/logout', async (req, res) => {
  try {
    res.cookie('token', '', { httpOnly: true }).send({})
  } catch (error) {
    res.send(error)
  }
})

app.get('/auth/me', checkAuth, async (req, res) => {
  try {
    const user = req.user
    await user.populate({ path: 'cart_id' })

    res.send({ error: null, user: mapUser(user) })
  } catch (error) {
    res.send({ error: error.message || 'Unknow error' })
  }
})

app.get('/api/products', async (req, res) => {
  try {
    const { search, categories, page, limit } = req.query
    const decodedCategories = categories
      ? decodeURIComponent(categories.replace(/%5B/g, '[').replace(/%5D/g, ']'))
      : ''

    const parsedCategories = decodedCategories
      ? JSON.parse(decodedCategories)
      : []

    const {
      products,
      lastPage,
      categories: allCategories,
    } = await getProducts(search, limit, page, parsedCategories)

    res.send({
      lastPage,
      products: products.map(mapProduct),
      categories: allCategories.map(mapCategory),
    })
  } catch (error) {
    res.send({ error })
  }
})

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await getProduct(req.params.id)
    res.send({ data: mapProduct(product) })
  } catch (error) {
    res.send({ error })
  }
})

app.use(checkAuth)

app.post(
  '/api/products/:productId/comments',
  hasRole([ROLES.ADMIN, ROLES.MODERATOR, ROLES.USER]),
  async (req, res) => {
    try {
      const newComment = await addComment(req.params.productId, {
        content: req.body.content,
        author: req.user.id,
      })
      res.send({ data: mapComment(newComment) })
    } catch (error) {
      res.send({ error })
    }
  }
)

app.delete(
  '/api/products/:productId/comments/:commentId',
  hasRole([ROLES.ADMIN, ROLES.MODERATOR]),
  async (req, res) => {
    try {
      await deleteComment(req.params.productId, req.params.commentId)
      res.send({ error: null })
    } catch (error) {
      res.send({ error })
    }
  }
)

app.post('/api/products', hasRole([ROLES.ADMIN]), async (req, res) => {
  try {
    const newProduct = await addProduct({
      title: req.body.title,
      image: req.body.imageUrl,
      price: req.body.price,
      quantity: req.body.quantity,
      category: req.body.category,
      description: req.body.description,
    })
    res.send({ data: mapProduct(newProduct) })
  } catch (error) {
    res.send({ error })
  }
})

app.patch('/api/products/:id', hasRole([ROLES.ADMIN]), async (req, res) => {
  try {
    const updateProduct = await editProduct(req.params.id, {
      title: req.body.title,
      image: req.body.imageUrl,
      price: req.body.price,
      quantity: req.body.quantity,
      category: req.body.category,
      description: req.body.description,
    })
    res.send({ data: mapProduct(updateProduct) })
  } catch (error) {
    res.send({ error })
  }
})

app.delete('/api/products/:id', hasRole([ROLES.ADMIN]), async (req, res) => {
  try {
    await deleteProduct(req.params.id)
    res.send({ error: null })
  } catch (error) {
    res.send({ error })
  }
})

app.get('/api/users', hasRole([ROLES.ADMIN]), async (req, res) => {
  try {
    const users = await getUsers()
    res.send({ data: users.map(mapUser) })
  } catch (error) {
    res.send({ error })
  }
})

app.get('/api/users/roles', hasRole([ROLES.ADMIN]), async (req, res) => {
  try {
    const roles = await getRoles()
    res.send({ data: roles })
  } catch (error) {
    res.send({ error })
  }
})

app.patch('/api/users/:id', hasRole([ROLES.ADMIN]), async (req, res) => {
  try {
    const newUser = await updateUser(req.params.id, {
      role: req.body.roleId,
    })
    res.send({ data: mapUser(newUser) })
  } catch (error) {
    res.send({ error })
  }
})

app.delete('/api/users/:id', hasRole([ROLES.ADMIN]), async (req, res) => {
  try {
    await deleteUser(req.params.id)
    res.send({ error: null })
  } catch (error) {
    res.send({ error })
  }
})

app.get(
  '/api/carts/:id',
  hasRole([ROLES.ADMIN, ROLES.MODERATOR, ROLES.USER]),
  async (req, res) => {
    try {
      const cart = await getCart(req.params.id)
      res.send({ data: mapCart(cart) })
    } catch (error) {
      res.send({ error })
    }
  }
)

app.post(
  '/api/carts/:cartId',
  hasRole([ROLES.ADMIN, ROLES.MODERATOR, ROLES.USER]),
  async (req, res) => {
    try {
      const cart_items = await addProductToCart(req.params.cartId, {
        product_id: req.body.productId,
        quantity: req.body.quantity,
      })
      res.send({ data: cart_items })
    } catch (error) {
      res.send({ error })
    }
  }
)

app.delete(
  '/api/carts/:cartId/products/:productId',
  hasRole([ROLES.ADMIN, ROLES.MODERATOR, ROLES.USER]),
  async (req, res) => {
    try {
      await deleteProductFromCart(req.params.cartId, req.params.productId)
      res.send({ error: null })
    } catch (error) {
      res.send({ error })
    }
  }
)

app.patch(
  '/api/carts/:cartId/cart_items/:itemId',
  hasRole([ROLES.ADMIN, ROLES.MODERATOR, ROLES.USER]),
  async (req, res) => {
    try {
      const updateCartItems = await updateQuantityProductInCart(
        req.params.cartId,
        req.params.itemId,
        req.body.quantity
      )
      res.send({ data: updateCartItems })
    } catch (error) {
      res.send({ error })
    }
  }
)

mongoose.connect(process.env.DB_CONNECTION_STRING).then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Server has been started on port ${process.env.PORT}...`)
  })
})
