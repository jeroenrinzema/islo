/// <reference types="node" />
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
}
