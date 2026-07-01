const asyncHandler = require('express-async-handler')
const Airline = require('../models/Airline');
const { HTTP_STATUS } = require('../utils/constants');
const multer  = require('multer')
const path = require('path')
const cors = require('cors')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
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




const getAirlines = asyncHandler(async (req,res) => {

    try {
        // .find() with an empty object {} fetches all records from the collection
        const airlines = await Airline.find({});
        
        // Return the data with a 200 Success status
        res.status(HTTP_STATUS.GET_SUCCESS).json({
            success: true,
            count: airlines.length,
            data: airlines
        });
    } catch (error) {
        // Handle any database connection or query errors safely
        res.status(HTTP_STATUS.SERVER_ERROR).json({
            success: false,
            message: "Server Error: Could not retrieve airlines",
            error: HTTP_STATUS.SERVER_ERROR
        });
    }
})

const createAirline = asyncHandler(async (req,res) => {
    // res.send('Add Airline')
    //   console.log(req.file, req.body)
    try {

        // 1. Verify the file actually arrived
        // If the frontend forgot to attach it, or used the wrong key, we stop here.
        if (!req.file) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "No image file uploaded." });
        }

        // 2. Generate the unique filename (The "Key")
        // We recreate the logic you used in diskStorage, but as standard variables.
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(req.file.originalname);
        const uniqueFileName = req.file.fieldname + '-' + uniqueSuffix + fileExtension;

        // 3. Construct the AWS Package
        // We pack the raw buffer and the exact MIME type so AWS knows it's an image.
        const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: uniqueFileName,
        Body: req.file.buffer,        
        ContentType: req.file.mimetype 
        });

        // 4. Send it to S3
        // This is a network request, so we MUST await it.
        await s3Client.send(command);

        // 5. Construct the public URL
        // AWS is predictable. We build the string using your exact bucket and generated filename.
        const s3Url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFileName}`;

        // 6. Respond to the client!
        console.log("Success! Image URL:", s3Url);
        
        
        // Save the Data to the DB
        // if(s3Url.includes('https://flight-router-bucket')){

        const newAirline = new Airline({
                name: req.body.airline_name,
                country: req.body.country, // Will default to 'Unknown' if not provided, based on your Schema
                logoUrl: s3Url             // The magic URL!
            });


            // Save it to the database!
        const savedAirline = await newAirline.save();

        res.status(HTTP_STATUS.CREATE_SUCCESS).json({
            message: "Airline successfully created!",
            airline: savedAirline,
            statusCode: HTTP_STATUS.CREATE_SUCCESS
        });

            // Get the DATA
            // console.log(req.body.airline_name)
            // console.log(req.body.country)


        // }

        
    } catch (error) {
        // If AWS rejects the keys, the bucket name is wrong, or the network fails, it lands here.
    console.error("AWS Upload Error:", error);
    res.status(HTTP_STATUS.SERVER_ERROR).json({ message: "Server error during upload to cloud." });
    }

})

const updateAirline =  asyncHandler(uploadUpdate.any(), async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body; 

        // This console log will now print your form-data fields perfectly!
        console.log("Params ID:", id);
        console.log("Form-Data Body:", updateData);

        const updatedAirline = await Airline.findByIdAndUpdate(id, updateData, {
            returnDocument: 'after',
            runValidators: true
        });

        if (!updatedAirline) {
            return res.status(404).json({
                success: false,
                message: `No airline found with ID: ${id}`
            });
        }

        res.status(200).json({
            success: true,
            message: "Airline updated successfully via form-data",
            data: updatedAirline
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
});


const deleteAirline =  asyncHandler(async(req,res) => {
    try {
        const { id } = req.params;
        console.log(id)

        // Find the airline by ID and delete it from MongoDB
        const deletedAirline = await Airline.findByIdAndDelete(id);

        // If the airline does not exist, return a 404 Not Found error
        if (!deletedAirline) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: `No airline found with ID: ${id}`
            });
        }

        // Return a success message
        res.status(HTTP_STATUS.GET_SUCCESS).json({
            success: true,
            message: "Airline deleted successfully",
            data: {} // Conventionally, deleted data returns an empty object
        });

    } catch (error) {
        console.error("Delete Airline Error:", error);
        
        // Handle invalid MongoDB IDs or other server errors
        res.status(HTTP_STATUS.SERVER_ERROR).json({
            success: false,
            message: "Server Error: Could not delete airline",
            error: error.message
        });
    }
})


module.exports = {
    getAirlines,
    createAirline,
    updateAirline,
    deleteAirline
}