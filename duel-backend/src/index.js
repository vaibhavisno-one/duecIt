import 'dotenv/config'
import app from './app.js'
import connectDB from "./db/index.js";

connectDB() //call other fucntion and then initialize it here
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`server is running on port ${process.env.PORT}`); // Uses that connectDB() function to actually open the door and start the app if it unlocks
        })
    })
    .catch((err) => {
        console.log('MONGODB CONNECTION FAILED  ', err);

    })

