const { verify } = require('../helpers/token')
const User = require('../models/User')

module.exports = async function (req, res, next) {
  const tokenData = verify(req.cookie.token)

  const user = await User.fingOne({ _id: tokenData.id })

  if (!user) {
    res.send({ error: 'Authenticated user nat found' })

    return
  }

  req.user = user
  next()
}
