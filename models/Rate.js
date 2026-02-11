const mongoose = require('mongoose');

const RateSchema = new mongoose.Schema({
  gold24: {
    purchaseRate: { type: Number, required: true },
    sellRate: { type: Number, required: true },
  },
  gold22: {
    purchaseRate: { type: Number, required: true },
    sellRate: { type: Number, required: true },
  },
  gold18: {
    purchaseRate: { type: Number, required: true },
    sellRate: { type: Number, required: true },
  },
  silver: {
    purchaseRate: { type: Number, required: true },
    sellRate: { type: Number, required: true },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Rate', RateSchema);
