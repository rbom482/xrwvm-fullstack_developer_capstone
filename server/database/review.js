/* jshint esversion: 6 */

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  id: {
    type: Number,
    required: true,
    unique: true  // Ensuring the custom id is unique if necessary
  },
  name: {
    type: String,
    required: true
  },
  dealership: {
    type: Number,
    required: true
  },
  review: {
    type: String,
    required: true
  },
  purchase: {
    type: Boolean,
    required: true
  },
  purchase_date: {
    type: Date,  // Changed to Date type for better handling of dates
    required: true
  },
  car_make: {
    type: String,
    required: true
  },
  car_model: {
    type: String,
    required: true
  },
  car_year: {
    type: Number,
    required: true
  }
});

// Export the model with a singular name
module.exports = mongoose.model('Review', reviewSchema);
