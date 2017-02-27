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

    // console.log('matchesToReplace', matchesToReplace);

    var counter = 0;

    matchesToReplace.forEach(function (currentFaulty) {

      var matches = currentFaulty.match(new RegExp('\\d+', 'g')),
          currentFixed = currentFaulty;

      if (matches !== null) {

        matches.forEach(function (match) {
          if (match !== '0') {
            var px = parseFloat(match),
                remValue = px / userAnswers.baseFontSize;

            var newShiny = currentFixed.replace(new RegExp(match + '+px', 'g'), remValue + 'rem');

            if (newShiny !== currentFixed) {
              counter++;

              currentFixed = newShiny;
            }
          }
        });

        fileContent = fileContent.replace(currentFaulty, currentFixed);
      }
    });

    console.log('replaced Lines per this file', counter);

    return fileContent;
  }
};
