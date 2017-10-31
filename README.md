[![N|Solid](https://jeroen.no/github/islo_logo.png)](Islo)

# Islo 🚧

Require modules in a sandbox environment. Modules are unable to require blacklisted modules and / or files outside of it's root. Islo does not require any dependencies.

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

### const box = new Islo(pathToModule, options)

- `pathToModule` _(String)_
- `options` _(Object)_
  - `key` _(String)_ Path to the root folder of the given module. By default is the file directory of the module used.
  - `blacklist` _(Array)_ If the module tries to require one of blacklisted modules will a error be thrown.
  - `middleware` _(Object)_ See the documentation about middleware for more information.
- **Returns** `Box`

Create a new sandbox environment for the given module. By default is the module allowed to require any module but not any path outside of it's root.

### box.on(eventName, callback)

- `eventName` _(String)_
- `callback` _(Function)_

Register a new handler for the given event. The callback function is called when the event is fired.

---

### Middleware

|key|arguments|description|
|-|-|-|
|isSafe|module<String>, info<Object>|This function is called when validating if a module is safe. Two arguments are passed the path/name of the module and some basic info. This function should return true if a module is safe and false if otherwise. If nothing is returned will the function be ignored.|
|require|none|This function is called when requiring a module. This function can return a custom variable/module. If a module should be wrapped inside of a sandbox could the 'wrap' method inside the scope be used. If nothing is returned is the function ignored.|

### Events

|event|description|
|-|-|
|error|A fatal error has occured when trying to execute the module. This can be caused because the module tried to require a blacklisted or unsafe module.|
