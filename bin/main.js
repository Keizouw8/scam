#! /usr/bin/env node

import { program } from "commander";
import server from "./server.js";
import client from "./client.js";
import fs from "fs";

program
	.name("scam")
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

if(options.server){
	server(options);
}else if(options.client){
	client(options);
}else{
	console.error("error: server or client not defined");
}
