const mongoose = require('mongoose');
const Store = mongoose.model('Store');


exports.homePage = (req, res) => {
  // console.log(req.name);
  // req.flash('error', 'Something happened');
  // req.flash('error', 'Another thing happened');
  // req.flash('info', 'Something happened');
  // req.flash('warning', 'Something happened');
   res.render('index');
};

exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Add Store' });
};

exports.createStore = async (req, res) => {
  // console.log(req.body);
  // res.json(req.body); //this renders on http://localhost:7777/add the data submited in the form
  const store = await (new Store(req.body)).save();
  req.flash('success', `Successfully Created ${store.name}. Care to leave a review?`);
  res.redirect(`/store/${store.slug}`);
};

exports.getStores = async (req, res) => {
  // 1. Query the database for a list of all stores
  const stores = await Store.find();
  // console.log(stores);
  res.render('stores', { title: 'Stores', stores });
};

exports.editStore = async (req, res) => {
  // 1. Find the store given the ID
  //rendering the params (here = id) on the page:
  //res.json(req.params);
  //finding the object by id:
   const store = await Store.findOne({ _id: req.params.id });
   //rendering the store object on the page:
   //res.json(store)
  // 2. confirm they are the owner of the store
  // TODO
  // 3. Render out the edit form so the user can update their store
  // if the paramater name and the variable you're passing are the same, you don't have to give them both (= below store is for store: store)
    res.render('editStore', { title: `Edit ${store.name}`, store });
};

exports.updateStore = async (req, res) => {
  // find and update the store
  // paramaters of findOneAndUpdat: query, data, options (id in req.params.id stands for the ':id' from the route)
  const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true, // return the new store instead of the old one
    runValidators: true
  }).exec();
  req.flash('success', `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store →</a>`);
  res.redirect(`/stores/${store._id}/edit`);
  // Redirect them to the store and tell them it worked
};