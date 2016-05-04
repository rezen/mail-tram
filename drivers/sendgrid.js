'use strict';

const sendGrid = require('nodemailer-sendgrid-transport');

module.exports = function(config) {
  return sendGrid({
    auth: {
      api_user: config.user,
      api_key:  config.key
    }
  });
};
