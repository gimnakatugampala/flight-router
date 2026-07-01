const express = require('express')

const router = express.Router();

// @route GET /flights
// Access
// @desc

router.get('/v1/flights/',(req,res) => {
    res.send('Flights')
})

// @route POST /flights/add-flight
// Access
// @desc

router.post('/v1/flights/',(req,res) => {
    res.send('Add Flight')
})

// @route PUT /flights/update-flight
// Access
// @desc

router.put('/v1/flights/',(req,res) => {
    res.send('Update Flight')
})

// @route DELETE /flights
// Access
// @desc

router.delete('/v1/flights/',(req,res) => {
    res.send('Delete Flight')
})


module.exports = router