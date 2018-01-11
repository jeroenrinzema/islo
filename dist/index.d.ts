/// <reference types="node" />
import * as EventEmitter from 'events';
import Module = require('module');
export interface ExtendedModule extends Module {
    load: Function;
}
export interface SandboxOptions {
    root?: string;
    blacklist?: Array<string>;
    parent?: NodeModule['parent'];
    middleware?: {
        isSafe?: Function;
        require?: Function;
    };
    emitter?: EventEmitter;
}
export default class Sandbox {
    blacklist: Array<string>;
    tests: {
        pathUsesParent: RegExp;
        isPath: RegExp;
    };
    middleware: {
        isSafe: Function | undefined;
        require: Function | undefined;
    };
    parent: NodeModule['parent'];
    file: string;
    root: string;
    _emitter: EventEmitter;
    originalRequire: NodeRequireFunction;
    box: Module;
    exports: any;
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
    constructor(_module: string, options?: SandboxOptions);
    /**
     * Require the initialized module and run it inside of a sandbox.
     * When a error is thrown will the 'error' event be emitted.
     */
    run(): void;
    /**
     * Require the given module and create a new sandbox.
     * This function checks if the given module is blacklisted or tries
     * to require a module outside of it's root. The middleware functions
     * 'isSafe' and 'require' could be used to modify the module requirement.
     * @param  {String} module Path/name of module.
     * @return {Object}        The exported object that the module returns.
     */
    require(_module: string): any;
    /**
     * Create a sandbox wrapper around the given module.
     * The configuration of the instance is used for the sandbox creation.
     * @param  {String} _module   Path/name of module.
     * @param  {Module} Module    The module of which parent should be used. By default is the initialized Module used.
     * @return {Object}           The exported object that the module returns.
     */
    wrap(_module: string, Module?: Module): any;
    on(event: string, callback: Function): void;
    emit(event: string, ...args: Array<any>): void;
}
