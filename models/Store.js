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
});

// Define our indexes (they make our queries more efficient)
storeSchema.index({
  name: 'text',
  description: 'text'
});

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

module.exports = mongoose.model('Store', storeSchema);
