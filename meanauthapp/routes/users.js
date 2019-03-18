const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const User = require('../models/user');
const forge = require('node-forge');
const fs = require('fs');

const pki = forge.pki;

const caCertPem = fs.readFileSync('caCert.pem', 'utf8');
const caPrivateKeyPem = fs.readFileSync('caPrivateKey.pem', 'utf8');
const caCert = pki.certificateFromPem(caCertPem);
const caPrivateKey = pki.privateKeyFromPem(caPrivateKeyPem);

// Authenticate 로그인 기능
router.post('/authenticate', (req, res, next) => {
  const username = req.body.username; //유저 인터페이스를 만들때 유저네임 사용
  const password = req.body.password; //유저 인터페이스를 만들때 유저페스워드 사용

  User.getUserByUsername(username, (err, user) => { //데이터베이스에서 사용자확인한후 정보 user에다 저장
    if (err) throw err;
    if (!user) { //유저가 없을시
      return res.json({
        success: false,
        msg: 'User not found'
      });
    }

    User.comparePassword(password, user.password, (err, isMatch) => {
      if (err) throw err;
      if (isMatch) {
        const ptoken = 'JWT ' + jwt.sign({
          data: user
        }, config.secret, { //서버가 가진 비밀키로 서명, jwt.sign이것으로 토큰생성
          expiresIn: 604800 // 1 week 유효기간 1주일
        });

        const stoken = 'JWT ' + jwt.sign({
          data: ptoken
        }, config.secret, {
          noTimestamp: true
        });
        res.json({ //응답을 json형식으로 , 데이터를 기술
          success: true,
          ptoken: ptoken,
          stoken: stoken,
          user: { // 패스워드를 제외한 나머지 필요한 정보를 리턴
            id: user._id,
            name: user.name,
            username: user.username,
            email: user.email
          }
        });
      } else {
        return res.json({
          success: false,
          msg: 'Wrong password'
        });
      }
    });
  });
});

// Profile
router.get('/profile', passport.authenticate('jwt', {
  session: false
}), (req, res, next) => {
  const ptoken = req.headers.authorization;
  const currT = req.headers.ctime;
  const auth = req.headers.auth;
  const stoken = 'JWT ' + jwt.sign({
    data: ptoken
  }, config.secret, {
    noTimestamp: true
  });
  var md = forge.md.sha256.create();
  md.update(currT+stoken);
  const auth2 = md.digest().toHex();
  const serverTime = new Date().getTime();
  const diff = serverTime - currT;
  console.log('수신한 일회용 인증 : ' + auth);
  console.log("계산한 일회용 인증 : " + auth2);
  console.log("시간차이 : " + diff);
  if (auth == auth2 && diff < 100000) {
    res.json({
      user: req.user
    });
  }
});
//Encrypted message
router.get('/encrypt', passport.authenticate('jwt', {
  session: false
}), (req, res, next) => {
  const ptoken = req.headers.authorization;
  const currT = req.headers.ctime;
  const encrypted = req.headers.enc;
  const stoken = 'JWT ' + jwt.sign({
    data: ptoken
  }, config.secret, {
    noTimestamp: true
  });

  var md = forge.md.sha256.create();
  md.update(currentTime + stoken);
  var auth = forge.util.bytesToHex(md.digest());

  var key = forge.util.hexToBytes(auth);
  var encrypted1 = forge.util.hexToBytes(encrypted);
  var decipher = forge.cipher.createDecipher('AES-ECB', key);
  decipher.start();
  decipher.update(forge.util.createBuffer(encrypted1, 'binary'));
  decipher.finish();
  var decrypted = decipher.output;
  console.log('Decrypted ' + decrypted);
  res.json({
    decrypted: decrypted
  });
});

// Validate
router.get('/validate', (req, res, next) => {
  res.send('검증');
});

router.post('/register', (req, res, next) => {
  let newUser = new User({
    name: req.body.name,
    email: req.body.email,
    username: req.body.username,
    password: req.body.password
  });

  User.addUser(newUser, (err, user) => {
    if (err) {
      res.json({
        success: false,
        msg: 'Failed to register user'
      });
    } else {
      res.json({
        success: true,
        msg: 'User registered'
      });
    }
  });
});

router.post('/cert', (req, res, next) => {
  var cert = pki.createCertificate();
  cert.publicKey = pki.publicKeyFromPem(req.body.publicKey);
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
  var userAttrs = [{
    name: 'commonName',
    value: req.body.common
  }, {
    name: 'countryName',
    value: req.body.country
  }, {
    shortName: 'ST',
    value: req.body.state
  }, {
    name: 'localityName',
    value: req.body.locality
  }, {
    name: 'organizationName',l
    value: req.body.organization
  }, {
    shortName: 'OU',
    value: req.body.orgUnit
  }];
  cert.setSubject(userAttrs);
  console.log(userAttrs);
  var caAttrs = [{
    name: 'commonName',
    value: caCert.subject.getField('CN').value
  }, {
    name: 'countryName',
    value: caCert.subject.getField('C').value
  }, {
    shortName: 'ST',
    value: caCert.subject.getField('ST').value
  }, {
    name: 'localityName',
    value: caCert.subject.getField('L').value
  }, {
    name: 'organizationName',
    value: caCert.subject.getField('O').value
  }, {
    shortName: 'OU',
    value: caCert.subject.getField('OU').value
  }];
  console.log(caAttrs);
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
      value: 'http://example.org/'
    }, {
      type: 7, // IP
      ip: '127.0.0.1'
    }]
  }, {
    name: 'subjectKeyIdentifier'
  }]);

  cert.sign(caPrivateKey);

  return res.json({
    success:true,
    cert:pki.certificateToPem(cert),
    caCert:caCertPem
  });
});

module.exports = router;
