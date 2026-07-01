const express = require('express');
const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const { protect, authorize } = require('../middleware/authMiddleware');
const { HTTP_STATUS } = require('../utils/constants');

const router = express.Router();

// @route POST /v1/bookings/:flightId
// Access Private (Customers only)
// @desc Book a flight slot

router.post('/:flightId', protect, authorize('customer'), async (req, res) => {
    try {
        const { flightId } = req.params;

        // 1. Find the flight the user wants to book
        const flight = await Flight.findById(flightId);

        if (!flight) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: "Flight not found"
            });
        }

        // 2. Check if the flight is fully booked (20 seats limit)
        if (flight.bookedSeats >= flight.capacity) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: "Sorry, this flight is fully booked!"
            });
        }

        // 3. Optional: Check if this exact user already booked this exact flight
        const alreadyBooked = await Booking.findOne({ flight: flightId, user: req.user.id });
        if (alreadyBooked) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: "You have already booked a seat on this flight."
            });
        }

        // 4. Create the booking
        const booking = await Booking.create({
            flight: flightId,
            user: req.user.id // Taken securely from the JWT token!
        });

        // 5. Increment the bookedSeats counter on the Flight model and save it
        flight.bookedSeats += 1;
        await flight.save();

        res.status(HTTP_STATUS.CREATE_SUCCESS).json({
            success: true,
            message: "Flight booked successfully!",
            data: booking
        });

    } catch (error) {
        console.error("Booking Error:", error);
        res.status(HTTP_STATUS.SERVER_ERROR).json({
            success: false,
            message: "Server Error: Could not process booking",
            error: error.message
        });
    }
});

module.exports = router;