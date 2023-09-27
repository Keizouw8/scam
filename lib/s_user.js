const hash = require("object-hash");
const crypto = require("crypto");

class User{
	verified = false;
	socket;
	name;
	key;
	id;

	constructor(socket, key, id){
		this.socket = socket;
		this.key = crypto.createPublicKey(key);
		this.id = id;
	}

	verify(data, signature){
		return crypto.verify("sha512", data, this.key, signature);
	}

	setVerified(verified){
		this.verified = verified;
		this.socket.emit("verified", verified);
	}
}

module.exports = User;