const {Schema, model} = require('mongoose');

const ArtsSchema = new Schema({
	user: {type: Schema.Types.ObjectId, ref: 'User'},
	arts: {type: Array, required: true, default: []},
})

module.exports = model('Arts', ArtsSchema);
