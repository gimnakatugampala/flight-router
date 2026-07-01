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

const airlineRouter = require('./routes/airlinesRouter.js')
const flightRouter = require('./routes/flightRouter.js')
const userRouter = require('./routes/usersRouter.js'); 
const bookingRouter = require('./routes/bookingsRouter.js'); 

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



app.use('/v1/airlines/',airlineRouter)
app.use('/v1/flights/',flightRouter)
app.use('/v1/users/',userRouter)
app.use('/v1/bookings/',bookingRouter)







app.listen(port,() => console.log(`Server started at port : ${port}`))