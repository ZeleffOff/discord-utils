const { model, Schema } = require('mongoose');

const Level = new Schema({
    _id: { type: String },
    guild: { type: String },
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
})

module.exports = model('Level', Level);