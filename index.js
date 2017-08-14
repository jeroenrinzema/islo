const path = require('path')
const Events = require('events')
const Module = require('module')

module.exports = class Sandbox {
  /**
   * This class isolates the given module by creating a sandbox.
   * The sandbox does not allow modules to require files outside of it's root.
   * A blacklist can be given to reject certain modules.
   * @param  {String}   module                      Path/name of the module.
   * @param  {Object}   options                     These options are used for the sandbox configuration.
   * @param  {String}   options.root                Path to the root folder of the given module. By default is the file directory of the module used.
   * @param  {Array}    options.blacklist           If the module tries to require one of the given strings will a error be thrown.
   * @param  {Function} options.middleware.isSafe   This middleware function is called when validating if the given module is safe. Two arguments are passed <module, info> the path/name of the module and some basic info. This function should return true if a module is safe and false if otherwise. If nothing is returned will the function be ignored.
   * @param  {Function} options.middleware.require  This middleware function is called when requiring a module. This function can return a custom variable/module. If a module should be wrapped inside of a sandbox could the 'wrap' method inside the scope be used. If nothing is returned is the function ignored.
   * @return {Sandbox}                              The sandbox class.
   */
  constructor (module, options = {}) {
    if (!options.middleware) {
      options.middleware = {}
    }

    const parent = options.parent || module.parent
    const file = Module._resolveFilename(module, parent)

    this.blacklist = options.blacklist || []
    this.tests = {
      pathUsesParent: /^\.\./,
      isNotPath: /^\w+/
    }

    this.middleware = {
      isSafe: options.middleware.isSafe,
      require: options.middleware.require
    }

    this.parent = parent
    this.file = file
    this.root = options.root || path.dirname(module)

    this._emitter = new Events.EventEmitter()
  }
  /**
   * Require the initialized module and run it inside of a sandbox.
   * When a error is thrown will the 'error' event be emitted.
   */
  run () {
    try {
      const sandbox = new Module(this.file, this.parent)

      this.originalRequire = sandbox.require
      this.box = sandbox

      sandbox.require = this.require.bind(this)
      sandbox.load(sandbox.id)

      this.exports = sandbox.exports
    } catch (error) {
      this.emit('error', error)
    }
  }
  /**
   * Require the given module and create a new sandbox.
   * This function checks if the given module is blacklisted or tries
   * to require a module outside of it's root. The middleware functions
   * 'isSafe' and 'require' could be used to modify the module requirement.
   * @param  {String} module Path/name of module.
   * @return {Object}        The exported object that the module returns.
   */
  require (module) {
    const sandbox = this.box
    const relativePath = path.relative(this.root, module)
    const middleware = this.middleware

    // Checks if module is unsafe
    const isOutsideOfRoot = this.tests.pathUsesParent.test(relativePath)
    const isBlacklisted = this.blacklist.indexOf(module) >= 0
    const isNotPath = this.tests.isNotPath.test(module)

    let isUnsafe = isBlacklisted || isOutsideOfRoot

    if (middleware.isSafe) {
      // If middleware returns true mark module as safe
      const isSafe = middleware.isSafe.call(this, module, {
        isOutsideOfRoot,
        isBlacklisted,
        isNotPath
      })

      isUnsafe = isSafe === undefined ? isUnsafe : !isSafe
    }

    if (isUnsafe) {
      throw new Error(`you are not allowed to require the module: '${module}'`)
    }

    if (middleware.require) {
      const required = middleware.require.call(this, module)

      if (required) {
        return required
      }
    }

    if (isNotPath) {
      return this.originalRequire.call(sandbox, module)
    }

    const innerBox = this.wrap(module, sandbox)
    return innerBox
  }
  /**
   * Create a sandbox wrapper around the given module.
   * The configuration of the instance is used for the sandbox creation.
   * @param  {String} module    Path/name of module.
   * @param  {Module} Module    The module of which parent should be used. By default is the initialized Module used.
   * @return {Object}           The exported object that the module returns.
   */
  wrap (module, Module = this.box) {
    const box = new Sandbox(module, {
      root: this.root,
      blacklist: this.blacklist,
      parent: Module.parent,
      middleware: this.middleware
    })

    box.run()

    return box.exports
  }
  on (event, callback) {
    this._emitter.on.call(this._emitter, event, callback)
  }
  emit (event, ...args) {
    this._emitter.emit(event, ...args)
  }
}
