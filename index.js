var path = require('path');
var fs = require('fs');
var trx = require('./trx');
//"C:\Program Files (x86)\Microsoft Visual Studio 14.0\Common7\IDE\CommonExtensions\Microsoft\TestWindow\vstest.console.exe" UnitTestProject1.dll /UseVsixExtensions:true /logger:trx

var TfsReporter = function(baseReporterDecorator, config, formatError) {
    baseReporterDecorator(this);

    var testResults;
    var messages = [];

    this.onRunStart = function (browsers) {
        testResults = {
            name: 'karma-test-results',
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
            suite: result.suite.length ? result.suite[0] : 'All tests',
            description: result.description,
            start: new Date(now),
            finish: new Date(now + result.time),
            time: result.time,
            outcome: result.skipped ? 'NotExecuted' :
                result.success ? 'Passed' : 'Failed'
        });
    };

    this.onBrowserComplete = function (browser) {
    };

    this.onRunComplete = function () {
    };

    this.onExit = function (done) {
        fs.writeFileSync(testResults.name + '.xml', trx(testResults));
        done();
    };

}

TfsReporter.$inject = ['baseReporterDecorator', 'config', 'formatError'];

module.exports = {
    'reporter:tfs': ['type', TfsReporter]
};