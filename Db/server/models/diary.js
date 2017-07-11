var mongoose = require('mongoose');

var diarySchema = {
    createdBy: {
        type: mongoose.Schema.Types.ObjectId, ref: "User",
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    food: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FoodEaten', index: true }],
    nutrition: {
        caloriesTotal: {
            type: Number,
            default: 0
        }
    },
    impact: {
        waterTotal: {
            type: Number,
            default: 0
        },
        carbonTotal: {
            type: Number,
            default: 0
        }
    }
};

var schema = new mongoose.Schema(diarySchema);
module.exports = schema;