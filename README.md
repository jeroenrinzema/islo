[![N|Solid](https://jeroen.no/github/islo_logo.png)](Islo)

# Islo 🚧

Require modules in a sandbox environment. Modules are unable to require blacklisted modules and / or files outside of it's root. Islo is very small and does not require any dependencies.

### Installation

Using npm:

```
$ npm i --save islo
```

### Example

```
const Islo = require('islo')
const box = new Islo('./module', {
  blacklist: ['fs', 'mysql']
})

box.on('error', function (error) {
  console.log(error.toString())
})

box.run()
```
