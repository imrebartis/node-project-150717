const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { catchErrors } = require('../handlers/errorHandlers'); //catchErrors wraps around it exports.createStore in storeController and takes care of its error handling


// Do work here
router.get('/', catchErrors(storeController.getStores));
router.get('/stores', catchErrors(storeController.getStores));
router.get('/add', storeController.addStore);
router.post('/add', catchErrors(storeController.createStore));
router.post('/add/:id', catchErrors(storeController.updateStore));
router.get('/stores/:id/edit', catchErrors(storeController.editStore));

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
