module.exports = {
    content: ["./views/**/*.hbs", "./views/layouts/**/*.hbs", "./src/**/*.{html,js}", './node_modules/tw-elements/dist/js/**/*.js'],
    theme: {
      extend: {
        
      },
    },
    plugins: [
      require('tw-elements/dist/plugin')
    ]
  }
  