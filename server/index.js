// mongodb fix 
const dns = require('node:dns/promises');
dns.setServers(['1.1.1.1', '8.8.8.8']);

const express = require('express')
require('dotenv').config()
const multer  = require('multer')
const path = require('path')
const cors = require('cors')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const connectDB = require('./config/db.js')

const airlineRouter = require('./routes/airlines.js')

connectDB()

// - CONSTANTS
const { HTTP_STATUS } = require('./utils/constants.js')


// --- MODELS
const Airline = require('./models/Airline.js')


// ===== IMG UPLOAD MULTER =======
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const uploadUpdate = multer()

// AWS
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
})



const port = process.env.PORT || 5000
const app  = express()

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); // Add this too just in case

app.use(cors())

// ====== Airlines =======

// @route GET /airlines
// Access
// @desc

app.use('/v1/airlines/',airlineRouter)

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