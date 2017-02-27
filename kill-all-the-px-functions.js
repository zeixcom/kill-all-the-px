var fs = require('fs');
var path = require('path');

module.exports = {
  walkSync:  function(dir, filelist, config) {
    var that = this;
    var files = fs.readdirSync(dir);

    filelist = filelist || [];
    files.forEach(function(file) {
      if (fs.statSync(path.join(dir, file)).isDirectory()) {
        var isInIgnoreDir = config.ignoreDirs.indexOf(file);

        if(isInIgnoreDir === -1){
          filelist = that.walkSync(path.join(dir, file), filelist, config);
        }
      }
      else {
        var fileExt = path.extname(path.join(dir, file)),
            isInFileExtArray = config.fileExts.indexOf(fileExt);

        if (isInFileExtArray !== -1 && file) {
          filelist.push(path.join(dir, file));
        }
      }
    });
    return filelist;
  },

  findAndReplace: function(fileContent, config, userAnswers) {
    var matchesToReplace = [];

    config.targets.forEach(function (target) {

      var matchesInFile = fileContent.match(new RegExp('(' + target + ':).+;', 'g'));

      if (matchesInFile !== null) {
        matchesInFile.forEach(function(match) {

          if (matchesToReplace.indexOf(match) === -1) {
            matchesToReplace.push(match);
          }
        })
      }
    });

    matchesToReplace.forEach(function (currentFaulty) {
      var matches = currentFaulty.match(new RegExp('\\d+', 'g'));

      if (matches !== null) {

        matches.forEach(function (match) {
          if (match !== '0') {
            var px = parseFloat(match),
                remValue = px / userAnswers.baseFontSize;

            var newShiny = currentFaulty.replace(new RegExp('\\d+px', 'g'), remValue + 'rem');

            fileContent = fileContent.replace(currentFaulty, newShiny);
          }
        });
      }
    });

    return fileContent;
  }
};
