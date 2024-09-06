/* jshint esversion: 6 */

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const carSchema = new Schema({
  dealer_id: {
    type: Number,
    required: true
  },
  make: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  bodyType: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  mileage: {
    type: Number,
    required: true
  }
});

// Export the model using singular form
module.exports = mongoose.model('Car', carSchema);
