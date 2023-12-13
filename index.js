const express = require('express')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const { PORT, NAME, PASS_CODE } = require('./constants/constants')
const mapUser = require('./helpers/mapUser')
const {
  register,
  login,
  getUsers,
  getRoles,
  updateUser,
  deleteUser,
} = require('./controllers/user')
const authenticated = require('./middleware/authenticated')
const hasRole = require('./middleware/hasRole')
const ROLES = require('./constants/roles')

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors())

app.post('/register', async (req, res) => {
  try {
    const { user, token } = await register(req.body.login, req.body.password)
    res
      .cookie('token', token, { httpOnly: true })
      .send({ error: null, user: mapUser(user) })
  } catch (error) {
    res.send({ error: error.massage || 'Unknow error' })
  }
})

app.post('/login', async (req, res) => {
  try {
    const { user, token } = await login(req.body.login, req.body.password)
    res
      .cookie('token', token, { httpOnly: true })
      .send({ error: null, user: mapUser(user) })
  } catch (error) {
    res.send({ error: error.massage || 'Unknow error' })
  }
})

app.post('/logout', async (req, res) => {
  res.cookie('token', '', { httpOnly: true }).send({})
})

app.use(authenticated)

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
