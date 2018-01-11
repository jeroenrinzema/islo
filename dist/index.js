"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const Module = require("module");
class Sandbox {
    /**
     * This class isolates the given module by creating a sandbox.
     * The sandbox does not allow modules to require files outside of it's root.
     * A blacklist can be given to reject certain modules.
     * @param  {String}   _module                     Path/name of the module.
     * @param  {Object}   options                     These options are used for the sandbox configuration.
     * @param  {String}   options.root                Path to the root folder of the given module. By default is the file directory of the module used.
     * @param  {Array}    options.blacklist           If the module tries to require one of the given strings will a error be thrown.
     * @param  {Function} options.middleware.isSafe   This middleware function is called when validating if the given module is safe. Two arguments are passed <module, info> the path/name of the module and some basic info. This function should return true if a module is safe and false if otherwise. If nothing is returned will the function be ignored.
     * @param  {Function} options.middleware.require  This middleware function is called when requiring a module. This function can return a custom variable/module. If a module should be wrapped inside of a sandbox could the 'wrap' method inside the scope be used. If nothing is returned is the function ignored.
     * @return {Sandbox}                              The sandbox class.
     */
    constructor(_module, options = {}) {
        if (!options.middleware) {
            options.middleware = {};
        }
        const parent = options.parent || module.parent;
        // Typescript thinks _resolveFilename does not exists
        const file = Module._resolveFilename(_module, parent);
        this.blacklist = options.blacklist || [];
        this.tests = {
            pathUsesParent: /^\.\./,
            isPath: /^([\.|\/]).*/
        };
        this.middleware = {
            isSafe: options.middleware.isSafe,
            require: options.middleware.require
        };
        this.parent = parent;
        this.file = file;
        this.root = options.root || path.dirname(file);
    }
    /**
     * Require the initialized module and run it inside of a sandbox.
     * When a error is thrown will the 'error' event be emitted.
     */
    run() {
        // The node types for Module are not 100% accurate
        const sandbox = new Module(this.file, this.parent);
        this.originalRequire = sandbox.require;
        this.box = sandbox;
        sandbox.require = this.require.bind(this);
        // Typescript thinks load does not exists on a Module
        sandbox.load(sandbox.id);
        this.exports = sandbox.exports;
    }
    /**
     * Require the given module and create a new sandbox.
     * This function checks if the given module is blacklisted or tries
     * to require a module outside of it's root. The middleware functions
     * 'isSafe' and 'require' could be used to modify the module requirement.
     * @param  {String} module Path/name of module.
     * @return {Object}        The exported object that the module returns.
     */
    require(_module) {
        const sandbox = this.box;
        const dirname = path.dirname(this.box.filename);
        const fullPath = _module[0] === '/' ? _module : path.join(dirname, _module);
        const relativePath = path.relative(this.root, fullPath);
        const middleware = this.middleware;
        // Checks if module is unsafe
        const isOutsideOfRoot = this.tests.pathUsesParent.test(relativePath);
        const isBlacklisted = this.blacklist.indexOf(_module) >= 0;
        const isPath = this.tests.isPath.test(_module);
        let isUnsafe = isBlacklisted || isOutsideOfRoot;
        if (middleware.isSafe) {
            // If middleware returns true mark module as safe
            const isSafe = middleware.isSafe.call(this, _module, {
                isOutsideOfRoot,
                isBlacklisted,
                isPath
            });
            isUnsafe = isSafe === undefined ? isUnsafe : !isSafe;
        }
        if (isUnsafe) {
            throw new Error(`you are not allowed to require the module: '${_module}'`);
        }
        if (middleware.require) {
            const required = middleware.require.call(this, _module);
            if (required) {
                return required;
            }
        }
        if (!isPath) {
            return this.originalRequire.call(sandbox, _module);
        }
        const innerBox = this.wrap(_module, sandbox);
        return innerBox;
    }
    /**
     * Create a sandbox wrapper around the given module.
     * The configuration of the instance is used for the sandbox creation.
     * @param  {String} _module   Path/name of module.
     * @param  {Module} Module    The module of which parent should be used. By default is the initialized Module used.
     * @return {Object}           The exported object that the module returns.
     */
    wrap(_module, Module = this.box) {
        const box = new Sandbox(_module, {
            root: this.root,
            blacklist: this.blacklist,
            parent: Module,
            middleware: this.middleware
        });
        box.run();
        return box.exports;
    }
}
exports.default = Sandbox;
