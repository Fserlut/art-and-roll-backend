const {Schema, model} = require('mongoose');

const RollsSchema = new Schema({
	user: {type: Schema.Types.ObjectId, ref: 'User'},
	rolls: {type: Array, required: true, default: []},
})

module.exports = model('Rolls', RollsSchema);
