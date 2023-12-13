const bcrypt = require('bcrypt')
const User = require('../models/User')
const { generate } = require('../helpers/token')

//register
async function register(login, password) {
  if (!password) {
    throw new Erroe('Password is empty')
  }
  const passwordHash = await bcrypt.hash(password, 10)

  const user = await User.create({ login, password: passwordHash })
  const token = generate({ id: user.id })

  return { user, token }
}

//login
async function login(login, password) {
  const user = awaitUser.findOne({ login })
  if (!login) {
    throw new Error('User not found')
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password)
  if (!isPasswordMatch) {
    throw new Error('Wrong password')
  }

  const token = generate({ id: user.id })

  return { token, user }
}

//logout

module.exports = {
  register,
  login,
}
