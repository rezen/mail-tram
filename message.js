'use strict';

class Message {

  constructor(data) {
    this.d = data || {
      to:      new Set(),
      cc:      new Set(),
      bcc:     new Set(),
      from:    '',
      subject: '',
      text:    '',
      html:    '',
      priority: 'normal',
      attachments: new Set()
    };

    this.to  = this.addressFn('to');
    this.cc  = this.addressFn('cc');
    this.bcc = this.addressFn('bcc');
  }

  html(markup) {
    this.d.html = markup;
    return this;
  }

  text(text) {
    if (!text) {
      return this;
    }

    const hasDoctype = (text.indexOf('<!DOCTYPE') === 0);

    if (text.indexOf('<html') === 0 || hasDoctype) {
      return this.html(text);
    }

    this.d.text = text;
    return this;
  }

  subject(text) {
    this.d.subject = text;
    return this;
  }

  from(email, name) {
    this.d.from = name ?  `"${name}" <${email}>` : email;
    return this;
  }

  priority(level) {
    const levels = ['high', 'normal', 'low'];

    if (levels.indexOf(level) === -1) {
      return this;
    }

    this.d.priority = level;
    return this;
  }

  attach(filename, content) {
    if (arguments.length === 1 && typeof filename === 'object') {
      this.d.attachments.add(filename);
      return this;
    }

    if (!content) {
      throw new Error('Attachments need content');
    }

    const attachment = {filename};

    if (content.charAt(0) === '/') {
      attachment.path = content;
    } else if (content.indexOf('http') === 0) {
      attachment.path = content;
    } else {
      attachment.content = content;
    }

    this.d.attachments.add(attachment);

    return this;
  }

  data() {
    const data = Object.assign({}, this.d);
    const sets = ['to', 'bcc', 'cc', 'attachments'];

    for (const attr of sets) {
      data[attr] = Array.from(data[attr].values());
    }

    return data;
  }

  toJSON() {
    return this.d;
  }

  clone() {
    return new this.constructor(
      Object.assign({}, this.data())
    );
  }

  addressFn(attr) {
    return function(email, name) {
      if (Array.isArray(email)) {
        email.map(address => this[attr](address));
        return this;
      }

      this.d[attr].add(name ? `"${name}" <${email}>` : email);

      return this;
    };
  }
}

module.exports = Message;
