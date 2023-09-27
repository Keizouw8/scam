const crypto = require("crypto");

class Message{
    to;
    from;
    pubkey;
    content;
    signature;

    /**
     * Message object
     * @constructor
     * @param {String} to
     * @param {String} from
     * @param {crypto.KeyObject} privkey
     * @param {Buffer} content
     */
    constructor(to, from, privkey, content){
        this.to = to;
        this.from = from;
        this.pubkey = crypto.createPublicKey(privkey);
        this.content = content;
        this.signature = crypto.sign("sha512", content, privkey);
    }

    /**
     * Copy constructor from Object
     * @param {Object} from
     * @param {String} from.to
     * @param {String} from.from
     * @param {crypto.KeyObject} from.pubkey
     * @param {Buffer} from.content;
     * @param {Buffer} from.signature
     * @returns {Message}
     */
    import(from){
        return this.from(from.to, from.from, from.pubkey, from.content, from.signature);
    }

    /**
     * Paramaterized constructor
     * @param {String} from
     * @param {String} to
     * @param {crypto.KeyObject} pubkey 
     * @param {Buffer} content 
     * @param {Buffer} signature
     * @returns {Message}
     */
    from(from, to, pubkey, content, signature){
        var message = Message;
        message.to = to;
        message.from = from;
        message.pubkey = pubkey;
        message.content = content;
        message.signature = signature;
        return message;
    }
    
    /**
     * Decrypts content given key
     * @param {crypto.KeyObject} privkey 
     * @returns {Buffer}
     */
    decrypt(privkey){
        return crypto.privateDecrypt(privkey, this.content);
    }

    /**
     * Verifies that signature matches content
     * @returns {Boolean}
     */
    verify(){
        return crypto.verify("sha512", this.content, this.pubkey, this.signature);;
    }

    /**
     * Exports Message as object
     * @returns {Object}
     */
    export(){
        return {
            to: this.to,
            from: this.from,
            pubkey: this.pubkey.export({type: "pkcs1", format: "pem"}),
            content: this.content,
            signature: this.signature
        }
    }
}

module.exports = Message;