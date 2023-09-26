const crypto = require("crypto");

class Message{
    from;
    to;
    pubkey;
    content;
    signature;

    /**
     * @param {Object}
     * @returns {Message}
     */
    import(){}

    /**
     * Paramaterized constructor
     * @param {String} from
     * @param {String} to
     * @param {crypto.KeyObject} pubkey 
     * @param {Buffer} content 
     * @param {Buffer} signature
     */
    from(from, to, pubkey, content, signature){
        this.to = to;
        this.from = from;
        this.pubkey = pubkey;
        this.content = content;
        this.signature = signature;
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
        return crypto.verify("sha256", this.content, this.pubkey, this.signature);;
    }
}

module.exports = Message;