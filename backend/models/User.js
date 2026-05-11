const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'driver'], default: 'user' },
    // For Users
    vehicles: [{
        type: { type: String, enum: ['car', 'bike'] },
        model: String,
        plateNumber: String
    }],
    // For Drivers
    isAvailable: { type: Boolean, default: true },
    currentLocation: {
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 }
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);