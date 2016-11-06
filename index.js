var path = require('path');
var fs = require('fs');
var mkpath = require('mkpath');
var trx = require('./trx');

var TfsReporter = function(baseReporterDecorator, config, formatError) {
    baseReporterDecorator(this);

    var testResults;
    var messages = [];
    var outputDir = config.tfsReporter && config.tfsReporter.outputDir ? config.tfsReporter.outputDir : 'testresults';
    var outputFile = config.tfsReporter && config.tfsReporter.outputFile ? config.tfsReporter.outputFile : 'testresults_${date}.xml';

    this.onRunStart = function (browsers) {
        testResults = {
            name: path.join(outputDir, outputFile.replace('${date}', new Date().toISOString().replace(/:/g, ''))),
            agent: {},
            specs: []
        };
    };

    this.onBrowserStart = function (browser) {
        testResults.agent = {
            id: browser.id,
            name: browser.name,
            fullName: browser.fullName
        };
    };

    this.specSuccess = this.specSkipped = this.specFailure = function (browser, result) {
        messages.push(result);
        var now = Date.now();
        testResults.specs.push({
            id: result.id,
            suite: result.suite.length ? result.suite.join(' ') : 'Results not in a list',
            description: result.description,
            start: new Date(now),
            finish: new Date(now + result.time),
            time: result.time,
            outcome: result.skipped ? 'NotExecuted' :
                result.success ? 'Passed' : 'Failed',
            message: result.log.join('\n'),
            stackTrace: result.log.join('\n')
        });
    };

    this.onBrowserComplete = function (browser) { };

    this.onRunComplete = function () { };

    this.onExit = function (done) {
        mkpath.sync(outputDir);
        fs.writeFileSync(testResults.name, trx(testResults));
        done();
    };

}

TfsReporter.$inject = ['baseReporterDecorator', 'config', 'formatError'];

module.exports = {
    'reporter:tfs': ['type', TfsReporter]
};