const { SIGN } = require('../constants/constants')
const jwt = require('jsonwebtoken')

module.exports = {
  generate(data) {
    return jwt.sign(data, SIGN, { expiresIn: '10d' })
  },
  verify(token) {
    return jwt.verify(token, SIGN)
  },
}
