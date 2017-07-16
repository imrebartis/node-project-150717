const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');


// Do work here
router.get('/', storeController.homePage);

router.get('/add', storeController.addStore);

router.post('/add', storeController.createStore);

// storeSchema.pre('save', function(next) { //autogenerating the slug string before someone creates a store
//   if (!this.isModified('name')) {
//     next(); // skip it
//     return; // stop this function from running
//   }
//   this.slug = slug(this.name);
//   next();
//   // TODO make more resiliant so slugs are unique
// });

module.exports = router;
