const RollsModel = require('../models/rolls.model');

class RollsService {
	async getTotalRolls(userId) {
		let userRolls = await RollsModel.findOne({user: userId});
		if (userRolls) {
			return userRolls.rolls.length;
		}
		const rolls = await userRolls.create({user: userId, rolls: []});
		return 0;
	}
}

module.exports = new RollsService();
