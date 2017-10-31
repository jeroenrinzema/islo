const Sandbox = require('../../')
const box = new Sandbox('./module')

box.on('error', function (error) {
  console.log(error.toString())
})

box.run()
box.exports()
