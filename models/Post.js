const { model } = require('mongoose');

const postSchema = require('../schemas/postSchema');

module.exports = model('Post', postSchema);