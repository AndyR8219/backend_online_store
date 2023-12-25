const bcrypt = require('bcrypt')
const User = require('../models/User')
const { generate } = require('../helpers/token')
const ROLES = require('../constants/roles')

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
  try {
    const loginUser = await User.findOne({ login })
    if (!loginUser) {
      throw { status: 404, message: 'Пользователь не найден' }
    }

    const isPasswordMatch = await bcrypt.compare(password, loginUser.password)
    if (!isPasswordMatch) {
      throw { status: 404, message: 'Неверный логин или пароль' }
    }

    const token = generate({ id: loginUser.id })
    return { token, loginUser }
  } catch (error) {
    throw { status: 500, message: 'Неверный логин или пароль' }
  }
}

function getUsers() {
  return User.find()
}

function getRoles() {
  return [
    { id: ROLES.ADMIN, name: 'Admin' },
    { id: ROLES.MODERATOR, name: 'Moderator' },
    { id: ROLES.USER, name: 'User' },
  ]
}

function deleteUser(id) {
  return User.deleteOne({ _id: id })
}

function updateUser(id, userData) {
  return User.findByIdAndUpdate(id, userData, { returnDocument: 'after' })
}

module.exports = {
  register,
  login,
  getUsers,
  getRoles,
  deleteUser,
  updateUser,
}
