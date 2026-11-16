const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  sku: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  safetyStock: { type: Number, required: true, default: 1 },
  unitPrice: { type: Number, required: true, default: 0.0 },
  shelfLifeDays: { type: Number, required: true, default: 7 },
  dateAdded: { type: Date, default: Date.now },
  salesHistory: [
    {
      date: { type: String, required: true },
      sold: { type: Number, required: true }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
