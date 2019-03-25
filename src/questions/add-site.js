module.exports = [
  {
    name: 'host',
    message: 'Host name without subdomain:',
    validate(input) {
      return !!input;
    },
  },

  {
    name: 'subdomain',
    message: 'Subdomain ("www", etc):',
  },

  {
    name: 'httpOnly',
    message: 'Site available only through http (NOT https)? (default = NO)',
    type: 'confirm',
    default: false,
  },

  {
    name: 'sectionName',
    message: 'Unique section name(s) (comma separated):',
    validate(input) {
      if (!input) {
        return 'Section name is required';
      }
      return true;
    },
  },

  // {
  //   name: 'paginationLastPageSelector',
  //   message: 'Selector containing page count (optional):',
  // },

  {
    name: 'paginationReversed',
    message: 'If pagination reversed? (default = NO)',
    type: 'confirm',
    default: false,
  },

  {
    name: 'pagePattern',
    message: 'Section page pattern ({0} for page number, {1} for section name (required when multiple sections was specified)):',
    validate(input) {
      if (!input.includes('{0}')) {
        return '{0} is required';
      }
      return true;
    },
  },

  {
    name: 'firstPageUrl',
    message: 'If the first page is not available by this pattern, specify a different URL for it:',
    default: '',
    validate(input, {paginationReversed}) {
      if (paginationReversed && !input) {
        return 'You must specify this field as pagination is reversed';
      }
      return true;
    },
  },

  {
    name: 'linkSelector',
    message: 'Selector(s) for article links (comma separated):',
    validate(input) {
      return !!input;
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
  },
];
