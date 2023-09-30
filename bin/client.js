const crypto = require("crypto");
const { Client } = require("../");
const kleur = require("kleur");

const readline = require("readline").createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: false
});

var characters;
import("is-unicode-supported").then(function(unicode){
	characters = {
		check: unicode ? kleur.green("✔") : kleur.green("√"),
		warning: unicode ? kleur.yellow("⚠") : kleur.yellow("!!")
	};
});

module.exports = function(options){
	if(!(options.private && options.public))
		return console.error("error: public or private key not defined. use --private and --public to configure");
	
	var auth = {
		privateKey: crypto.createPrivateKey(options.private),
		publicKey: crypto.createPublicKey(options.public)
	};
	
	var client = new Client(options.client, { auth });

	client.on("verified", function(verified){
		if(!verified){
			console.error("unable to verify");
			process.exit();
		}

		console.log(kleur.blue().bold("Connected to server with id:"), kleur.italic(client.id), `\n${kleur.bold().green("<to>:")} ${kleur.italic("<message>")}`);

		function request(){
			readline.question("", function(res){
				if(!res.includes(": ")){
					console.log(`${characters.warning} ${kleur.yellow("Incorrect message format")}\n${kleur.bold().green("<to>:")} ${kleur.italic("<message>")}`);
					return request();
				}

				var message = res.slice(res.indexOf(": ") + 1).trim();
				var to = res.slice(0, res.indexOf(": ")).trim();
			
				client.send(to, Buffer.from(message));
				request();
			});
		}

		request();
	});

	client.on("message", function(msg){
		console.log(msg.verify() ? characters.check : characters.warning, kleur.green().bold(msg.from) + kleur.green().bold(`:`), msg.decrypted.toString())
	});
}