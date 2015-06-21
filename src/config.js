var path = require('path');
var randomstring = require('randomstring');

module.exports = {
  /**
   * process configuration
   */
  id: randomstring.generate(),
  redisUrl: process.env.REDISCLOUD_URL || 'redis://localhost:6379',
  amqpUrl: process.env.CLOUDAMQP_URL || 'amqp://localhost',

  /**
   * build configuration
   */
  buildsPath: path.join(__dirname, 'builds'),

  /**
   * www configuration
   */
  port: parseInt(process.env.PORT, 10) || 3000,
  publicUrl: process.env.PUBLIC_URL || 'http://localhost:3000',
  sessionSecret: process.env.SESSION_SECRET,
  
  /**
   * api keys for Mozillians and GitHub
   */
  mozilliansApiKey: process.env.MOZILLIANS_API_KEY,
  githubClientId: process.env.GITHUB_CLIENT_ID,
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET
};