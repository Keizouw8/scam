const { Server } = require("../");
const kleur = require("kleur");
const https = require("https");
const http = require("http");

module.exports = function(options){
    var server;
	if(options.private && options.public){
		server = https.createServer(app, {
			key: options.private,
			cert: options.public
		});
	}else{
		server = http.createServer(app);
	}

	var port = parseInt(options.server);
	server.listen(port, console.log(kleur.grey().italic(`Listening on port ${port}`)));

	var scam = new Server(server);
	scam.on("connection", function(user){
		console.log(kleur.bold().blue("User joined with id:"), kleur.italic(user.id));
	});
}

function app(_, res){
	res.end("scam messaging server");
}