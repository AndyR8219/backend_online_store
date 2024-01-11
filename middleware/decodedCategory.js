module.exports = function (categories) {
  const decodedCategories = categories
    ? decodeURIComponent(categories.replace(/%5B/g, '[').replace(/%5D/g, ']'))
    : ''

  const parsedCategories = decodedCategories
    ? JSON.parse(decodedCategories)
    : []
  return parsedCategories
}
