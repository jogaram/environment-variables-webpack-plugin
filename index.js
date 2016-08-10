var path = require('path'),
    chalk = require('chalk'),
    fs = require('fs');

function EnvironmentVariablesPlugin(options) {
    this.optionsFile = path.join(process.cwd(), options.optionsFile);
    this.chunks = options.chunks || [];
}

EnvironmentVariablesPlugin.prototype._extractFileKeys = function (fileContent) {
    return fileContent.match(/%%\s*.*\s*%%/g)
        .map(function (rawKey) {
            return {
                raw: rawKey,
                parsed: rawKey.replace(/%%/g, '').trim()
            };
        });
};

EnvironmentVariablesPlugin.prototype._extractOption = function (keyChain) {
    var value = this.optionsMap;

    keyChain.split('.').forEach(function (keyPart) {
        value = value[keyPart];
    });

    return value;
};

EnvironmentVariablesPlugin.prototype._replaceFileVariables = function (fileContent) {
    var plugin = this, keys = this._extractFileKeys(fileContent);

    console.log(chalk.red('found keys', keys.map(function (key) {
        return key.raw;
    })));

    if (keys && keys.length) {
        keys.forEach(function (key) {
            fileContent = fileContent.replace(key.raw, plugin._extractOption(key.parsed));
        });
    }

    return fileContent;
};

EnvironmentVariablesPlugin.prototype.apply = function (compiler) {
    var plugin = this;

    compiler.plugin('emit', function (compilation, callback) {

        compilation.fileDependencies.push(plugin.optionsFile);
        plugin.optionsMap = JSON.parse(fs.readFileSync(plugin.optionsFile, {encoding: 'utf-8'}));

        console.log(chalk.bold("\nReplacing environment variables"));

        compilation.chunks
            .filter(function (chunk) {
                return plugin.chunks.indexOf(chunk.name) > -1;
            })
            .forEach(function (chunk) {
                chunk.files.forEach(function (fileName) {
                    var content = plugin._replaceFileVariables(compilation.assets[fileName].source());
                    compilation.assets[fileName] = {
                        source: function () {
                            return content;
                        },
                        size: function () {
                            return content.length;
                        }
                    };
                })
            });

        callback();
    });
};

module.exports = EnvironmentVariablesPlugin;
