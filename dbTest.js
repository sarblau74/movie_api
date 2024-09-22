// Import Mongoose
const mongoose = require('mongoose');

// MongoDB connection URI (replace with your actual connection string)
const uri = "mongodb+srv://sarahblauvelt74:Madcat111!@myapi.mplmq.mongodb.net/?retryWrites=true&w=majority&appName=myApi";

// Client options (you can adjust as needed)
const clientOptions = {
  serverApi: { version: '1', strict: true, deprecationErrors: true },
};

// Async function to test the connection
async function testConnection() {
  try {
    // Connect to MongoDB
    await mongoose.connect(uri, clientOptions);
    console.log('Successfully connected to MongoDB!');

    // Ping the database to verify the connection is active
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log('Pinged your deployment. You successfully connected to MongoDB!');
  } catch (error) {
    // Log any connection errors
    console.error('Error connecting to MongoDB:', error);
  } finally {
    // Disconnect after the test
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

// Run the connection test
testConnection();
