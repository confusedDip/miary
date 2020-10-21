const { Schema } = require('mongoose');

const postSchema = new Schema({
    title: String,
    date: String,
    content: String,
});

module.exports = postSchema;