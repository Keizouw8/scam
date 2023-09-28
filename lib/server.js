const socketio = require("socket.io");
const Message = require("./message");
var hash = require("object-hash");
const events = require("events");
const crypto = require("crypto");
const User = require("./s_user");
const net = require("net");

class Server{
    #io;
    #saveMessages;
    #emitter = new events.EventEmitter();
	users = {};
	#idFunction = hash;

    /**
     * scam server object
     * @constructor
     * @param {net.Server} server 
     * @param {Object} options
     * @param {Boolean} options.saveMessages 
     */
    constructor(server, options){
		if(!(server instanceof net.Server)) throw new TypeError("Expected parameter of type net.Server");
        
        this.#io = socketio(server, {
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
                if(message?.from != user?.id || !user?.id) return callback(false, "unauthenticated");
                var msg = Message.import(message);
                socket.emit("message", msg.export());
                if(Object.keys(that.users).includes(msg.to)) return that.users[msg.to].socket.emit("message", msg.export());
                if(that.#saveMessages) that.#emitter.on("connection", function(user){
                    if(user.id == msg.to) that.users[msg.to].socket.emit("message", msg.export());
                });
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

module.exports = Server;