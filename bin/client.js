import { Client } from "../index.js";
import isUnicodeSupported from "is-unicode-supported";
import stringWidth from "string-width";
import crypto from "crypto";
import rdl from "readline";
import kleur from "kleur";

var unicode = isUnicodeSupported();
var characters;
characters = {
	check: unicode ? kleur.green("✔") : kleur.green("√"),
	warning: unicode ? kleur.yellow("⚠") : kleur.yellow("!!"),
	error: unicode ? kleur.red("✖") : kleur.red("×")
};

var frames = [
	"⠋",
	"⠙",
	"⠹",
	"⠸",
	"⠼",
	"⠴",
	"⠦",
	"⠧",
	"⠇",
	"⠏"
];

String.prototype.insert = function(i, string){
	return this.slice(0, i) + string + this.slice(i);
};

export default function(options){
	if(options.genKeys){
		var keys = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
		options.private = keys.privateKey.export({type: "pkcs1", format: "pem"});
		options.public = keys.publicKey.export({type: "pkcs1", format: "pem"});
	}
	
	if(!(options.private && options.public))
		return console.error("error: public or private key not defined. use --private and --public to configure");
	
	var auth = {
		privateKey: crypto.createPrivateKey(options.private),
		publicKey: crypto.createPublicKey(options.public)
	};

	console.clear();
	process.stdout.write('\u001B[?25l');
	console.log(kleur.bold().blue(`=== SCAM: ${kleur.italic('"Securest"')} Messaging ===`) + "\n" + kleur.italic().gray("  Connecting to server"));
	
	var i = 0;
	spinner();
	
	var interval = setInterval(spinner, 80);
	function spinner(){
		rdl.cursorTo(process.stdout, 0, 1);
		process.stdout.write(frames[i]);
		i = (i + 1) % frames.length;
	}

	var client = new Client(options.client, { auth });

	client.on("verified", function(verified){
		var focus = "to";
		var text = { to: "", message: "" }
		var cursorPos = 0;
		var offset = 0;
		var error = false;
		var messages = [];

		clearInterval(interval);
		rdl.cursorTo(process.stdout, 0, 1);
		if(!verified){
			console.clear();
			console.error(characters.error, kleur.bold().red("Unable to verify"));
			process.exit();
		}

		rdl.emitKeypressEvents(process.stdin);
		process.stdin.setRawMode(true);
		process.stdin.on("keypress", function(char, key){
			if(key.ctrl && key.name == "q"){
				console.clear();
				process.exit();
			}else if(key.ctrl && key.name == "t"){
				focus = "to";
				offset = 0;
				cursorPos = 0;
			}else if(key.ctrl && key.name == "s"){
				focus = "message";
				offset = 0;
				cursorPos = 0;
			}else if(key.name == "return"){
				if(focus == "to"){
					focus = "message";
					offset = 0;
					cursorPos = 0;
				}else{
					client.send(text.to, Buffer.from(text.message)).catch(function(err){
						error = err.toString().split("\n")[0];
					}).then(function(err, succ){
						if(err){
							error = err.toString().split("\n")[0];
						}else{
							text.message = "";
							cursorPos = 0;
							offset = 0;
						}
						draw();
					});
				}
			}else if(key.name == "backspace"){
				text[focus] = text[focus].slice(0, Math.max(0, cursorPos + offset - 1)) + text[focus].slice(cursorPos + offset);
				cursorPos = Math.max(0, cursorPos-1);
			}else if(key.name == "left"){
				cursorPos--;
			}else if(key.name == "right"){
				if(cursorPos + offset < text[focus].length) cursorPos++;
			}else if(key.name == "up"){
				offset = 0;
				cursorPos = 0;
			}else if(key.name == "down"){
				cursorPos = Math.min(process.stdout.columns - focus.length - 2, text[focus].length);
				offset = text[focus].length - process.stdout.columns + focus.length + 2;
			}else if(char && char != "\t"){
				text[focus] = text[focus].insert(cursorPos + offset, char);
				cursorPos += stringWidth(char);
			}

			if(cursorPos > process.stdout.columns - focus.length - 2){
				offset++;
				cursorPos--;
			}

			if(cursorPos < 0){
				if(offset > 0) offset--;
				cursorPos = 0;
			}
			draw();
		});

		process.stdout.on("resize", draw);

		draw();

		function draw(){
			console.clear();
			process.stdout.write('\u001B[?25l');

			var position = process.stdout.rows - 4;
			var index = messages.length - 1;
			while(position > 2 && index >= 0){
				position -= Math.ceil(stringWidth(messages[index]) / process.stdout.columns);
				rdl.cursorTo(process.stdout, 0, position);
				console.log(messages[index]);
				index--;
			}

			rdl.cursorTo(process.stdout, 0, process.stdout.rows - 1);
			var instructions = "^Q: Quit, ^T: Toggle To, ^S: Toggle Message";
			for(var i = instructions.length; i < process.stdout.columns; i++) instructions += " ";
			process.stdout.write(kleur.bgWhite().black(instructions));

			rdl.cursorTo(process.stdout, 0, process.stdout.rows - 2);
			process.stdout.write(kleur.bold().green("message: ") + formatString(focus == "message" ? offset : 0, text.message));

			rdl.cursorTo(process.stdout, 0, process.stdout.rows - 3);
			process.stdout.write(kleur.bold().italic().green("to: ") + formatString(focus == "to" ? offset : 0, text.to));

			var line = "";
			for(var i = 0; i < process.stdout.columns; i++) line += "―";
			rdl.cursorTo(process.stdout, 0, process.stdout.rows - 4);
			process.stdout.write(line);
			rdl.cursorTo(process.stdout, 0, 2);
			process.stdout.write(line);

			rdl.cursorTo(process.stdout, 0, 1);
			rdl.clearLine(process.stdout, 1);
			process.stdout.write(kleur.magenta().bold("Connected with id: ") + kleur.italic(client.id));

			rdl.cursorTo(process.stdout, 0, 0);
			rdl.clearLine(process.stdout, 0);
			process.stdout.write(kleur.bold().blue(`=== SCAR: ${kleur.italic('"Securest"')} Messaging ===`));

			if(error){
				rdl.cursorTo(process.stdout, process.stdout.columns - error.length - 4, 0);
				process.stdout.write(kleur.bold().bgRed(` ${characters.error} ${error} `));
			}

			rdl.cursorTo(process.stdout, cursorPos + focus.length + 2, process.stdout.rows-2-+(focus == "to"));
			error = false;
			process.stdout.write('\u001B[?25h');
		}

		client.on("message", function(msg){
			var verified = msg.verify();
			var message = "";
			if(verified){
				message += kleur.green().bold(`${characters.check} ${msg.from}${msg.from == client.id ? " (you)" : ""}: `);
			}else{
				message += kleur.yellow().bold(`${characters.warning} ${msg.from}: `);
			}
			message += msg.decrypted.toString();
			messages.push(message);

			if(text.message == "") text.to = msg.from;
			draw();
		});

		function formatString(offset, string){
			return string.substring(offset, offset + process.stdout.columns - focus.length - 2);
		}
	});
}