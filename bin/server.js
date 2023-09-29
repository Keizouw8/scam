const { Server } = require("../");
const https = require("https");
const http = require("http");
const fs = require("fs");

module.exports = function(options){
    var server;
	if(options.private && options.public){
		server = https.createServer(app, {
			key: fs.readFileSync(options.private),
			cert: fs.readFileSync(options.public)
		});
	}else{
		server = http.createServer(app);
	}

	var port = parseInt(options.server);
	server.listen(port, console.log("Listening on port", port));

	var scam = new Server(server);
	scam.on("connection", function(user){
		console.log("User joined with id:", user.id);
	});
}

function app(_, res){
	res.end("scam messaging server");
}