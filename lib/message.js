import crypto from "crypto";

export default class Message{
    to;
    from;
    pubkey;
    content;
    signature;

    /**
     * Message object
     * @constructor
     * @param {String} from
     * @param {String} to
     * @param {crypto.KeyObject} pubkey 
     * @param {Buffer} content 
     * @param {Buffer} signature=
     */
    constructor(to, from, pubkey, content, signature){
        this.to = to;
        this.from = from;
        this.pubkey = pubkey;
        this.content = content;
        this.signature = signature;
    }

    /**
     * Paramterized constructor
     * @param {String} to
     * @param {String} from
     * @param {crypto.KeyObject} privkey - Sender's private key
     * @param {crypto.KeyObject} pubkey - Target's public key
     * @param {Buffer} content
     * @returns {Message}
     */
    static new(to, from, privkey, pubkey, content){
        var content = crypto.publicEncrypt(pubkey, content);
        return new Message(
            to,
            from,
            crypto.createPublicKey(privkey),
            content,
            crypto.sign("sha512", content, privkey)
        );
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
    static import(from){
        return new Message(from.to, from.from, crypto.createPublicKey(from.pubkey), from.content, from.signature);
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