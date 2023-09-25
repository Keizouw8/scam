const socketio = require("socket.io");
const events = require("events");
const crypto = require("crypto");
const User = require("./s_user");
const net = require("net");

class Server{
    #io;
    #saveMessages;
    #emitter = new events.EventEmitter();
	#users = [];
	
    constructor(server, options){
		if(!(server instanceof net.Server)) throw new TypeError("Expected parameter of type net.Server");
        
        this.#io = socketio(server, {
			path: "/scam/",
            ...options
        });
        
        this.#saveMessages = options?.saveMessage || false;
		var that = this;
		
        this.#io.on("connection", function(socket){
			var user = new User(socket, socket.handshake.auth.key);
			var puzzle = crypto.randomBytes(20);
			socket.emit("authenticate", puzzle, function(answer){
				if(user.verify(puzzle, answer)) user.setVerified(true);
			});
			
            that.#emitter.emit("connection", user);
        });
    }

	on(){ this.#emitter.on(...arguments); }
}

module.exports = Server;