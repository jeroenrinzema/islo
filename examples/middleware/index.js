const Sandbox = require('../../')

const box = new Sandbox('./module', {
  middleware: {
    isSafe (module, info) {
      const [firstLetter] = module

      if (firstLetter === '@') {
        return false
      }
    },
    require (module) {
      // Wrap the required module to run it in the sandbox
      if (module === '#custom') return this.wrap('./custom')
    }
  }
})

box.on('error', function (error) {
  console.log(error.toString())
})

box.run()
