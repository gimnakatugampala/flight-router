const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    flight: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Flight',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    bookingDate: {
      type: Date,
      default: Date.now
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Paid' // Defaulting to Paid for now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);