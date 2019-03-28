/* eslint-disable require-jsdoc */
const {URL} = require('url');
const normalizeUrl = require('normalize-url');
const {uniq} = require('lodash');
const cssWhat = require('css-what');

function normalizeHost(dirtyHost) {
  return new URL(normalizeUrl(dirtyHost)).hostname;
}

function parseList(list) {
  return uniq(list.split(',').map(n => n.trim()).filter(n => n));
}

module.exports = [
  {
    name: 'host',
    message: 'Host name only:',
    filter(input) {
      return normalizeHost(input);
    },
    validate(input) {
      return !!input;
    },
    transform(input) {
      return normalizeHost(input);
    },
  },

  {
    name: 'subdomain',
    message: 'Subdomain if needed ("www", etc):',
    validate(input) {
      return !input
        || /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/.test(input.trim());
    },
  },

  {
    name: 'httpOnly',
    message: 'Site available only through http? (default = NO):',
    type: 'confirm',
    default: false,
  },

  {
    name: 'noPagination',
    message: 'Is pagination not exists? (default = NO):',
    type: 'confirm',
    default: false,
  },

  {
    name: 'paginationReversed',
    message: 'Is pagination reversed? (default = NO):',
    type: 'confirm',
    default: false,
    when({noPagination}) {
      return !noPagination;
    },
  },

  {
    name: 'totalNumberOfPages',
    message: 'As pagination is reversed, you must specify the total number of pages:',
    filter(input) {
      return Math.trunc(+input);
    },
    validate(input) {
      return input >= 1;
    },
    when({paginationReversed}) {
      return paginationReversed;
    },
  },

  {
    name: 'paginationStep',
    message: 'Pagination step (default: 1):',
    default: 1,
    filter(input) {
      return Math.trunc(+input);
    },
    validate(input) {
      return input >= 1;
    },
    when({noPagination}) {
      return !noPagination;
    },
  },

  {
    name: 'sectionNames',
    message: 'Unique section name(s) (comma separated):',
    filter(input) {
      return parseList(input);
    },
    validate(input) {
      return input.length > 0;
    },
    transform(input) {
      return parseList(input).join(', ');
    },
  },

  {
    name: 'pagePatterns',
    message({noPagination, sectionNames}) {
      const shouldUse = [];
      if (!noPagination) {
        shouldUse.push([0, 'page number']);
      }
      if (sectionNames.length > 1) {
        shouldUse.push([1, 'section name']);
      }
      let message = 'Section page pattern';
      if (shouldUse.length) {
        message += ' (';
        shouldUse.forEach((elem, i) => {
          message += `{${elem[0]}}: ${elem[1]}`;
          if (i != shouldUse.length - 1) {
            message += ', ';
          }
        });
        message += ')';
      }
      message += ':';
      return message;
    },
    validate(input, {noPagination, sectionNames}) {
      if (!noPagination && !input.includes('{0}')) {
        return 'Page pattern is required';
      }
      if (sectionNames.length > 1 && !input.includes('{1}')) {
        return 'Page pattern is required';
      }
      return true;
    },
  },

  {
    name: 'firstPageUrl',
    message: 'If the first page is not available by this pattern, specify a different URL for it:',
    default: '',
    // validate(input, {paginationReversed}) {
    //   if (paginationReversed && !input) {
    //     return 'You must specify this field as pagination is reversed';
    //   }
    //   return true;
    // },
    when({noPagination}) {
      return !noPagination;
    },
  },

  {
    name: 'linkSelector',
    message: 'Selector(s) for article links (comma separated):',
    filter(input) {
      return parseList(input);
    },
    validate(input) {
      return input.length > 0;
    },
    transform(input) {
      return parseList(input).join(', ');
    },
  },

  {
    name: 'articleBodySelector',
    message: 'Selector for article body (default: body):',
    default: 'body',
    validate(input) {
      return !!input;
    },
  },

  {
    name: 'selectorsThatMustBeIgnored',
    message: 'Selector(s) that must be ignored (comma separated):',
    filter(input) {
      return parseList(input).filter(s => {
        try {
          // Throws an exception when a selector is invalid
          return cssWhat(s);
        } catch (error) {
          return false;
        }
      });
    },
    transform(input) {
      return parseList(input).join(', ');
    },
  },
];
