const express = require('express')
const Flight = require('../models/Flight');
const { HTTP_STATUS } = require('../utils/constants');
const multer = require('multer'); // 1. Import multer
const upload = multer(); // 2. Initialize multer for text-only forms
const uploadUpdate = multer()

const router = express.Router();

// @route GET /flights
// Access
// @desc

router.get('/',async(req,res) => {
    try {
        // .find() gets all flights.
        // .populate('airline') tells Mongoose to look at the 'airline' ID, 
        // go to the Airline collection, and pull in the actual airline data.
        const flights = await Flight.find({}).populate('airline');
        
        // Return the data with a 200 Success status
        res.status(HTTP_STATUS.GET_SUCCESS).json({
            success: true,
            count: flights.length,
            data: flights
        });

    } catch (error) {
        console.error("Get Flights Error:", error);
        
        // Handle general server errors safely
        res.status(HTTP_STATUS.SERVER_ERROR).json({
            success: false,
            message: "Server Error: Could not retrieve flights",
            error: error.message
        });
    }
})

// @route POST /flights/add-flight
// Access
// @desc

router.post('/', upload.none(), async(req,res) => {
    try {
        
        // 1. Extract the data sent from the frontend
        const {
            flightNumber,
            airline, // This MUST be a valid MongoDB _id from the Airline collection
            origin,
            destination,
            departureTime,
            arrivalTime,
            price,
            status
        } = req.body;

        // 2. Optional: Basic validation before hitting the database
        if (!flightNumber || !airline || !origin || !destination || !departureTime || !arrivalTime || !price) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: "Please provide all required fields."
            });
        }


        // 3. Create a new flight instance using the Mongoose model
        const newFlight = new Flight({
            flightNumber,
            airline, 
            origin,
            destination,
            departureTime,
            arrivalTime,
            price,
            status // This will default to 'Scheduled' if not provided, based on your Schema
        });


        // 4. Save it to the database
        const savedFlight = await newFlight.save();

        // 5. Respond to the client with a 201 Created status
        res.status(HTTP_STATUS.CREATE_SUCCESS).json({
            success: true,
            message: "Flight successfully added!",
            data: savedFlight
        });

    } catch (error) {

        // Handle Mongoose duplicate key error (e.g., if flightNumber already exists)
        if (error.code === 11000) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: "A flight with this flight number already exists."
            });
        }

        // Handle general server or validation errors
        res.status(HTTP_STATUS.SERVER_ERROR).json({
            success: false,
            message: "Server Error: Could not add flight",
            error: error.message
        });
        
    }
})

// @route PUT /flights/update-flight
// Access
// @desc

router.put('/:id',uploadUpdate.any(),async(req,res) => {
    try {
        const { id } = req.params;

     

        // 1. Find the flight by ID and update it with the incoming req.body data
        const updatedFlight = await Flight.findByIdAndUpdate(
            id, 
            req.body, 
            { 
                returnDocument: 'after',
                runValidators: true // Forces Mongoose to run your Schema validations (e.g., prevents negative prices)
            }
        );

           // 2. If the ID is valid but doesn't match any flight in the database
        if (!updatedFlight) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: `No flight found with ID: ${id}`
            });
        }

        // 3. Return the successfully updated flight
        res.status(HTTP_STATUS.GET_SUCCESS).json({
            success: true,
            message: "Flight updated successfully",
            data: updatedFlight
        });

    } catch (error) {
        // Handle Mongoose duplicate key error (if they try to change the flightNumber to one that already exists)
        if (error.code === 11000) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: "A flight with this flight number already exists."
            });
        }
        
        // Handle Invalid MongoDB IDs or other server errors
        res.status(HTTP_STATUS.SERVER_ERROR).json({
            success: false,
            message: "Server Error: Could not update flight",
            error: error.message
        });
    }
})

// @route DELETE /flights
// Access
// @desc

router.delete('/:id',async(req,res) => {
    try {
        const { id } = req.params;

        // 1. Find the flight by ID and delete it
        const deletedFlight = await Flight.findByIdAndDelete(id);

        // 2. If the flight does not exist in the database, return a 404
        if (!deletedFlight) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: `No flight found with ID: ${id}`
            });
        }

        // 3. Return a success response
        res.status(HTTP_STATUS.GET_SUCCESS).json({
            success: true,
            message: "Flight deleted successfully",
            data: {} // Best practice is to return an empty object for deleted data
        });

    } catch (error) {
        console.error("Delete Flight Error:", error);
        
        // Handle invalid MongoDB IDs or other server errors
        res.status(HTTP_STATUS.SERVER_ERROR).json({
            success: false,
            message: "Server Error: Could not delete flight",
            error: error.message
        });
    }
})


module.exports = router