const passport = require('passport');

exports.login = passport.authenticate('local', { // using a local passport strategy
  failureRedirect: '/login',
  failureFlash: 'Failed Login!',
  successRedirect: '/',
  successFlash: 'You are now logged in!'
});
