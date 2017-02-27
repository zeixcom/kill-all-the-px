#!/usr/bin/env node

//Loading the external node modules
var merge = require('merge');
var fs = require('fs');
var inquirer = require('inquirer');
var path = require('path');

// Getting the config from the config file
var configFile = require('./kill-all-the-px-config');
var config = configFile.config;

// Getting the functions from the functions file
var helpers = require('./kill-all-the-px-functions');

// User given variables
var userAnswers = {};
var fileList = [];

// check if user generated config is there
if (fs.existsSync(process.env.PWD + '/kill-all-the-px-config.js')) {
  var userConfigFile = require(process.env.PWD + '/kill-all-the-px-config');
  var config = merge(config, userConfigFile.config);
}

inquirer.prompt([
  {
    type: 'input',
    name: 'baseFontSize',
    message: 'What is the base font-size (default 16px)',
    default: 16,
    validate: function(input) {
      var done = this.async();

      setTimeout(function () {
        var input = parseFloat(input);

        if (typeof input !== 'number') {
          done('You need to provida a number');
          return;
        } else {
          done(null, true);
        }
      }, 1);
    }
  },
  {
    type: 'input',
    name: 'path',
    message: 'Which path of the current directory should we go through',
    default: ''
  }
]).then(function (answers) {
  userAnswers = answers;

  // find a file recursively by file ending
  helpers.walkSync(process.env.PWD + '/' + answers.path, fileList, config);

  fileList.forEach(function (filePath) {
    fs.readFile(filePath, 'utf8', function (err, data) {
      if (err)
        return console.log(err);

      var replacedFileContent = helpers.findAndReplace(data, config, userAnswers);

      fs.writeFile(filePath, replacedFileContent, 'utf8', function (err) {
        if (err) return console.log(err);
      });
    });
  });
});

