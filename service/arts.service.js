const artsModel = require('../models/arts.model');

class ArtsService {
	async getTotalArts(userId) {
		let userArts = await artsModel.findOne({user: userId});
		if (userArts) {
			return userArts.arts.length;
		}
		const arts = await artsModel.create({user: userId, arts: []});
		return 0;
	}
}

module.exports = new ArtsService();
