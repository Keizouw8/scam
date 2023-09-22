const socketio = require("socket.io");
const net = require("net");

class Server{
    #io;

    constructor(server){
        if(!(server instanceof net.Server)) throw new TypeError("Expected parameter of type net.Server");
        this.#io = socketio(server);
    }
}

module.exports = Server;