var mongoose = require('mongoose');

// each food eaten an obj of: an item from Food model, user's individual amount eaten and nutrition/impact
var foodEatenSchema = {
    item: {
        type: String, ref: 'Food', required: true
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
            default: 0,
            }
    },
    impact: {
        waterTotal: {
            type: Number,
            default: 0,
            },
        carbonTotal: {
            type: Number,
            default: 0,
            }
    }
}

var schema = new mongoose.Schema(foodEatenSchema);
module.exports = schema;

/* when user is inputting food eaten, will only have options to choose
units based on base food units. User can't choose mL if base food is in oz/g 
*/ 

    
// convert reference food and user's eaten amount to same units to calculate calories/impact
// made method because needed to populate item with Food model to access its info
// callback function is passed error as first parameter and updated foodEaten object as second parameter
schema.methods.calculateInfo = function(collection, cb) {
    var unitConversion = {
        oz: 1,
        g: 28.3495,
        cup: 1,
        mL: 236.588,
        'serving(s)': 1
    };
    // populate the item to get access to info about ref food
    collection.findOne(this).populate('item').exec(function(err, foodItem){
        if (err) {
            console.log('Error populating');
        }
        // calculations to get new calories and impact
        var refUnit = foodItem.item.serving.unit;
        var userUnit = foodItem.serving.unit;
        var newRefAmt = foodItem.item.serving.amount / unitConversion[refUnit];
        var newUserAmt = foodItem.serving.amount / unitConversion[userUnit];
        var cal = newUserAmt * foodItem.item.nutrition.calories / newRefAmt;
        
        cal = Math.round(cal);
        
        var refWater = foodItem.item.impact.waterPerCal;
        var refCarbon = foodItem.item.impact.carbonPerCal;
        var water = refWater * cal;
        water = Math.round(water);
        var carbon = refCarbon * cal;
        carbon = Math.round(carbon);
        // save new calculated nutrition/impact info to unpopulated foodEaten entry
        var foodItemID = foodItem._id;
        collection.findOne({ _id: foodItemID }, function(err, item) {
            if (err) {
                console.log('Error finding by foodItemID');
            }
            item.nutrition.calories = cal;
            item.impact.waterTotal = water;
            item.impact.carbonTotal = carbon;
            item.save(function(err, item) {
                if (err) {
                    return cb(err);
                }
                cb(null, item);
            });
        });
    });
}
