
const express = require('express');
const Airline = require('../models/Airline');
const { HTTP_STATUS } = require('../utils/constants');
const multer  = require('multer')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const uploadUpdate = multer()

const {getAirlines, createAirline, updateAirline, deleteAirline} = require('../controllers/airlinesController')



const router = express.Router();

// @route GET /airlines
// Access
// @desc

router.get('/', getAirlines)

// @route POST /airlines/add-airline
// Access
// @desc

router.post('/', upload.single('airline_img'),createAirline)


// @route PUT /airlines/update-airline
// Access
// @desc

router.put('/update-airline/:id', updateAirline)


// @route PUT /airlines/
// Access
// @desc - New 

router.delete('/:id',deleteAirline)

module.exports = router