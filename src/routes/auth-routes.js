const router = require('express').Router()
const passport = require('passport')

router.get('/', (req, res) => {
  console.log('user is ' + req.user)
  res.end()
})

router.get('/logout', (req, res) => {
    req.logout()
    res.end()
});
// auth with google+
router.get('/google', passport.authenticate('google', {
    scope: ['profile']
}))
// callback route for google to redirect to
router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
    res.redirect('/')
});

module.exports = {
  router: router
}
