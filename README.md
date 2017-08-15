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

### new Islo(\<path to module\>, \<options\>)

### Options

|key|type|description|required?|default value|
|-|-|-|-|-|
|root|String|Path to the root folder of the given module. By default is the file directory of the module used.|optional|path to the directory of the given module|
|blacklist|Array\<String\>|If the module tries to require one of blacklisted modules will a error be thrown.|optional|no default value|
|middleware|Object|See the documentation about middleware for more information.|optional|no default value|

### Middleware

|key|arguments|description|
|-|-|-|
|isSafe|module<String>, info<Object>|This function is called when validating if a module is safe. Two arguments are passed the path/name of the module and some basic info. This function should return true if a module is safe and false if otherwise. If nothing is returned will the function be ignored.|
|require|none|This function is called when requiring a module. This function can return a custom variable/module. If a module should be wrapped inside of a sandbox could the 'wrap' method inside the scope be used. If nothing is returned is the function ignored.|
