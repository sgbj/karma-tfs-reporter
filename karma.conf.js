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
            require('karma-phantomjs-launcher'),
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
        browsers: ['PhantomJS'],
        reporters: ['progress', 'tfs'],
        // Default settings (optional)
        tfsReporter: {
            outputDir: 'testresults',
            outputFile: 'testresults_${date}.xml'
        }
    })
}
