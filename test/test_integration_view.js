'use strict';

const path     = require('path');
const sinon    = require('sinon');
const assert   = require('assert');
const ejs      = require('ejs');
const nunjucks = require('nunjucks');
const Tram     = require('../tram');

nunjucks.configure(__dirname + '/tmpl/');

describe('Tram:views', () => {
  var tram;

  beforeEach(() => {
    tram = new Tram(require('./stub-mail'), {
      render(template, data, callback) {
        template = path.resolve(__dirname + '/tmpl/', template);
        ejs.renderFile(template, data, {}, callback);
      }
    });
  });

  describe('#constructor', () => {
    it('Setup the message data object', () => {
      assert.equal(typeof tram.config, 'object');
      assert.equal(tram.logger, console);
      assert.equal(tram.pretending, false);
      assert.deepEqual(tram.filters, []);
      assert.deepEqual(tram.errors, []);
      assert.equal(tram.sentCount, 0);
    });
  });

  describe('#draftr.ejs', () => {
    it('Renders the template with the data and adds to message', () => {
      const user = 'mehe';
      tram.draft('email.html', {user}, (err, message) => {
        assert(message instanceof tram.Message);
        assert.equal(message.d.text, '<h2>mehe</h2>');
      });
    });

    it('Renders the template with the data and adds to message', () => {
      const user = 'lol';
      const html = `<!DOCTYPE html>\n<html>\n<body>\n  <h2>Hi, ${user}</h2>\n</body>\n</html>`;
      
      tram.draft('email-2.html', {user}, (err, message) => {
        assert(message instanceof tram.Message);
        assert.equal(message.d.html, html);
      });
    });

    it('Returns an error in callback', () => {
      tram.draft('email-99.html', {}, (err, message) => {
        assert(err instanceof Error);
      });
    });
  });

  describe('#draftr.nunjucks', () => {
    var tram2;
    beforeEach(() => {
      tram2 = new Tram(require('./stub-mail'), nunjucks);
    });

    it('Renders the template with the data and adds to message', () => {
      const user = 'yoho';
      tram2.draft('email-3.html', {user}, (err, message) => {
        assert(message.d.html.indexOf('Hi yoho') !== -1);
      });
    });

    it('Returns an error in callback', () => {
      tram.draft('email-99.html', {}, (err, message) => {
        assert(err instanceof Error);
      });
    });
  });
});
