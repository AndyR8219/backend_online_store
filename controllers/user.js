const bcrypt = require('bcrypt')
const User = require('../models/User')
const Cart = require('../models/Cart')
const ROLES = require('../constants/roles')
const { generate } = require('../helpers/token')

const register = async (login, password) => {
  const findUser = await User.findOne({ login })
  if (findUser) {
    throw { status: 401, message: 'Указанный логин занят' }
  }
  if (!password) {
    throw { status: 401, message: 'Не указан пароль' }
  }
  const passwordHash = await bcrypt.hash(password, 10)

  const user = await User.create({
    login,
    password: passwordHash,
  })

  const cart = await Cart.create({ user_id: user._id })
  if (!cart) {
    throw { status: 401, message: 'Ошибка создания корзины' }
  }

  user.cart_id = cart._id
  await user.save()

  const token = generate({ id: user.id })
  return { user, token }
}

const login = async (login, password) => {
  const loginUser = await User.findOne({ login })
  if (!loginUser) {
    throw { status: 401, message: 'Неверный логин или пароль' }
  }

  const isPasswordMatch = await bcrypt.compare(password, loginUser.password)
  if (!isPasswordMatch) {
    throw { status: 401, message: 'Неверный логин или пароль' }
  }

  const token = generate({ id: loginUser.id })

  if (!loginUser.cart_id) {
    const cart = await Cart.create({ user_id: loginUser._id })
    if (!cart) {
      throw { status: 401, message: 'Ошибка создания корзины' }
    }
    loginUser.cart_id = cart._id
    await loginUser.save()
  }
  const updatedUser = await User.findById(loginUser._id).populate('cart_id')
  return { token, loginUser: updatedUser }
}

const getUsers = () => {
  return User.find()
}

const getRoles = () => {
  return [
    { id: ROLES.ADMIN, name: 'Admin' },
    { id: ROLES.MODERATOR, name: 'Moderator' },
    { id: ROLES.USER, name: 'User' },
  ]
}

const deleteUser = (id) => {
  return User.deleteOne({ _id: id })
}

const updateUser = (id, userData) => {
  const newData = User.findByIdAndUpdate(id, userData, {
    returnDocument: 'after',
  })
  return newData
}

module.exports = {
  register,
  login,
  getUsers,
  getRoles,
  deleteUser,
  updateUser,
}
