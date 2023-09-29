const crypto = require("crypto");
const { Client } = require("../");

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

		console.log("connected to server with id", client.id);
	});
}