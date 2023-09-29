#! /usr/bin/env node

const package = require('../package.json');
const { program } = require("commander");
const server = require("./server");
const client = require("./client");
const crypto = require("crypto");
const fs = require("fs");

program
	.name("scam")
	.version(package.version)
	.option("-s, --server <port>", "create a server")
	.option("-c, --client <url>", "create a client")
	.option("--private <path>")
	.option("--public <path>")
	.option("--save-messages")
	.option("-g, --gen-keys", "auto-generate keys");

program.parse();

var options = program.opts();
if(options.private) options.private = fs.readFileSync(options.private);
if(options.public) options.public = fs.readFileSync(options.public);
if(options.genKeys){
	var keys = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
	options.private = keys.privateKey.export({type: "pkcs1", format: "pem"});
	options.public = keys.publicKey.export({type: "pkcs1", format: "pem"});
}

if(options.server) return server(options);
if(options.client) return client(options);

console.error("error: server or client not defined")