const express = require('express')
const Flight = require('../models/Flight');
const { HTTP_STATUS } = require('../utils/constants');
const multer = require('multer'); // 1. Import multer
const upload = multer(); // 2. Initialize multer for text-only forms
const uploadUpdate = multer()

const router = express.Router();

const { getFlights, addFlights , updateFlight , deleteFlight} = require('../controllers/flightController')

// @route GET /flights
// Access
// @desc

router.get('/', getFlights)

// @route POST /flights/add-flight
// Access
// @desc

router.post('/', upload.none(), addFlights)

// @route PUT /flights/update-flight
// Access
// @desc

router.put('/:id',uploadUpdate.any(), updateFlight)

// @route DELETE /flights
// Access
// @desc

router.delete('/:id',deleteFlight)


module.exports = router