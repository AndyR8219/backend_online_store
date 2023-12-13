const express = require('express')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const { PORT, NAME, PASS_CODE } = require('./constants/constants')
const mapUser = require('./helpers/mapUser')
const { register, login } = require('./controllers/user')

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

mongoose
  .connect(
    `mongodb+srv://${NAME}:${PASS_CODE}.rvnasvw.mongodb.net/quiz2?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server has been started on port ${PORT}...`)
    })
  })
