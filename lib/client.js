const { io } = require("socket.io-client");
const crypto = require("crypto");
const events = require("events");

class Client{
	#socket;
	#auth;
	#emitter = new events.EventEmitter();
	
	constructor(url, options){
		if(!(options?.auth?.publicKey instanceof crypto.KeyObject)
			|| !(options?.auth?.privateKey instanceof crypto.KeyObject))
		throw new SyntaxError("auth not properly defined in options object");
		
		this.#auth = options.auth;
		var auth = { key: options.auth.publicKey.export({type: "pkcs1", format: "pem"}) };
		
		this.#socket = io(url, {
			path: "/scam/",
			...options,
			auth
		});
		
		this.#socket.on("authenticate", function(puzzle, callback){
			callback(crypto.sign("sha512", puzzle, options.auth.privateKey));
		});
		this.#socket.on("verified", (verified) => {
			this.#emitter.emit("verified", verified);
		});
	}
	
	on(){ this.#emitter.on(...arguments); }
}

module.exports = Client;