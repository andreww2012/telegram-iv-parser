module.exports = {
  command: 'launch <sitename> <section>',
  aliases: ['start', 'parse'],
  describe: 'Starts parsing process',
  builder: {
    period: {
      alias: 'p',
      default: 0,
      describe: 'An artificial delay between requests (in ms)',
    },
  },
  handler: require('./launchHandler'),
};
