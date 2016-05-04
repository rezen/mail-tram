'use strict';

const mailgun = require('nodemailer-mailgun-transport');

module.exports = function(config) {
	const settings = {auth: {
    api_key: config.key,
    domain : config.domain
  }};

	return mailgun(settings);
};
