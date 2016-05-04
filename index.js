'use strict';

const nodemailer = require('nodemailer');
const Tram       = require('./tram');

const drivers = {
  mailgun  : require('./drivers/mailgun'),
  postmark : require('./drivers/postmark'),
  sendgrid : require('./drivers/sendgrid'),
  ses      : require('./drivers/ses'),
  sendmail : require('./drivers/sendmail'),
  smtp     : require('./drivers/smtp')
};

function configure(config, view, logger) {
  if (!config) {
    throw new Error('[mail] expected a config');
  }

  if (!drivers[config.driver]) {
    throw new Error('[mail] driver does not exist: ' + config.driver);
  }

  if (typeof drivers[config.driver] !== 'function') {
    throw new Error('[mail] the driver must be a function');
  }

  if (!view) {
    throw new Error('[mail] cannot setup without a view provider');
  }

  if (typeof view.render !== 'function') {
    throw new Error('[mail] expects the view provider to have a render function');
  }

  if (!config.logger) {
    config.logger = logger;
  }

  const transport = drivers[config.driver](config);
  const mail = nodemailer.createTransport(transport);

  return new Tram(mail, view, config);
}

configure.drivers = drivers;

module.exports = configure;
