let mongoose = require('mongoose');

let knowledgesSchema = mongoose.Schema({
  key: String,
  value: String,
  img: String,
  collectionName: String
})

let userSchema = mongoose.Schema({
  login: {
    type: String,
    require: true
  },
  password: String,
  name: {
    type: String,
    require: true
  },
  lastname: String,
  googleId: String,
  language: String,
  collections: [{
    name: String,
    knowledges : [knowledgesSchema]
  }]
})

let User = module.exports = mongoose.model('uk',userSchema)
