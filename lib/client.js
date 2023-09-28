const { io } = require("socket.io-client");
const Message = require("./message");
const crypto = require("crypto");
const events = require("events");

class Client{
	#emitter = new events.EventEmitter();
	cache = {};
	#socket;
	#auth;
	id;
	
	/**
	 * scam client object
	 * @constructor
	 * @param {String} url
	 * @param {Object} options 
	 * @param {Object} options.auth
	 * @param {crypto.KeyObject} options.auth.publicKey
	 * @param {crypto.KeyObject} options.auth.privateKey
	 */
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
		this.#socket.on("verified", (verified, id) => {
			if(verified) this.id = id;
			this.#emitter.emit("verified", verified);
		});
		this.#socket.on("message", (msg) => this.#emitter.emit("message", Message.import(msg)));
	}

	send(to, content){
		var that = this;
		return new Promise(function(resolve, reject){
			if(!that.cache[to]){
				that.#socket.emit("userkey", to, function(key){
					if(!key) return reject(new Error("Target user not online"));
					that.cache[to] = crypto.createPublicKey(key);
					sender();
				});
			}else{
				sender();
			}

			function sender(){
				var message = Message.new(to, that.id, that.#auth.privateKey, that.cache[to], content);
				that.#socket.emit("message", message.export());
			}
		});
	}
	
	/**
	 * Event listner
	 * @param {String} event
	 * @param {function()} callback
	 */
	on(){ this.#emitter.on(...arguments); }
}

module.exports = Client;