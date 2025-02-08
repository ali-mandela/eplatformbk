const mongoose = require('mongoose')
 
const mongoURI = process.env.MONGO_URI;

  
const connectDB  = async () => {
  try { 
    const conn =  await mongoose.connect(mongoURI);   
    console.log(`MongoDB connected successfully to : ${conn.connection.name}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);  
  }
};

module.exports = {connectDB}