module.exports = function (config) {
    config.set({
        frameworks: ['jasmine'],
        files: [
            './src/*.spec.js',
            './src/**/*.spec.js'
        ],
        plugins: [
            require('karma-jasmine'),
            require('karma-webpack'),
            require('karma-chrome-launcher'),
            require('karma-tfs-reporter')
        ],
        preprocessors: {
            './src/*.spec.js': ['webpack'],
            './src/**/*.spec.js': ['webpack']
        },
        webpack: {
        },
        webpackMiddleware: {
            stats: 'errors-only'
        },
        browsers: ['Chrome'],
        reporters: ['progress', 'tfs'],
        tfsReporter: {
            outputDir: 'testresults',
            outputFile: 'testresults_${date}.xml'
        }
    })
}