const mongoose = require('mongoose');

// 1. Define the Schema (The Blueprint)
const airlineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add an airline name'],
      unique: true, // Prevents adding "Delta" twice
    },
    country: {
      type: String,
      default: 'Unknown', // If the frontend doesn't send a country, default to this
    },
    logoUrl: {
      type: String,
      required: [true, 'Please add an airline logo URL'],
    },
  },
  {
    // 2. Schema Options
    timestamps: true, // Magically adds 'createdAt' and 'updatedAt' fields!
  }
);

// 3. Export the Model (The Builder)
module.exports = mongoose.model('Airline', airlineSchema);