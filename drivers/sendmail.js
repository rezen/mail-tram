'use strict';

const sendMail = require('nodemailer-sendmail-transport');

module.exports = function(config) {
	return sendMail({
        path : '/usr/sbin/sendmail'
    });
};
