const { decode } = require('base64-arraybuffer');

module.exports = {
	_base64ToArrayBuffer(base64) {
		return decode(base64);
	},

	toBuffer(ab) {
		let buf = Buffer.alloc(ab.byteLength);
		let view = new Uint8Array(ab);
		for (let i = 0; i < buf.length; ++i) {
			buf[i] = view[i];
		}
		return buf;
	}
}
