import { Server } from "../index.js";
import kleur from "kleur";
import https from "https";
import http from "http";

export default function(options){
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
	server.listen(port, console.log(kleur.bold().blue("=== SCAM:"), kleur.bold().italic().blue('"Securest"'), kleur.bold().blue("Messaging ===") + "\n" + kleur.grey().italic(`Listening on port ${port}`)));

	var scam = new Server(server);
	scam.on("connection", function(user){
		console.log(kleur.bold().magenta("User joined with id:"), kleur.italic(user.id));
	});
}

function app(_, res){
	res.end("scam messaging server");
}