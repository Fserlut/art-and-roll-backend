module.exports = class UserDto {
	phone;
	id;
	login;
	name;
	avatar;

	constructor(model) {
		this.phone = model.phone;
		this.id = model._id;
		this.login = model.login;
		this.name = model.name;
		this.avatar = model.avatar;
	}
}
