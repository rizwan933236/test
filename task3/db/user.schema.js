const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    mail: String,
    role: String,
    lastLogin: {
      coord: [Number], // [latitude, longitude]
    },
    unsuccessfulAttempts: Number,
    activeSessions: [{
      deviceName: String,
      duration: Number, // in hours
    }],
  });
  module.exports = mongoose.model('User', userSchema);