module.exports = function(options){
    if(!(options.private && options.public))
		return console.error("error: public or private key not defined. use --private and --public to configure");
}