module.exports = function (comment) {
  return {
    id: comment.id,
    content: comment.content,
    author: comment.author.login,
    publishedAt: comment.createdAt,
  }
}
