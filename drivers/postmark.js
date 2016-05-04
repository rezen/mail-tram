'use strict';

const postmark = require('nodemailer-postmark-transport');

module.exports = function(config) {
  const settings = {auth: {
    apiKey: config.key
  }};

  return postmark(settings);
};
