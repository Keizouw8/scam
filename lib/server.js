import { Server as socketio } from "socket.io";
import Message from "./message.js";
import hash from "object-hash";
import events from "events";
import crypto from "crypto";
import User from "./s_user.js";
import net from "net";

export default class Server{
    #io;
    #saveMessages;
    #emitter = new events.EventEmitter();
	users = {};
	#idFunction = function(key){
        return hash(key).substring(0, 8);
    }

    /**
     * scam server object
     * @constructor
     * @param {net.Server} server 
     * @param {Object} options
     * @param {Boolean} options.saveMessages 
     */
    constructor(server, options){
		if(!(server instanceof net.Server)) throw new TypeError("Expected parameter of type net.Server");
        
        this.#io = new socketio(server, {
			path: "/scam/",
            ...options
        });
        
        this.#saveMessages = options?.saveMessages || false;
		var that = this;
		
        this.#io.on("connection", function(socket){
            var key = socket.handshake.auth.key;
			var user = new User(socket, key, that.#idFunction(key));
            that.users[user.id] = user;
            
			var puzzle = crypto.randomBytes(20);
			socket.emit("authenticate", puzzle, function(answer){
				user.verify(puzzle, answer);
            });
            socket.on("userkey", function(user, callback){
                callback(that.users?.[user]?.key?.export({type: "pkcs1", format: "pem"}));
            });
            socket.on("message", function(message, callback){
                if(typeof callback != "function"){ callback = function(){}; }
                if(!(message?.from == user?.id && user?.id)) return callback("unauthenticated");
                var msg = Message.import(message);
                callback(false);
                if(Object.keys(that.users).includes(msg.to)) return that.users[msg.to].socket.emit("message", msg.export());
                if(that.#saveMessages) that.#emitter.on("connection", function(user){
                    if(user.id == msg.to) that.users[msg.to].socket.emit("message", msg.export());
                });
            });

            socket.on("disconnect", function(){
                delete that.users[user.id];
            });
			
            that.#emitter.emit("connection", user);
        });
    }

	/**
	 * Event listner
	 * @param {String} event
	 * @param {function()} callback
	 */
	on(){ this.#emitter.on(...arguments); }

    /**
     * Set ID function used by the backend (hash by default)
     * @param {function(String): String} idFunction 
     */
    setIdFunction(idFunction){ this.#idFunction = idFunction; }
}