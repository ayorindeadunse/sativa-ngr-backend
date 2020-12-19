const mongoose = require("mongoose");
const ProductSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  price: {
    type: Float64Array,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
});

module.exports = Product = mongoose.model("product", ProductSchema);
