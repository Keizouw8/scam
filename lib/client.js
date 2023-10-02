import { io } from "socket.io-client";
import Message from "./message.js";
import crypto from "crypto";
import events from "events";

export default class Client{
	#emitter = new events.EventEmitter();
	cache = {};
	#socket;
	#auth;
	id;
	
	/**
	 * scam client object
	 * @importructor
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
		var that = this;
		
		this.#socket = io(url, {
			path: "/scam/",
			...options,
			auth
		});
		
		this.#socket.on("authenticate", function(puzzle, callback){
			callback(crypto.sign("sha512", puzzle, options.auth.privateKey));
		});
		this.#socket.on("verified", function(verified, id){
			if(verified) that.id = id;
			that.#emitter.emit("verified", verified);
		});
		this.#socket.on("message", function(msg){
			var message = Message.import(msg);
			message.decrypted = message.decrypt(that.#auth.privateKey);
			that.#emitter.emit("message", message);
		});
	}

	/**
	 * Sends message to other client
	 * @param {String} to 
	 * @param {Buffer} content 
	 * @returns {Promise}
	 */
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
				that.#socket.emit("message", message.export(), resolve);
				resolve();
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