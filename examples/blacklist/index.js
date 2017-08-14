const Sandbox = require('../../')

const box = new Sandbox('./module', {
  blacklist: ['fs']
})

box.on('error', function (error) {
  console.log(error.toString())
})

box.run()
