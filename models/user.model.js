const {Schema, model} = require('mongoose');

const UserSchema = new Schema({
	phone: { type: String, unique: true, required: true },
	login: { type: String, unique: true, required: true },
	name: { type: String, requred: true },
	avatar: { type: String, default: 'https://storage.yandexcloud.net/art-and-roll-backet/default/default.svg' },
	findSpheres: { type: Object, requred: true },
	mySpheres: { type: Object, requred: true },
	smsCodes: { type: Object, requred: true },
	registerDate: { type: String },
	birthday: { type: String },
	arts: { type: Schema.Types.ObjectId, ref: 'Arts' },
	rolls: { type: Schema.Types.ObjectId, ref: 'Rolls' },
	profileDescription: { type: String, default: '' },

})

module.exports = model('User', UserSchema);
