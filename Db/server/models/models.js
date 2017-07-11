var mongoose = require('mongoose');
var _ = require('underscore');

module.exports = function(wagner, db) {
    mongoose.connect(db);
    var Food = mongoose.model('Food', require('./food.js'), 'food');

    var User = mongoose.model('User', require('./user.js'), 'users');

    var Diary = mongoose.model('Diary', require('./diary.js'), 'diaries');

    var FoodEaten = mongoose.model('FoodEaten', require('./foodEaten.js'), 'foodEaten');

    var models = {
        Food: Food,
        User: User,
        Diary: Diary,
        FoodEaten: FoodEaten
    };

    _.each(models, function(value, key) {
        wagner.factory(key, function() {
            return value;
        });
    });

    return models;
}
