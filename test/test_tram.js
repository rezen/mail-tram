'use strict';

const sinon  = require('sinon');
const assert = require('assert');
const Tram   = require('../tram');

describe('Tram', () => {
  var tram;

  beforeEach(() => {
    tram = new Tram(require('./stub-mail'), require('./stub-view'));
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

  describe('#message', () => {
    it('Setup the message data object', () => {
      const message = tram.message();
      assert(message instanceof tram.Message);
    });

    it('Setup the message data object', () => {
      tram.config = {from: 'me@me.com'};
      const message = tram.message();
      assert.equal(message.d.from, tram.config.from);
    });
  });

  describe('#draft', () => {
    const body = '<html><body></body>';

    beforeEach(() => {
      tram.view = {
        render(template, data, cb) {
          cb(null, body);
        }
      };

      sinon.spy(tram.view, 'render');
    });

    it('Expects a view engine to exist', () => {
      tram._view = null;
      assert.throws(() => {
        tram.draft('test.html', {});
      })
    });

    it('Expects a template to be specified', () => {
      assert.throws(() => {
        tram.draft(false, {});
      })
    });

    it('Hits the view.render fn and calls back with err, message', () => {
      const template = 'test.html';
      const data = {};
      tram.draft(template, data, (err, message) => {
        assert(message instanceof tram.Message);
        assert.equal(message.d.html, body);
        assert(tram.view.render.called);
        const args = tram.view.render.getCall(0).args;
        assert.equal(args[0], template);
        assert.equal(args[1], data);
      });
    });
  });

  describe('#pretend', () => {
    it('Changes the pretending state to true', () => {
      assert.equal(tram.pretending, false);
      tram.pretend();
      assert(tram.pretending);
    });
  });

  describe('#check', () => {
    it('Gives an error for empty messages', () => {
      const message = tram.message();
      const pass = tram.check(message);
      assert(pass instanceof Error);
    });

    it('Gives an error for an invalid to address', () => {
      tram.config = {from: 'me@me.com'};
      const message = tram.message();
      message.to('you');
      const pass = tram.check(message);
      assert(pass instanceof Error);
      assert(pass.message.indexOf('email address is not valid') !== -1);
    });

    it('Gives an error for an invalid from address', () => {
      tram.config = {from: 'z.com'};
      const message = tram.message();
      message.to('you@you.com');
      const pass = tram.check(message);
      assert(pass instanceof Error);
      assert(pass.message.indexOf('email address is not valid') !== -1);
    });

    it('Gives an error for a message missing text', () => {
      tram.config = {from: 'me@me.com'};
      const message = tram.message();
      message.to('you@you.com').subject('Cats?');
      const pass = tram.check(message);
      assert(pass instanceof Error);
    });

    it('Passes with a valid to, subject, text, from', () => {
      tram.config = {from: 'me@me.com'};
      const message = tram.message();
      message.to('you@you.com').subject('Dogs?').text('Dogs?');
      assert(tram.check(message));
    });
  });
});
