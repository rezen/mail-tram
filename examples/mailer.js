'use strict';

const nunjucks = require('nunjucks');
const MailTram = require('../index');

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

const message = mailer.message();

message
  .to('you.com')
  .from('bobby.bobby@gmail.com')
  .subject('Mail Test 1')
  .text('Testing out this email stuff');

mailer.send(message, onSent);


mailer.draft('email.html', {user: 'Bobby!'}, (err, msg) => {
  msg
  .to('me@gmail.com')
  .from('bobby.bobby@gmail.com')
  .subject('Mail Test 2');

  mailer.send(msg, onSent);
});