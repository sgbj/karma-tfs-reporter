var uuid = require('node-uuid');
var os = require('os');
var xmlbuilder = require('xmlbuilder');
var dateFormat = require('dateformat');

function pad(n, width, z) {
  z = z || '0';
  n = Math.abs(Math.floor(n)) + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function toISOString (time) {
    var date = new Date(time),
    return dateFormat(date, "isoDateTime");
};

function duration (start, finish) {
  var diff = finish.getTime() - start.getTime();
  return pad((diff / 1000 / 60 / 60) % 100, 2)
        + ':' + pad((diff / 1000 / 60) % 60, 2) 
        + ':' + pad((diff / 1000) % 60, 2) 
        + '.' + pad(diff % 1000, 3) + '0000';
};

function escape(str) {
  return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&apos;');
};

module.exports = function (testResults) {
    var start = Math.min.apply(null, testResults.specs.map(spec => spec.start.getTime()));
    var finish = Math.max.apply(null, testResults.specs.map(spec => spec.finish.getTime()));

    var specs = testResults.specs.map(spec => {
        spec.suite = escape(spec.suite);
        spec.description = escape(spec.description);
        return {
            name: `${spec.suite} ${spec.description}`,
            executionId: uuid(),
            testId: uuid(),
            result: spec
        };
    });

    const suites = {};
    testResults.specs.forEach(spec => suites[spec.suite] = uuid());

    var fullOutcome = testResults.specs.some(spec => spec.outcome == 'Failed') ? 'Failed' : 'Completed';
    var passed = testResults.specs.filter(spec => spec.outcome == 'Passed');
    var failed = testResults.specs.filter(spec => spec.outcome == 'Failed');
    var executed = testResults.specs.filter(spec => spec.outcome != 'NotExecuted');
    var notExecuted = testResults.specs.filter(spec => spec.outcome == 'NotExecuted');

    var unitTestResultsArray = [];
    var testDefinitionsArray = [];
    var testEntryArray = [];
    specs.map(spec => {
      var testResult = {
        '@executionId': spec.executionId,
        '@testId': spec.testId,
        '@testName': spec.name,
        '@computerName': os.hostname(),
        '@duration': duration(spec.result.start, spec.result.finish),
        '@startTime': toISOString(spec.result.start),
        '@endTime': toISOString(spec.result.finish),
        '@testType': '13cdc9d9-ddb5-4fa4-a97d-d965ccfc6d4b',
        '@outcome': spec.result.outcome,
        '@testListId': suites[spec.result.suite]
      };
      if(spec.result.outcome === 'Failed'){
        testResult.ErrorInfo = {
          Message:escape(spec.result.message),
          StackTrace:escape(spec.result.stackTrace)
        }
      }
      unitTestResultsArray.push(testResult);

      var testDef = {
        '@name': spec.name,
        '@id': spec.testId,
        'Execution':{
          '@id':spec.executionId
        },
        'TestMethod': {
          '@codeBase': testResults.name,
          '@className': spec.result.suite,
          '@codeBase': spec.name
        }
      };
      testDefinitionsArray.push(testDef);

      var testEntryObj = { 
        '@testId': spec.testId,
        '@executionId': spec.executionId,
        '@testListId': suites[spec.result.suite]
      }
      testEntryArray.push(testEntryObj);
    });

    var testListArray = [];
    Object.keys(suites).map(suite => {
      testListArray.push({
        '@name': suite,
        '@id': suites[suite]
      });
    });

    var skippedArray = [];
    notExecuted.map(spec => {
      skippedArray.push({'#text': `Test '${spec.name}' was skipped in the test run.`});
    });

    var testObj = {TestRun: {
      '@id': uuid(),
      '@name': testResults.name,
      '@xmlns': 'http://microsoft.com/schemas/VisualStudio/TeamTest/2010',
      Times: {
        '@creation': toISOString(start),
        '@start': toISOString(start),
        '@finish': toISOString(finish)
      },
      Results: {
        UnitTestResult: unitTestResultsArray
      },
      TestDefinitions: {
        UnitTest: testDefinitionsArray
      },
      TestEntries: {
        TestEntry: testEntryArray
      },
      TestLists:{
        TestList: testListArray
      },
      ResultSummary:{
        '@outcome':fullOutcome,
        Counters:{
          '@total': testResults.specs.length,
          '@executed': executed.length,
          '@passed': passeds.length,
          '@failed': failed.length
        },
        Output: {
          StdOut: skippedArray
        }
      }
    }}
    return xmlbuilder.create(testObj, { version: '1.0', encoding: 'UTF-8'});
};