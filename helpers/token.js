const jwt = require('jsonwebtoken')
const sign = 'testtest'

module.exports = {
  generate(data) {
    return jwt.sign(data, sign, { expiresIn: '10d' })
  },
  verify(token) {
    return jwt.verify(token, sign)
  },
}
