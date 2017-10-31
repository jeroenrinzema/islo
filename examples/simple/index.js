const Sandbox = require('../../')
const box = new Sandbox('./module')

box.on('error', function (error) {
  throw error
})

box.run()
box.exports()
