let gunzip = require('gunzip-maybe');
let request = require('request');
let tar = require('tar-stream');

let Promise = require('bluebird');

function fetchGitHubArchive(archiveUrl, fs) {
  return new Promise(function(resolve, reject) {
    let extract = tar.extract();

    extract.on('finish', resolve);
    extract.on('entry', function(header, stream, next) {
      if (header.type !== 'file') {
        stream.resume();
        next();
        return;
      }

      // Strip the top level directory from the tar that GitHub creates
      let filePath = header.name.split('/').slice(1).join('/');

      let writeStream = fs.createWriteStream(filePath);
      stream.pipe(writeStream);
      writeStream.on('finish', next);
    });

    request(archiveUrl)
      .pipe(gunzip())
      .pipe(extract);
  });
}

module.exports = fetchGitHubArchive;