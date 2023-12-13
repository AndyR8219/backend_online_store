const sign = require('../constants/constants')

const jwt = require('jsonwebtoken')

module.exports = {
  generate(data) {
    return jwt.sign(data, sign, { expiresIn: '10d' })
  },
  verify(token) {
    return jwt.verify(token, sign)
  },
}
