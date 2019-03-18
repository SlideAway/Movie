var forge = require('node-forge');
var plaintext = "Hello world hello world";
var pki = forge.pki;
var rsa = forge.pki.rsa;

var keypair = rsa.generateKeyPair({bits: 1024, e: 0x10001});
var publicKey = keypair.publicKey;
var privateKey = keypair.privateKey;
var pubPem = forge.pki.publicKeyToPem(publicKey);
var privPem = forge.pki.privateKeyToPem(privateKey);

console.log('Public key: \n'+pubPem);
console.log('Private key: \n'+privPem);
console.log();
var passkey = process.argv;

// PEM에서 개인키 읽어오기
var privateKey1 = pki.privateKeyFromPem(privPem);
console.log('Pem to Private key: \n'+pki.privateKeyToPem(privateKey1));

// 개인키를 ASN.1으로 출력
var privAsn1 = pki.privateKeyToAsn1(privateKey);
// convert an ASN.1 PrivateKeyInfo or RSAPrivateKey to a Forge private key
var privateKey2 = pki.privateKeyFromAsn1(privAsn1);
console.log('ASN.1 to Private key: \n'+pki.privateKeyToPem(privateKey2));

// ASN.1 개인키를 PrivateKeyInfo로 wrapping한 후에 pem으로 변환
// wrap an RSAPrivateKey ASN.1 object in a PKCS#8 ASN.1 PrivateKeyInfo
var privateKeyInfo = pki.wrapRsaPrivateKey(privAsn1);
// convert a PKCS#8 ASN.1 PrivateKeyInfo to PEM
var pem = pki.privateKeyInfoToPem(privateKeyInfo);
console.log('Private key Info: \n'+pem);

// PrivateKeyInfo를 패스워드 암호화/복호화
// encrypts a PrivateKeyInfo and outputs an EncryptedPrivateKeyInfo
var encryptedPrivateKeyInfo = pki.encryptPrivateKeyInfo(
  privateKeyInfo, passkey, {
    algorithm: 'aes256', // 'aes128', 'aes192', 'aes256', '3des'
  });


// decrypts an ASN.1 EncryptedPrivateKeyInfo
var privateKeyInfo1 = pki.decryptPrivateKeyInfo(
  encryptedPrivateKeyInfo, passkey);
console.log('Private key Info (enc/dec): \n'+pki.privateKeyInfoToPem(privateKeyInfo1));

// converts an EncryptedPrivateKeyInfo to PEM
var pem = pki.encryptedPrivateKeyToPem(encryptedPrivateKeyInfo);
console.log('EncryptedPrivateKeyInfo 1: \n'+pem);

// converts a PEM-encoded EncryptedPrivateKeyInfo to ASN.1 format
var encryptedPrivateKeyInfo = pki.encryptedPrivateKeyFromPem(pem);

// wraps and encrypts a Forge private key and outputs it in PEM format
var pem = pki.encryptRsaPrivateKey(privateKey, passkey);
console.log('EncryptedPrivateKeyInfo 2: \n'+pem);

// decrypts a PEM-formatted, encrypted private key
var privateKey2 = pki.decryptRsaPrivateKey(pem, passkey);
console.log('Pem to Private key 2: \n'+pki.privateKeyToPem(privateKey2));

// sets an RSA public key from a private key
var publicKey1 = pki.setRsaPublicKey(privateKey.n, privateKey.e);
console.log('Public key from Private key: \n'+pki.publicKeyToPem(publicKey1));
