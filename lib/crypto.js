import crypto from "crypto";

/**
 * Encrypt infinite length content
 * @param {crypto.KeyObject} PublicKey 
 * @param {Buffer} content 
 * @returns {Buffer}
 */
function encrypt(key, buf){
    var encrypted = Buffer.alloc(0);
    for(var i = 0; i < buf.length; i += 214){
        encrypted = Buffer.concat([encrypted, crypto.publicEncrypt(key, buf.slice(i, i+214))]);
    }
    return encrypted;
}

/**
 * Decrypt infinite length content
 * @param {crypto.KeyObject} PrivateKey 
 * @param {Buffer} content 
 * @returns {Buffer}
 */
function decrypt(key, buf){
    var decrypted = Buffer.alloc(0);
    for(var i = 0; i < buf.length; i += 256){
        decrypted = Buffer.concat([decrypted, crypto.privateDecrypt(key, buf.slice(i, i+256))]);
    }
    return decrypted;
}

export { encrypt, decrypt };