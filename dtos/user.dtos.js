const ArtsModel = require('../models/arts.model');
const RollsModel = require('../models/rolls.model');

module.exports = class UserDto {
	phone;
	id;
	login;
	name;
	avatar;
	birthday

	constructor(model) {
		this.phone = model.phone;
		this.birthday = model.birthday;
		this.id = model._id;
		this.login = model.login;
		this.name = model.name;
		this.avatar = model.avatar;
	}
}
