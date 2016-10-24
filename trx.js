var uuid = require('node-uuid');

var toISOString = function() {
    var now = new Date(),
        tzo = -now.getTimezoneOffset(),
        dif = tzo >= 0 ? '+' : '-',
        pad = function(num) {
            var norm = Math.abs(Math.floor(num));
            return (norm < 10 ? '0' : '') + norm;
        };
    return now.getFullYear() 
        + '-' + pad(now.getMonth()+1)
        + '-' + pad(now.getDate())
        + 'T' + pad(now.getHours())
        + ':' + pad(now.getMinutes()) 
        + ':' + pad(now.getSeconds()) 
        + dif + pad(tzo / 60) 
        + ':' + pad(tzo % 60);
};

module.exports = function (testResults) {
    var start = Math.min.apply(null, testResults.specs.map(spec => spec.start));
    var finish = Math.max.apply(null, testResults.specs.map(spec => spec.finish));
    var testListId = uuid();

    var specs = testResults.specs.map(spec => {
        return {
            executionId: uuid(),
            testId: uuid(),
            result: spec
        };
    });

    // also do duration down below

    var fullOutcome = testResults.specs.some(spec => spec.outcome == 'Failed') ? 'Failed' : 'Completed';
    var passed = testResults.specs.filter(spec => spec.outcome == 'Passed');
    var failed = testResults.specs.filter(spec => spec.outcome == 'Failed');
    var executed = testResults.specs.filter(spec => spec.outcome != 'NotExecuted');
    var notExecuted = testResults.specs.filter(spec => spec.outcome == 'NotExecuted');

    return `<?xml version="1.0" encoding="UTF-8"?>
<TestRun id="${uuid()}" name="${testResults.name}" runUser="${testResults.name}" xmlns="http://microsoft.com/schemas/VisualStudio/TeamTest/2010">
  <Times creation="${toISOString(start)}" queuing="${toISOString(start)}" start="${toISOString(start)}" finish="${toISOString(finish)}" />
  <TestSettings name="default" id="${uuid()}">
    <Execution>
      <TestTypeSpecific />
    </Execution>
    <Deployment runDeploymentRoot="${testResults.name}" />
    <Properties />
  </TestSettings>
  <Results>
    ${specs.map(spec => {
      return `<UnitTestResult executionId="${spec.executionId}" testId="${spec.testId}" testName="${spec.result.description}" computerName="${testResults.name}" duration="00:00:00.0027275" startTime="${toISOString(spec.result.start)}" endTime="${toISOString(spec.result.finish)}" testType="13cdc9d9-ddb5-4fa4-a97d-d965ccfc6d4b" outcome="${spec.result.outcome}" testListId="${testListId}" relativeResultsDirectory="${spec.executionId}" />
      `;
        // add output and error info
    }).join('')}
  </Results>
  <TestDefinitions>
    ${specs.map(spec => {
      return `<UnitTest name="${spec.result.description}" id="${spec.testId}">
      <Execution id="${spec.executionId}" />
      <TestMethod codeBase="${testResults.name}" className="${spec.result.suite}" name="${spec.result.description}" />
    </UnitTest>
    `;
    }).join('')}
  </TestDefinitions>
  <TestEntries>
    ${specs.map(spec => {
      return `<TestEntry testId="${spec.testId}" executionId="${spec.executionId}" testListId="${testListId}" />
      `;
    }).join('')}
  </TestEntries>
  <TestLists>
    <TestList name="Results Not in a List" id="${testListId}" />
    <TestList name="All Loaded Results" id="${uuid()}" />
  </TestLists>
  <ResultSummary outcome="Failed">
    <Counters total="${testResults.specs.length}" executed="${executed.length}" passed="${passed.length}" failed="${failed.length}" error="0" timeout="0" aborted="0" inconclusive="0" passedButRunAborted="0" notRunnable="0" notExecuted="0" disconnected="0" warning="0" completed="0" inProgress="0" pending="0" />
    <Output>
      ${notExecuted.map(spec => {
        return `<StdOut>Test '${spec.result.description}' was skipped in the test run.</StdOut>
        `;
      }).join('')}
    </Output>
  </ResultSummary>
</TestRun>`;
};