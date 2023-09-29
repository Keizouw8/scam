#! /usr/bin/env node

const package = require('../package.json');
const { program } = require("commander");
const server = require("./server");
const client = require("./client");

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

if(options.server) return server(options);
if(options.client) return client(options);

console.error("error: server or client not defined")