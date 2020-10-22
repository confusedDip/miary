const { Schema } = require('mongoose');
const postSchema = require('./postSchema');

const userSchema = new Schema({
    fname: String,
    lname: String,
    username: String,
    password: String,
    posts: [postSchema],
});

module.exports = userSchema;