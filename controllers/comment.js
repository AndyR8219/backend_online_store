const Comment = require('../models/Comment')
const Product = require('../models/Product')

async function addComment(productId, comment) {
  const newComment = await Comment.create(comment)

  await Product.findByIdAndUpdate(productId, {
    $push: { comments: newComment },
  })

  await newComment.populate('author')
  return newComment
}

async function deleteComment(productId, commentId) {
  await Comment.deleteOne({ _id: commentId })
  await Product.findByIdAndUpdate(productId, {
    $pull: { comments: commentId },
  })
}

module.exports = {
  addComment,
  deleteComment,
}
