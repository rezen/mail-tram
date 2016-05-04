## mail-tram
[![NPM Version][npm-image]][npm-url] <br />

## About
Make it simple to send emails with templates!

## Install
`npm install mail-tram`


## Example
```js
'use strict';

const nunjucks = require('nunjucks');
const MailTram = require('mail-tram');

nunjucks.configure(__dirname);

const mailer = MailTram({
  driver: 'smtp',
  host: 'smtp.gmail.com',
  port: 465,
  username: 'bobby.bobby@gmail.com',
  password: '*********'
}, nunjucks);

function onSent(err, res) {
  console.error('ERRA', err);
  console.info(res);
}

mailer.draft('email.html', {user: 'Bobby!'}, (err, msg) => {
  msg
  .to('me@gmail.com')
  .from('bobby.bobby@gmail.com')
  .subject('Mail Test 2');

  mailer.send(msg, onSent);
});
```

[npm-image]: https://img.shields.io/npm/v/mail-tram.svg
[npm-url]: https://npmjs.org/package/mail-tram

