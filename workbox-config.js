module.exports = {
    globDirectory: 'dist/',
    globPatterns: [
      '**/*.{html,js,css,png,jpg,gif,svg,woff,woff2,ttf,eot,ico}'
    ],
    swDest: 'dist/service-worker.js',
    ignoreURLParametersMatching: [/^utm_/],
    cleanupOutdatedCaches: true,
    clientsClaim: true,
    skipWaiting: true
  };