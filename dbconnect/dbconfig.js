const mongoose = require('mongoose');

const connectDB = async ()=>{
    try {
        const conn = await mongoose.connect(process.env.MONGO_URL)
        console.log(`Mongo connected: ${conn.connection.host}`)


    } catch (error) {
        console.log(`Error : ${err.message}`)
        process.exit(1);
    }
}

module.exports = connectDB;