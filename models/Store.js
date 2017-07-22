const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Please enter a store name!'
  },
  slug: String,
  description: {
    type: String,
    trim: true
  },
  tags: [String],
  created: {
    type: Date,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [{
      type: Number,
      required: 'You must supply coordinates!'
    }],
    address: {
      type: String,
      required: 'You must supply an address!'
    }
  },
  photo: String,
   author: {
    // the id given by mongoose is not of type String or Number but ObjectId
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'You must supply an author'
   }
  }, {
  // make the virtuals (here: reviews) be seen when actual document
  // is converted to json or into an object
  toJSON: { virtuals: true },
  toOjbect: { virtuals: true },
});

// Define our indexes (they make our queries more efficient)
storeSchema.index({
  name: 'text',
  description: 'text'
});

storeSchema.index({ location: '2dsphere' });

storeSchema.pre('save', async function(next) { //autogenerating the slug string before someone creates a store
 if (!this.isModified('name')) {
    next(); // skip it
    return; // stop this function from running
  }
  this.slug = slug(this.name);
  // find other stores that have a slug of barbar, barbar-1, barbar-2
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  const storesWithSlug = await this.constructor.find({ slug: slugRegEx });
  if (storesWithSlug.length) {
    this.slug = `${this.slug}-${storesWithSlug.length + 1}`;
  }
  next();
});

storeSchema.statics.getTagsList = function() { //need to use proper function (not an arrow), so that 'this' could be used
  return this.aggregate([ //we use here a MongoDB Aggregation Pipeline Operator, i.e. aggregate([])
    // this would render sth like '[{"_id":"Family Friendly","count":2},{"_id":"Wifi","count":1},{"_id":"Licensed","count":1}]'
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } } //getting tags in descending order (most popular first)
  ]);
}

storeSchema.statics.getTopStores = function() {
  // aggregate is like .find, but can do more complex queries
  // we can't use the virtual reviews from storeSchema.virtual
  // coz that's a mongoose things, while aggregate is a MongoDB thing
  return this.aggregate([
    // Lookup Stores and populate their reviews:
    // N.B. 'reviews' here is not in the store model, but it's
    // courtesy of MongoDB, who turns Review into 'reviews'
    { $lookup: { from: 'reviews', localField: '_id', foreignField: 'store', as: 'reviews' }},
    // filter for only items that have 2 or more reviews
    { $match: { 'reviews.1': { $exists: true } } },
    // Add the average reviews field
    // In MongoDB 3.4 (mlab sandbox will update to it on 18 Aug)
    // u just replace $project with $addField & then you'll need only averageRating
    { $project: {
      photo: '$$ROOT.photo',
      name: '$$ROOT.name',
      reviews: '$$ROOT.reviews',
      slug: '$$ROOT.slug',
      // The $ sign in $reviews means that it's a field from the data being piped in
      // here: from the map
      averageRating: { $avg: '$reviews.rating' }
    } },
    // sort it by our new field, highest reviews first
    { $sort: { averageRating: -1 }},
    // limit to at most 10
    { $limit: 10 }
  ]);
}

// find reviews where the stores _id property === reviews store property
storeSchema.virtual('reviews', {
  ref: 'Review', // what model to link?
  localField: '_id', // which field on the store?
  foreignField: 'store' // which field on the review?
});

// when store is queried with find or findOne
//reviews will be automatically populated
function autopopulate(next) {
  this.populate('reviews');
  next();
}

storeSchema.pre('find', autopopulate);
storeSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('Store', storeSchema);
