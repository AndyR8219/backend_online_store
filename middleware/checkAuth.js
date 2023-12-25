const { verify } = require('../helpers/token')
const User = require('../models/User')

module.exports = async function (req, res, next) {
  const token = req.cookies.token || ''
  if (token) {
    try {
      const tokenData = verify(req.cookies.token)
      const user = await User.findOne({ _id: tokenData.id })

      if (!user) {
        return res.status(404).send({ error: 'Пользователь не найден' })
      }

      req.user = user
      next()
    } catch (err) {
      return res.status(403).send({
        error: 'Доступ запрещен',
      })
    }
  }
  return
}
