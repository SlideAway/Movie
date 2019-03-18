var forge = require('node-forge');
var fs = require('fs');
var pki = forge.pki;

// CA 개인키와 인증서를 파일에서 읽어오기
var caCertPem = fs.readFileSync('caCert.pem', 'utf8');
var caPrivateKeyPem = fs.readFileSync('caPrivateKey.pem', 'utf8');
var caCert = pki.certificateFromPem(caCertPem);
var caPrivateKey = pki.privateKeyFromPem(caPrivateKeyPem);
var verified = caCert.verify(caCert);
console.log('CA인증서 읽어와서 검증: '+verified);

// ------------------------------
// 사용자 인증서 생성 및 검증 (CA인증서로 서명)
var keys = pki.rsa.generateKeyPair(2048);
var cert = pki.createCertificate();

// 사용자 개인키 파일 저장
console.log(pki.privateKeyToPem(keys.privateKey));
fs.writeFileSync("userPrivateKey.pem", pki.privateKeyToPem(keys.privateKey));
console.log('사용자 개인키 저장 - userPrivateKey.pem \n');

cert.publicKey = keys.publicKey;
cert.serialNumber = '01';
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
var attrs = [{
  name: 'commonName',   // shortName: 'CN',
  value: 'example.org'
}, {
  name: 'countryName',   // shortName: 'C',
  value: 'US'
}, {
  shortName: 'ST',
  value: 'Virginia'
}, {
  name: 'localityName',   // shortName: 'L',
  value: 'Blacksburg'
}, {
  name: 'organizationName',   // shortName: 'O',
  value: 'Test'
}, {
  shortName: 'OU',
  value: 'Test'
}];
cert.setSubject(attrs);

var caAttrs = [{
  name: 'commonName', // shortName: 'CN',
  value: caCert.subject.getField('CN').value
}, {
  name: 'countryName', //  shortName: 'C',
  value: caCert.subject.getField('C').value
}, {
  name: 'stateOrProvinceName',  //  shortName: 'ST',
  value: caCert.subject.getField('ST').value
}, {
  name: 'localityName',  // shortName: 'L',
  value: caCert.subject.getField('L').value
}, {
  name: 'organizationName', //  shortName: 'O',
  value: caCert.subject.getField('O').value
}, {
  name: 'organizationalUnitName', //  shortName: 'OU',
  value: caCert.subject.getField('OU').value
}];
cert.setIssuer(caAttrs);

cert.setExtensions([{
  name: 'basicConstraints',
  cA: true
}, {
  name: 'keyUsage',
  keyCertSign: true,
  digitalSignature: true,
  nonRepudiation: true,
  keyEncipherment: true,
  dataEncipherment: true
}, {
  name: 'extKeyUsage',
  serverAuth: true,
  clientAuth: true,
  codeSigning: true,
  emailProtection: true,
  timeStamping: true
}, {
  name: 'nsCertType',
  client: true,
  server: true,
  email: true,
  objsign: true,
  sslCA: true,
  emailCA: true,
  objCA: true
}, {
  name: 'subjectAltName',
  altNames: [{
    type: 6, // URI
    value: 'http://example.org/webid#me'
  }, {
    type: 7, // IP
    ip: '127.0.0.1'
  }]
}, {
  name: 'subjectKeyIdentifier'
}]);

// 사용자 인증서 생성
cert.sign(caPrivateKey); // CA 개인키로 서명
console.log('사용자 인증서 생성');
console.log(pki.certificateToPem(cert));

// 사용자 인증서 검증
var verified = caCert.verify(cert);
console.log('사용자 인증서 검증: '+verified);

// 사용자 인증서 저장
fs.writeFileSync("cert.pem", pki.certificateToPem(cert));
console.log('사용자 인증서 저장 - cert.pem');
