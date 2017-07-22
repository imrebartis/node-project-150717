const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const User = mongoose.model('User');
const multer = require('multer');
const jimp = require('jimp'); //we need this for resizing photos
const uuid = require('uuid'); // unique id generator

const multerOptions = {
  storage: multer.memoryStorage(),
  //checking the type of doc to be uploaded
  fileFilter: function(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if (isPhoto) {
      next(null, true); // = it's fine, continue with the uploading
    } else {
        next({message: "That filetype isn't allowed" }, false); 
    }
  }
}


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

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  // check if there is no new file to resize
  if (!req.file) {
    next(); // skip to the next middleware
    return;
  }
  const extension = req.file.mimetype.split('/')[1]; //getting the extension of the photo (the element after the '/')
  //req.body.photo and not req.photo, coz we save the new Store on the body, see createStore
  req.body.photo = `${uuid.v4()}.${extension}`; //uuid makes sure it has a unique identifier
  // now we resize
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  // once we have written the photo to our filesystem, keep going!
  next();
}

exports.createStore = async (req, res) => {
  // console.log(req.body);
  // res.json(req.body); //this renders on http://localhost:7777/add the data submited in the form
  req.body.author = req.user._id;
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

const confirmOwner = (store, user) => {
  // .equals is a mongoose method
  if (!store.author.equals(user._id)) {
    throw Error('You must own a store in order to edit it!');
  }
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
   confirmOwner(store, req.user);
  // 3. Render out the edit form so the user can update their store
  // if the paramater name and the variable you're passing are the same, you don't have to give them both (= below store is for store: store)
    res.render('editStore', { title: `Edit ${store.name}`, store });
};

exports.updateStore = async (req, res) => {
  // set the location data to be a point
  req.body.location.type = 'Point';
  // find and update the store
  // paramaters of findOneAndUpdat: query, data, options (id in req.params.id stands for the ':id' from the route)
  const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true, // return the new store instead of the old one
    runValidators: true
  }).exec();
  req.flash('success', `Successfully updated <strong>${store.name}</strong>. <a href="/store/${store.slug}">View Store →</a>`);
  res.redirect(`/stores/${store._id}/edit`);
  // Redirect them to the store and tell them it worked
};

exports.getStoreBySlug = async (req, res, next) => {
  // res.json(req.params)
  // populate will give us the obj itself instead of the id of the author
  const store = await Store.findOne({ slug: req.params.slug }).populate('author');
  //  res.json(store);
   if (!store) return next();
   res.render('store', { store, title: store.name });
};

exports.getStoresByTag = async (req, res) => {
  // res.send('it works')
  // res.json(tags)

  const tag = req.params.tag;
  const tagQuery = tag || { $exists: true };
  const tagsPromise = Store.getTagsList();
  const storesPromise = Store.find({ tags: tagQuery });
  const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);
  res.render('tag', { tags, title: 'Tags', tag, stores });
};


exports.searchStores = async (req, res) => {

  // const stores = await Store.find();
  // res.json(stores);

  const stores = await Store
  // first find stores that match
  .find({
    $text: {
      $search: req.query.q
    }
  }, {
    score: { $meta: 'textScore' }
  })// then sort them
  .sort({
    score: { $meta: 'textScore' }
  })
  // limit to only 5 results
  .limit(5);
  res.json(stores);
};

exports.mapStores = async (req, res) => {
  // .map(parseFloat) turns coordinates into an array of numbers
  const coordinates = [req.query.lng, req.query.lat].map(parseFloat);
  // res.json(coordinates)
   const q = {
    location: {
      // $near and $geometry are operators inside MongoDB
      $near: {
        $geometry: {
          type: 'Point',
          coordinates // i.e. coordinates: coordinates
        },
        $maxDistance: 10000 // 10km
      }
    }
   };

  // specifying what info to be displayed on /api/stores/near
  // u can specify what u don't need, too ('-author -tags')
  const stores = await Store.find(q).select('slug name description location photo').limit(10);
  res.json(stores);
};

exports.mapPage = (req, res) => {
  res.render('map', { title: 'Map' });
};

exports.heartStore = async (req, res) => {
  // list of person's stores
  const hearts = req.user.hearts.map(obj => obj.toString());
  // use addToSet instead of push so that
  // u don't accidentally add heart twice
  // if there is a heart for the store clicked delete it from user's hearts array
  // , otherwise add heart to user's hearts array
  const operator = hearts.includes(req.params.id) ? '$pull' : '$addToSet';
  // res.json(hearts);
  const user = await User
  .findByIdAndUpdate(req.user._id,
    { [operator]: { hearts: req.params.id } },
    { new: true } // return the updated user
  );
  res.json(user);
};

exports.getHearts = async (req, res) => {
  // another way to do this is to query user & call .populate on their hearts, i.e.
  // const stores = await User.findOne(req.user._id).populate('hearts');
  // res.json(stores);

  const stores = await Store.find({
    // find stores that are in the user's hearts array
    _id: { $in: req.user.hearts }
  });
  res.render('stores', { title: 'Hearted Stores', stores });
};