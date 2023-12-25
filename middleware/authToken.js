const { SIGN } = require('../constants/constants')

module.exports = function (req, res, next) {
  const token = req.header('Authorization')
  if (!token) {
    return res.sendStatus(401)
  }
  jwt.verify(token, SIGN, (err, user) => {
    if (err) {
      return res.sendStatus(403)
    }
    req.user = user
    next()
  })
}
