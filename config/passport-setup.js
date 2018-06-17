var passport = require('passport')
var GoogleStrategy = require('passport-google-oauth20').Strategy
var keys = require('./keys')
var User = require('../models/user')

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user)
  })
})

passport.use(
  new GoogleStrategy({ // npm install express mongoose cookie-session passport passport-google-oauth20 cheerio request body-parser nightmare --save-dev
    // options for google strategy
    clientID: keys.google.clientID,
    clientSecret: keys.google.clientSecret,
    callbackURL: '/auth/google/redirect'
  }, (accessToken, refreshToken, profile, done) => {
    //check if user already exists in db
    User.findOne({googleId: profile.id}).then((currentUser) => {
      if(currentUser) {
        // already have this user
        console.log('user is: ', currentUser)
        done(null, currentUser)
      } else {
        // if not, create user in db
        new User({
          googleId: profile.id,
          login: profile.name.givenName + profile.name.familyName + 'GP',
          name: profile.name.givenName,
          lastname: profile.name.familyName,
          language: profile._json.language,
          collections: {name: "Without collection", knowledges: []}
        }).save().then((newUser) => {
          console.log('created new user: ', newUser)
          done(null, newUser)
        })
      }
    })
  })
)
