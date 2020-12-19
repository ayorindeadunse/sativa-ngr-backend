const mongoose = require("mongoose");
const ShoppingCartSchema = mongoose.Schema({
  cartId: {
    type: String,
    default: null,
  },
  items: [
    {
      key: {
        type: String,
        default: null,
      },
      imageUrl: {
        type: String,
        default: null,
      },
      price: {
        type: Float64Array,
        default: 0.0,
      },
      quantity: {
        type: Number,
        default: 0,
      },
      title: {
        type: String,
        default: null,
      },
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = ShoppingCart = mongoose.model(
  "shopping-cart",
  ShoppingCartSchema
);
