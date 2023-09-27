const events = require("events");
const crypto = require("crypto");

class User{
	#emitter = new events.EventEmitter();
	verified = false;
	socket;
	name;
	key;
	id;

	/**
	 * User object
	 * @param {io.Socket} socket 
	 * @param {String} key 
	 * @param {String} id 
	 */
	constructor(socket, key, id){
		this.socket = socket;
		this.key = crypto.createPublicKey(key);
		this.id = id;
	}

	/**
	 * Verify that user successfully completed authentication puzzle
	 * @param {Buffer} data 
	 * @param {Buffer} signature 
	 * @returns 
	 */
	verify(puzzle, solution){
		var verified = crypto.verify("sha512", puzzle, this.key, solution);
		if(verified) this.setVerified(true);
		return verified;
	}

	/**
	 * Set user verification status
	 * @param {Boolean} verified 
	 */
	setVerified(verified){
		this.verified = verified;
		this.socket.emit("verified", verified, verified && this.id);
		this.#emitter.emit("verified");
	}

	/**
	 * Event listner
	 * @param {String} event
	 * @param {function()} callback
	 */
	on(){ this.#emitter.on(...arguments) }
}

module.exports = User;