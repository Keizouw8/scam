#! /usr/bin/env node

const { Server, Client } = require("../");
const package = require('../package.json');
const { program } = require("commander");
const https = require("https");
const http = require("http");
const fs = require("fs");

program
	.name("scam")
	.version(package.version)
	.option("-s, --server <port>", "create a server")
	.option("-c, --client <url>", "create a client")
	.option("--private <path>")
	.option("--public <path>")
	.option("--save-messages");

program.parse();
var options = program.opts();

if(options.server){
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
	server.listen(port);

	var scam = new Server(server);

	return;
}

if(options.client){
	if(!(options.private && options.public))
		return console.error("error: public or private key not defined. use --private and --public to configure")
	return;
}

console.error("error: server or client not defined")

function app(_, res){
	res.write("Hello World!");
}