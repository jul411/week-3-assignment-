'use strict';

const http = require('http');
const https = require('https');

const defaults = require('./defaults.js');
const externalRequest = require('./external-request.js');

function devToolsInterface(path, options, callback) {
    const transport = options.secure ? https : http;
    const requestOptions = {
        method: options.method,
        host: options.host || defaults.HOST,
        port: options.port || defaults.PORT,
        useHostName: options.useHostName,
        path: (options.alterPath ? options.alterPath(path) : path)
    };
    externalRequest(transport, requestOptions, callback);
}

function promisesWrapper(func) {
    return (options, callback) => {
        if (typeof options === 'function') {
            callback = options;
            options = undefined;
        }
        options = options || {};
        if (typeof callback === 'function') {
            func(options, callback);
            return undefined;
        } else {
            return new Promise((fulfill, reject) => {
                func(options, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        fulfill(result);
                    }
                });
            });
        }
    };
}

function Protocol(options, callback) {
    if (options.local) {
        const localDescriptor = require('./protocol.json');
        callback(null, localDescriptor);
        return;
    }
    devToolsInterface('/json/protocol', options, (err, descriptor) => {
        if (err) {
            callback(err);
        } else {
            callback(null, JSON.parse(descriptor));
        }
    });
}

function List(options, callback) {
    devToolsInterface('/json/list', options, (err, tabs) => {
        if (err) {
            callback(err);
        } else {
            callback(null, JSON.parse(tabs));
        }
    });
}

function New(options, callback) {
    let path = '/json/new';
    if (Object.prototype.hasOwnProperty.call(options, 'url')) {
        path += `?${options.url}`;
    }
    options.method = options.method || 'PUT';
    devToolsInterface(path, options, (err, tab) => {
        if (err) {
            callback(err);
        } else {
            callback(null, JSON.parse(tab));
        }
    });
}

function Activate(options, callback) {
    devToolsInterface('/json/activate/' + options.id, options, (err) => {
        if (err) {
            callback(err);
        } else {
            callback(null);
        }
    });
}

function Close(options, callback) {
    devToolsInterface('/json/close/' + options.id, options, (err) => {
        if (err) {
            callback(err);
        } else {
            callback(null);
        }
    });
}

function Version(options, callback) {
    devToolsInterface('/json/version', options, (err, versionInfo) => {
        if (err) {
            callback(err);
        } else {
            callback(null, JSON.parse(versionInfo));
        }
    });
}

module.exports.Protocol = promisesWrapper(Protocol);
module.exports.List = promisesWrapper(List);
module.exports.New = promisesWrapper(New);
module.exports.Activate = promisesWrapper(Activate);
module.exports.Close = promisesWrapper(Close);
module.exports.Version = promisesWrapper(Version);
