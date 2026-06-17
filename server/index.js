const express = require('express')
require('dotenv').config()

const port = process.env.PORT || 5000
const app  = express()

// ====== Airlines =======

// @route GET /airlines
// Access
// @desc

app.get('/v1/airlines/',(req,res) => {
    res.send('Airlines')
})


// @route POST /airlines/add-airline
// Access
// @desc

app.post('/v1/airlines/add-airline',(req,res) => {
    res.send('Add Airline')
})


// @route PUT /airlines/update-airline
// Access
// @desc

app.put('/v1/airlines/update-airline',(req,res) => {
    res.send('Update Airline')
})


// @route PUT /airlines/
// Access
// @desc

app.delete('/v1/airlines/',(req,res) => {
    res.send('Delete Airline')
})


// ====== Flights =======

// @route GET /flights
// Access
// @desc

app.get('/v1/flights/',(req,res) => {
    res.send('Flights')
})

// @route POST /flights/add-flight
// Access
// @desc

app.post('/v1/flights/add-flight',(req,res) => {
    res.send('Add Flight')
})

// @route PUT /flights/update-flight
// Access
// @desc

app.put('/v1/flights/update-flight',(req,res) => {
    res.send('Update Flight')
})

// @route DELETE /flights
// Access
// @desc

app.delete('/v1/flights/',(req,res) => {
    res.send('Delete Flight')
})



app.listen(port,() => console.log(`Server started at port : ${port}`))