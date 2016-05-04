'use strict';

const ses = require('nodemailer-ses-transport');

module.exports = function(config) {
	return ses({
    accessKeyId     : config.key,
    secretAccessKey : config.secret,
  });
};
