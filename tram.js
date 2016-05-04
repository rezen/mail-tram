'use strict';

const validator    = require('validator');
const EventEmitter = require('eventemitter2').EventEmitter2;
const Message      = require('./message');

/**
 * mailer.compose('emails.everyone', {cats: 'dogs'}, (err, message) => {});
 * mailer.send(message, function() {});
 */
class Tram extends EventEmitter{

  constructor(mail, view, config) {
    super({wildcard: true});

    config = config || {};

    this.mail       = mail;
    this.view       = view;
    this.validator  = validator;
    this.config     = config;
    this.logger     = config.logger || console;
    this.pretending = config.pretending || false;
    this.filters    = config.filters || [];
    this.errors     = []; // @todo make a fixed size queue
    this.sentCount  = 0;
    this.blueprints = {};
    this.useMessage(this.Message || Message);
  }

  /**
   * @param  {String} subject
   * @param  {Object} data
   * @return {Message}
   */
  draft(template, data, callback) {
    if (!this.view) {
      throw new Error('There is now view engine to render templates');
    }

    if (!template) {
      throw new Error('Cannot draft without a template');
    }

    data = data || {};

    if (typeof data === 'function') {
      callback = data;
      data = {};
    }

    if (this.blueprints[template]) {
      const message = this.blueprints[template].clone();
      return callback(null, message);
    }

    const message = this.message();

    this.view.render(template, data, (err, res) => {
      message.text(res);
      callback(err, message);
    });
  }

  /**
   * Use a message as a blueprint that can be used later
   * to save some render time and reduce amount of message
   * building required
   *
   * @param  {Message} message
   * @param  {String}  name
   */
  blueprint(message, name) {
    name =  name || message.data().subject;

    if (!name) {
      return this;
    }

    this.blueprints[name] = message.clone();
    return this;
  }

  /**
   * @param  {Message}  message
   * @param  {Function} callback
   */
  send(message, callback) {
    const pass = this.check(message);

    if (pass instanceof Error) {
      return callback(pass);
    }

    if (this.pretending) {
      return this.mailPretend(message);
    }

    this.mail.sendMail(
      this.luggage(message),
      this.wrapSent(callback, message)
    );

    return this;
  }

  /**
   * @param  {Message} message
   * @return {Object}
   */
  luggage(message) {
    const data = message.data();

    if (this.filters.length === 0) {
      return data;
    }

    return this.filters.reduce((data_, fn) => {
      return fn(data_, message);
    }, data);
  }

  /**
   * @return {Message}
   */
  message() {
    const message = new this.Message();

    if (this.config.from) {
      message.from(this.config.from);
    }

    return message;
  }

  /**
   * @param  {Message}    message
   * @return {True|Error}
   */
  check(message) {
    const isMessage = (message instanceof this.Message);

    if (!isMessage) {
      return new Error('Expected an instance of Message');
    }

    const data = message.data();
    const tos  = data.to;

    if (tos.length === 0) {
      return new Error('You need to send {to} someone');
    }

    for (const to of tos) {
      if (!this.validator.isEmail(to)) {
        return new Error('The {to} email address is not valid');
      }
    }

    if (!this.validator.isEmail(data.from)) {
      return new Error('The {from} email address is not valid');
    }

    if (data.subject.length < 3) {
      return new Error('The {subject} is kinda empty');
    }

    if (data.html.length < 3 && data.text.length < 3) {
      return new Error('The message needs either {html} or {text} body');
    }

    return true;
  }

  /**
   * @return {MailTraim}
   */
  pretend() {
    this.pretending = true;
    return this;
  }

  /**
   * @param {Object}
   */
  set logger(logger) {
    if (typeof logger.info !== 'function') {
      return;
    }

    this._logger = logger;
  }

  /**
   * @return {Object}
   */
  get logger() {
    if (this._logger) {
      return this._logger;
    }

    function nfn() {}

    return {
      info: nfn, error: nfn, log: nfn, warn: nfn
    };
  }

  /**
   * Set the Message class that will be used to compose
   *
   * @param  {Function} Message
   */
  useMessage(Message) {
    const needs = ['data', 'subject', 'html'];

    // Lite validating of the class methods
    for (const method of needs) {
      if (typeof Message.prototype[method] !== 'function') {
        throw new Error('The message class needs to implement ' + method);
      }
    }

    this.Message = Message;
    return this;
  }

  /**
   * @private
   * @param  {Function} callback
   * @return {Function}
   */
  wrapSent(callback, message) {  
    const self = this;

    return function(err, info) {
      if (err) {
        self.emit('mail.error', message);
        self.logger.error('[mail]', err);
      } else {
        self.sentCount++;
        self.logger.info('[mail]', info);
        self.emit('mail.sent', info, message);
      }

      if (typeof callback !== 'function') {return;}

      callback(err, info);
    };
  }

  /**
   * @private
   * @param  {Message} message
   */
  mailPretend(message) {
    const data = message.data();
    this.emit('mail.pretend', message);
    this.logger.info('[mail]', '*PRETEND*', data);
  }

  /**
   * @param  {Object} view
   */
  set view(view) {
    if (!view) {
      return this;
    }

    if (!view.render) {
      throw new Error('The view engine provided needs a render function');
    }

    this._view = view;
  }

  /**
   * @return {Object}
   */
  get view() {
    return this._view;
  }
}

module.exports = Tram;
