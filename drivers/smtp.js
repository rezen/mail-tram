'use strict';

const smtpPool = require('nodemailer-smtp-pool');

/**
 * npm nodemailer-smtp-transport
 * 
 * Default SMTP transport is not suitable for large volume 
 * of e-mails new SMTP connection is established for every 
 * mail sent. Use nodemailer-smtp-pool if you need to send 
 * a large amout of e-mails.
 */
module.exports = function(config) {
	const settings = {
    host : config.host,
    port : config.port,
    auth : {
      user : config.username,
      pass : config.password,
    },
    secure: true,
    maxConnections : 5,
		maxMessages    : 10
	};

	return smtpPool(settings);
};
