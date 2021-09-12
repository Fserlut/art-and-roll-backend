const {Schema, model} = require('mongoose');

const UserSchema = new Schema({
	phone: { type: String, unique: true, required: true },
	login: { type: String, unique: true, required: true },
	name: { type: String, requred: true },
	avatar: { type: String, default: 'https://firebasestorage.googleapis.com/v0/b/art-and-roll.appspot.com/o/avatar.svg?alt=media&token=339bf979-90ac-4b0b-aed0-6d55081d3ded' },
	findSpheres: { type: Object, requred: true },
	mySpheres: { type: Object, requred: true },
	smsCodes: { type: Object, requred: true },
	registerDate: { type: String },
	birthday: { type: String },
	arts: {type: Schema.Types.ObjectId, ref: 'Arts'},
	rolls: {type: Schema.Types.ObjectId, ref: 'Rolls'},

})

module.exports = model('User', UserSchema);
