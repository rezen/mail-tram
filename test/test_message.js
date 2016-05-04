'use strict';

const sinon   = require('sinon');
const assert  = require('assert');
const Message = require('../message');

describe('Message', () => {
  var message;
  var email;

  beforeEach(() => {
    email = 'me@me.com'
    message = new Message();
  });

  describe('#constructor', () => {
    it('Setup the message data object', () => {
      assert.equal(typeof message.d, 'object');
    });
  });

  describe('#to', () => {
    it('Adds the email to the to list', () => {
      message.to(email);
      assert(message.d.to.has(email));
    });

    it('Handles setting of names', () => {
      const name = 'Bob';
      const output = `"${name}" <${email}>`;
      message.to(email, name);
      assert(message.d.to.has(output));
    });

    it('Adds multiple values', () => {
      message.to('me1@me.com');
      message.to('me2@me.com');
      message.to('me3@me.com');
      assert(message.d.to.size, 3);
    });

    it('Is chainable', () => {
      assert.doesNotThrow(() => {
        message.to('me1@me.com').to('me2@me.com').to('me3@me.com');
      });
    });

    it('Only adds unique values', () => {
      message.to('me1@me.com');
      message.to('me2@me.com');
      message.to('me3@me.com');
      message.to('me3@me.com');
      message.to('me3@me.com');
      message.to('me3@me.com');
      assert(message.d.to.size, 3);
    });
  });


  describe('#text', () => {
    it('Sets the text to the text!', () => {
      const text = 'lol-cat';
      message.text(text);
      assert.equal(message.d.text, text);
    });

    it('Is chainable', () => {
      assert.doesNotThrow(() => {
         message
         .text('w00t')
         .to('me1@me.com')
         .to('me2@me.com');
      });
    });

    it('If starts with <html ... set to html', () => {
      const text = '<html><body>lol-cat</body>';
      message.text(text);
      assert.equal(message.d.text, '');
      assert.equal(message.d.html, text);
    });

    it('If starts with <!DOCTYPE ... set to html', () => {
      const text = '<!DOCTYPE html><html><body>lol-cat</body>';
      message.text(text);
      assert.equal(message.d.text, '');
      assert.equal(message.d.html, text);
    });
  });


  describe('#priority', () => {
    it('You can set to high or low!', () => {
      let level = 'high';
      message.priority(level);
      assert.equal(message.d.priority, level);
      level = 'low';
      message.priority(level);
      assert.equal(message.d.priority, level);
    });

    it('Is chainable', () => {
      assert.doesNotThrow(() => {
         message
         .priority()
         .to('me1@me.com')
         .to('me2@me.com');
      });
    });

    it('Will not let you set invalid priorities', () => {
      let level = 'cats';
      message.priority(level);
      assert.notEqual(message.d.priority, level);
    });
  });


  describe('#attach', () => {
    it('Add attachment to the set!', () => {
      const filename   = 'lolcat-1.txt';
      const content    = 'meow';
      const attachment = {filename, content};
      message.attach(filename, content);
      const attachments = Array.from(message.d.attachments.values());
      assert.deepEqual(attachments[0], attachment);
    });

    it('You can pass in an object', () => {
      const filename   = 'lolcat-2.txt';
      const content    = 'meow-2';
      const attachment = {filename, content};
      message.attach(attachment);
      assert(message.d.attachments.has(attachment));
    });

    it('Is chainable', () => {
      assert.doesNotThrow(() => {
         message
         .attach('a.txt', 'abc')
         .to('me1@me.com')
         .to('me2@me.com');
      });
    });

    it('Let you pass any object for the attachment', () => {
      // https://nodemailer.com/using-attachments/
      const attachment = {path: 'data:text/plain;base64,aGVsbG8gd29ybGQ='};
      message.attach(attachment);
      const attachments = Array.from(message.d.attachments.values());
      assert.deepEqual(attachments[0], attachment);
    });

    it('Expects content to be set!', () => {
      assert.throws(() => {
        message.attach('fai1.txt');
      });
    });

    it('When a url is passed for the content will set as attachment path', () => {
      const filename   = 'assert.html';
      const path    = 'https://nodejs.org/api/assert.html';
      const attachment = {filename, path};
      message.attach(filename, path);
      const attachments = Array.from(message.d.attachments.values());
      assert.deepEqual(attachments[0], attachment);
    });

    it('Will only add unique attachments', () => {
      const filename   = 'lolcat-3.txt';
      const content    = 'meow-3';
      const attachment = {filename, content};
      message.attach(attachment);
      message.attach(attachment);
      message.attach(attachment);
      message.attach(attachment);
      assert(message.d.attachments.size, 1);
    });
  });
});
