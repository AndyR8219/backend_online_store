const express = require('express')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const { PORT, NAME, PASS_CODE } = require('./constants/constants')
const mapUser = require('./helpers/mapUser')
const mapProduct = require('./helpers/mapProduct')
const mapComment = require('./helpers/mapComment')
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
const { addComment, deleteComment } = require('./controllers/comment')
const authenticated = require('./middleware/authenticated')
const hasRole = require('./middleware/hasRole')
const ROLES = require('./constants/roles')
const authToken = require('./middleware/authToken')
const checkAuth = require('./middleware/checkAuth')

const app = express()

app.use(express.json())
app.use(cookieParser())

app.post('/register', async (req, res) => {
  try {
    const { user, token } = await register(req.body.login, req.body.password)
    res
      .cookie('token', token, { httpOnly: true })
      .send({ error: null, user: mapUser(user) })
  } catch (error) {
    res.send({ error: error.message || 'Unknow error' })
  }
})

app.post('/login', async (req, res) => {
  try {
    const { loginUser, token } = await login(req.body.login, req.body.password)

    res
      .cookie('token', token, { httpOnly: true })
      .send({ error: null, user: mapUser(loginUser) })
  } catch (error) {
    res.send({ error: error.message || 'Unknow error' })
  }
})

app.post('/logout', async (req, res) => {
  res.cookie('token', '', { httpOnly: true }).send({})
})

app.get('/auth/me', checkAuth, (req, res) => {
  try {
    const user = req.user
    console.log(user)
    res.send({ error: null, user: mapUser(user) })
  } catch (error) {
    res.send({ error: error.message || 'Unknow error' })
  }
})

app.get('/products', async (req, res) => {
  const { products, lastPage } = await getProducts(
    req.query.search,
    req.query.limit,
    req.query.page
  )

  res.send({ data: { lastPage, products: products.map(mapProduct) } })
})

app.get('/products/:id', async (req, res) => {
  const product = await getProduct(req.params.id)
  res.send({ data: mapProduct(product) })
})

// app.use(authenticated)
// app.use(authToken)

app.post('/products/:id/comments', async (req, res) => {
  const newComment = await addComment(req.params.id, {
    content: req.body.content,
    author: req.user.id,
  })
  res.send({ data: mapComment(newComment) })
})

app.delete(
  '/products/:productId/comments/:commentId',
  hasRole([ROLES.ADMIN, ROLES.MODERATOR]),
  async (req, res) => {
    await deleteComment(req.params.productId, req.params.commentId)
    res.send({ error: null })
  }
)

app.post('/products', hasRole([ROLES.ADMIN]), async (req, res) => {
  const newProduct = await addProduct({
    title: req.body.title,
    content: req.body.content,
    image: req.body.imageUrl,
    price: req.body.price,
    quantity: req.body.quantity,
    category: req.body.category,
  })
  res.send({ data: newProduct })
})

app.patch('/products/:id', hasRole([ROLES.ADMIN]), async (req, res) => {
  const updateProduct = await editProduct(req.params.id, {
    title: req.body.title,
    content: req.body.content,
    image: req.body.imageUrl,
    price: req.body.price,
    quantity: req.body.quantity,
    category: req.body.category,
  })
  res.send({ data: mapProduct(updateProduct) })
})

app.delete('/products/:id', hasRole([ROLES.ADMIN]), async (req, res) => {
  await deleteProduct(req.params.id)
  res.send({ error: null })
})

app.get('/users', hasRole([ROLES.ADMIN]), async (req, res) => {
  const users = await getUsers()
  res.send({ data: users.map(mapUser) })
})

app.get('/users/roles', hasRole([ROLES.ADMIN]), (req, res) => {
  const roles = getRoles()

  res.send({ data: roles })
})

app.patch('/users/:id', hasRole([ROLES.ADMIN]), async (req, res) => {
  const newUser = await updateUser(req.params.id, {
    role: req.body.roleId,
  })

  res.send({ data: mapUser(newUser) })
})

app.delete('/users/:id', hasRole([ROLES.ADMIN]), async (req, res) => {
  await deleteUser(req.params.id)
  res.send({ error: null })
})

mongoose
  .connect(
    `mongodb+srv://${NAME}:${PASS_CODE}.rvnasvw.mongodb.net/online_store?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server has been started on port ${PORT}...`)
    })
  })
