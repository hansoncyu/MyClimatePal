// creates reference food items with immutable serving size, nutrition and impact
var mongoose = require('mongoose');

var foodSchema = {
    _id: {
        type: String,
        required: true,
        unique: true
    },
    serving: {
        amount: {
            type: Number,
            required: true
        },
        
        unit: {
            type: String,
            enum: ['oz', 'g', 'cup', 'mL', 'serving(s)'],
            required: true
        }
    },
    nutrition: {
        calories: {
            type: Number,
            required: true
        }
    },
    impact: {
        // Liters of water per calorie
        waterPerCal: {
            type: Number,
            required: true
        },
        // Grams of CO2 equivalent per calorie
        carbonPerCal: {
            type: Number,
            required: true
        }
    }
}

var schema = new mongoose.Schema(foodSchema);
module.exports = schema;