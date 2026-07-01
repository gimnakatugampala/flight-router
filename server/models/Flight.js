const mongoose = require('mongoose');

// 1. Define the Schema
const flightSchema = new mongoose.Schema(
  {
    flightNumber: {
      type: String,
      required: [true, 'Please add a flight number (e.g., UL101)'],
      unique: true, 
      trim: true
    },
    airline: {
      // This tells Mongoose that this field stores an ID from another collection
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'A flight must belong to an airline'],
      ref: 'Airline' // This matches the exact name you exported in Airline.js
    },
    origin: {
      type: String,
      required: [true, 'Please add a departure city or airport code'],
    },
    destination: {
      type: String,
      required: [true, 'Please add an arrival city or airport code'],
    },
    departureTime: {
      type: Date,
      required: [true, 'Please add a departure time'],
    },
    arrivalTime: {
      type: Date,
      required: [true, 'Please add an arrival time'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a ticket price'],
      min: [0, 'Price cannot be negative']
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Delayed', 'In Air', 'Landed', 'Cancelled'], // Restricts the allowed values
      default: 'Scheduled'
    }
  },
  {
    // 2. Schema Options
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// 3. Export the Model
module.exports = mongoose.model('Flight', flightSchema);