const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    vehicleDetails: {
        type: { type: String },
        model: String,
        plateNumber: String
    },
    pickup: { type: String, required: true },
    destination: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['requested', 'accepted', 'ongoing', 'completed', 'cancelled'], 
        default: 'requested' 
    },
    fare: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Ride', rideSchema);