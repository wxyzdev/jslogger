/*
 * How to load this module in content_script.js
 *
 * 1. Add "web_accessible_resources" key to manifest.json like:
 * ---
 * "web_accessible_resources": [{
 *     "matches": ["https://this-module-enabled-site/*"],
 *     "resources": ["this-module-filename.js"]
 * }],
 * ---
 * or add with other modules like:
 * ---
 * "web_accessible_resources": [{
 *     "matches": ["<all_urls>"],
 *     "resources": ["/your-module-located-dir/*.js"]
 * }],
 * ---
 * 
 * 2. Import this module at the head section of content_script.js like:
 * ---
 * var jslogger;
 * (async () => {
 *     jslogger = (await import(chrome.runtime.getURL("jslogger.js")));
 *     await jslogger.setLogging(true);
 *     await jslogger.setLevel('DEBUG');
 *     await jslogger.setApp('MyApp');
 *     await jslogger.setVivid(true);
 * })();
 * ---
 * or in the async function like:
 * ---
 * // Load this module by 'await loadModules();' in async function main().
 * var jslogger;
 * async function loadModules () {
 *     if(typeof jslogger === 'undefined'){
 *         jslogger = (await import(chrome.runtime.getURL("jslogger.js")));
 *         await jslogger.setLogging(true);
 *         await jslogger.setLevel('DEBUG');
 *         await jslogger.setApp('MyApp');
 *         await jslogger.setVivid(true);
 *     };
 *     return true;
 * }
 * ---
 * 
 * 3. Use this module like:
 * ---
 * 100  await loadModules();  // Ensure the completion of the loading module.
 * 101  const logger = jslogger.logger;
 * ...
 * 200  logger().info('This is a test.');           //   [2023-04-05T06:07:08.090Z] [INFO] (MyApp)  This is a test.                               content_script.js:200
 * 201  logger().object({'a':1, 'b':2});            //   [2023-04-05T06:07:08.091Z] [INFO] (MyApp)  >{'a':1, 'b':2}                               content_script.js:201
 * 202  logger().debug('object: ', {'a':1, 'b':2}); //   [2023-04-05T06:07:08.092Z] [DEBUG] (MyApp)  object: >{'a':1, 'b':2}                      content_script.js:202
 * ...
 * 300  logger().errobj(err);                       // x > [2023-04-05T06:07:08.093Z] [ERROR] (MyApp)  TypeError: Cannot read properties of ...   content_script.js:300
 * 301  logger().fatal('', err);                    // x > [2023-04-05T06:07:08.094Z] [FATAL] (MyApp)  TypeError: Cannot read properties of ...   content_script.js:301
 * ---
 * 
 */

'use strict';

/* ========================================================= Global variable  ========================================================= */

const LogLevel = {
    TRACE: 0,
    DEBUG: 1,
    INFO: 2,
    WARN: 3,
    ERROR: 4,
    FATAL: 5,
    OFF: 6,
    UNKNOWN: 9
}
let _loggingLevel = LogLevel.OFF;
let _loggingApp = 'unknown';
let _isColored = false;
let _isVivid = false;
let _isLogging = false;
let _isDarkMode = false;


/* ============================================== Functions to implement Console Logging ============================================== */
/** 
 * @param {string} string A string describing the log level of this module.
 * @return {number} A number of corresponding to the given LogLevel. 9 (LogLevel.UNKNOWN) if the given string is not able to be interpreted.
 */
function _convertStringIntoLevel(string) {
    let level = LogLevel.UNKNOWN;
    if(string == 'TRACE'){
        level = LogLevel.TRACE;
    }else if(string == 'DEBUG'){
        level = LogLevel.DEBUG;
    }else if(string == 'INFO'){
        level = LogLevel.INFO;
    }else if(string == 'WARN'){
        level = LogLevel.WARN;
    }else if(string == 'ERROR'){
        level = LogLevel.ERROR;
    }else if(string == 'FATAL'){
        level = LogLevel.FATAL;
    }else if(string == 'OFF'){
        level = LogLevel.OFF;
    };

    return level;
}

/** 
 * @param {string} level A string describing the log level of the logging application.
 * @return {Promise<boolean>}
 * @note await jslogger.setLevel('DEBUG');
 */
export async function setLevel(level) {
    if(_convertStringIntoLevel(level) <= LogLevel.OFF && _isLogging){
        console.debug('%s', '[' + (new Date).toJSON() + '] [DEBUG] (jslogger)  Log level was set to ' + level + ' (' + _convertStringIntoLevel(level) + ').');
    }else if(_convertStringIntoLevel(level) > LogLevel.OFF && _isLogging){
        console.debug('%s', '[' + (new Date).toJSON() + '] [DEBUG] (jslogger)  Log level was set to UNKNOWN (' + _convertStringIntoLevel(level) + ').');
    };
    _loggingLevel = _convertStringIntoLevel(level);

    return true;
}

/** 
 * @param {string} level A string describing the logging app. 'unknown' is set as the default.
 * @return {Promise<boolean>}
 * @note await jslogger.setApp('MyApp');
 */
export async function setApp(appName) {
    if(typeof appName == 'string' & _isLogging){
        console.debug('%s', '[' + (new Date).toJSON() + '] [DEBUG] (jslogger)  Logging application is ' + appName + '.');

        _loggingApp = appName;
    }else if(typeof appName == 'string'){
        _loggingApp = appName;
    };

    return true;
}

/** 
 * @param {boolean} isColored Set {@code true} to make this module output console log messages with pale colors.
 * @return {Promise<boolean>}
 * @note await jslogger.setColored(true);
 */
export async function setColored(isColored) {
    _isDarkMode = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if(isColored == true && _isLogging){
        console.debug('%s', '[' + (new Date).toJSON() + '] [DEBUG] (jslogger)  Enabled colored outputs in ' + (_isDarkMode ? 'dark':'light') + ' mode.');
    }else if(isColored != true && _isLogging){
        console.debug('%s', '[' + (new Date).toJSON() + '] [DEBUG] (jslogger)  Disabled colored outputs in ' + (_isDarkMode ? 'dark':'light') + ' mode.');
    };
    _isColored = isColored;

    return true;
}

/** 
 * @param {boolean} isVivid Set {@code true} to make this module output console log messages with vivid colors.
 * @return {Promise<boolean>}
 * @note await jslogger.setVivid(true);
 */
export async function setVivid(isVivid) {
    _isDarkMode = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if(isVivid == true && _isLogging){
        console.debug('%s', '[' + (new Date).toJSON() + '] [DEBUG] (jslogger)  Enabled vivid outputs in ' + (_isDarkMode ? 'dark':'light') + ' mode.');
    }else if(isVivid != true && _isLogging){
        console.debug('%s', '[' + (new Date).toJSON() + '] [DEBUG] (jslogger)  Disabled vivid outputs in ' + (_isDarkMode ? 'dark':'light') + ' mode.');
    };
    _isVivid = isVivid;

    return true;
}

/** 
 * @param {boolean} isLogging Set {@code true} to make this module output console debug log messages.
 * The debug messages are output aside from log messages of the logging application.
 * @return {Promise<boolean>}
 * @note await jslogger.setLogging(true);
 */
export async function setLogging(isLogging) {
    if(isLogging == true && !_isLogging){
        console.debug('%s', '[' + (new Date).toJSON() + '] [DEBUG] (jslogger)  Enabled jslogger logging.');
    }else if(isLogging != true && _isLogging){
        console.debug('%s', '[' + (new Date).toJSON() + '] [DEBUG] (jslogger)  Disabled jslogger logging.');
    };
    _isLogging = isLogging;

    return true;
}

/** 
 * @return {object} An associative array of functions that are based on console.log.
 * @note logger().info('This is a test.');           //   [2023-04-05T06:07:08.090Z] [INFO] (MyApp)  This is a test.
 *       logger().object({'a':1, 'b':2});            //   [2023-04-05T06:07:08.091Z] [INFO] (MyApp)  >{'a':1, 'b':2}
 *       logger().debug('object: ', {'a':1, 'b':2}); //   [2023-04-05T06:07:08.092Z] [DEBUG] (MyApp)  object: >{'a':1, 'b':2}
 *       logger().errobj(err);                       // x > [2023-04-05T06:07:08.093Z] [ERROR] (MyApp)  TypeError: Cannot read properties of ...
 *       logger().fatal('', err);                    // x > [2023-04-05T06:07:08.094Z] [FATAL] (MyApp)  TypeError: Cannot read properties of ...
 */
export var logger = () => {
    return {
        trace: (() => {
            if(_loggingLevel <= LogLevel.TRACE && _isVivid && _isDarkMode){
                return console.debug.bind(console, '%c%s%s', 'color:#FF00FF;background:#00000030;', '[' + (new Date).toJSON() + '] [TRACE] (' + _loggingApp + ')  ');
            }else if(_loggingLevel <= LogLevel.TRACE && _isVivid && !_isDarkMode){
                return console.debug.bind(console, '%c%s%s', 'color:#FF00FF;background:#FFFFFF30;', '[' + (new Date).toJSON() + '] [TRACE] (' + _loggingApp + ')  ');
            }else if(_loggingLevel <= LogLevel.TRACE && _isColored && _isDarkMode){
                return console.debug.bind(console, '%c%s%s', 'color:#C29AAF', '[' + (new Date).toJSON() + '] [TRACE] (' + _loggingApp + ')  ');
            }else if(_loggingLevel <= LogLevel.TRACE && _isColored && !_isDarkMode){
                return console.debug.bind(console, '%c%s%s', 'color:#C484A7', '[' + (new Date).toJSON() + '] [TRACE] (' + _loggingApp + ')  ');
            }else if(_loggingLevel <= LogLevel.TRACE){
                return console.debug.bind(console, '%s%s', '[' + (new Date).toJSON() + '] [TRACE] (' + _loggingApp + ')  ');
            }else{
                return () => {};
            };
        })(),
        debug: (() => {
            if(_loggingLevel <= LogLevel.DEBUG && _isVivid && _isDarkMode){
                return console.debug.bind(console, '%c%s%s', 'color:#00FFFF;background:#00000030;', '[' + (new Date).toJSON() + '] [DEBUG] (' + _loggingApp + ')  ');
            }else if(_loggingLevel <= LogLevel.DEBUG && _isVivid && !_isDarkMode){
                return console.debug.bind(console, '%c%s%s', 'color:#004EFF', '[' + (new Date).toJSON() + '] [DEBUG] (' + _loggingApp + ')  ');
            }else if(_loggingLevel <= LogLevel.DEBUG && _isColored && _isDarkMode){
                return console.debug.bind(console, '%c%s%s', 'color:#CCE6F7', '[' + (new Date).toJSON() + '] [DEBUG] (' + _loggingApp + ')  ');
            }else if(_loggingLevel <= LogLevel.DEBUG && _isColored && !_isDarkMode){
                return console.debug.bind(console, '%c%s%s', 'color:#005B96', '[' + (new Date).toJSON() + '] [DEBUG] (' + _loggingApp + ')  ');
            }else if(_loggingLevel <= LogLevel.DEBUG){
                return console.debug.bind(console, '%s%s', '[' + (new Date).toJSON() + '] [DEBUG] (' + _loggingApp + ')  ');
            }else{
                return () => {};
            };
        })(),
        log: (() => {
            if(_loggingLevel <= LogLevel.INFO && _isVivid && _isDarkMode){
                return console.info.bind (console, '%c%s%s', 'background:#00000030;', '[' + (new Date).toJSON() + '] [INFO] (' + _loggingApp + ')  ');
            }else if(_loggingLevel <= LogLevel.INFO){
                return console.info.bind (console, '%s%s', '[' + (new Date).toJSON() + '] [INFO] (' + _loggingApp + ')  ');
            }else{
                return () => {};
            };
        })(),
        object: (() => {
            if(_loggingLevel <= LogLevel.INFO && _isVivid && _isDarkMode){
                return console.info.bind (console, '%c%s%o', 'color:#8FFF08;background:#00000030;', '[' + (new Date).toJSON() + '] [INFO] (' + _loggingApp + ')  ');
            }else if(_loggingLevel <= LogLevel.INFO && _isVivid && !_isDarkMode){
                return console.info.bind (console, '%c%s%o', 'color:#00CC6E', '[' + (new Date).toJSON() + '] [INFO] (' + _loggingApp + ')  ');
            }else if(_loggingLevel <= LogLevel.INFO && _isColored && _isDarkMode){
                return console.info.bind (console, '%c%s%o', 'color:#D1E8DA', '[' + (new Date).toJSON() + '] [INFO] (' + _loggingApp + ')  ');
            }else if(_loggingLevel <= LogLevel.INFO && _isColored && !_isDarkMode){
                return console.info.bind (console, '%c%s%o', 'color:#107336', '[' + (new Date).toJSON() + '] [INFO] (' + _loggingApp + ')  ');
            }else if(_loggingLevel <= LogLevel.INFO){
                return console.info.bind (console, '%s%o', '[' + (new Date).toJSON() + '] [INFO] (' + _loggingApp + ')  ');
            }else{
                return () => {};
            };
        })(),
        info: (() => {
            if(_loggingLevel <= LogLevel.INFO && _isVivid && _isDarkMode){
                return console.info.bind (console, '%c%s%s', 'color:#8FFF08;background:#00000030;', '[' + (new Date).toJSON() + '] [INFO] (' + _loggingApp + ')  ');
            }else if(_loggingLevel <= LogLevel.INFO && _isVivid && !_isDarkMode){
                return console.info.bind (console, '%c%s%s', 'color:#00CC6E', '[' + (new Date).toJSON() + '] [INFO] (' + _loggingApp + ')  ');
            }else if(_loggingLevel <= LogLevel.INFO && _isColored && _isDarkMode){
                return console.info.bind (console, '%c%s%s', 'color:#D1E8DA', '[' + (new Date).toJSON() + '] [INFO] (' + _loggingApp + ')  ');
            }else if(_loggingLevel <= LogLevel.INFO && _isColored && !_isDarkMode){
                return console.info.bind (console, '%c%s%s', 'color:#107336', '[' + (new Date).toJSON() + '] [INFO] (' + _loggingApp + ')  ');
            }else if(_loggingLevel <= LogLevel.INFO){
                return console.info.bind (console, '%s%s', '[' + (new Date).toJSON() + '] [INFO] (' + _loggingApp + ')  ');
            }else{
                return () => {};
            };
        })(),
        warn: (() => {
            if(_loggingLevel <= LogLevel.WARN && _isVivid && _isDarkMode){
                return console.warn.bind (console, '%c%s%s', 'color:#FFF8B8;background:#DBDB0044', '[' + (new Date).toJSON() + '] [WARN] (' + _loggingApp + ')  ');
            }else if(_loggingLevel <= LogLevel.WARN && _isVivid && !_isDarkMode){
                return console.warn.bind (console, '%c%s%s', 'color:#FF8800', '[' + (new Date).toJSON() + '] [WARN] (' + _loggingApp + ')  ');
            }else if(_loggingLevel <= LogLevel.WARN){
                return console.warn.bind (console, '%s%s', '[' + (new Date).toJSON() + '] [WARN] (' + _loggingApp + ')  ');
            }else{
                return () => {};
            };
        })(),
        error: (() => {
            if(_loggingLevel <= LogLevel.ERROR && _isVivid && _isDarkMode){
                return console.error.bind(console, '%c%s%s', 'color:#FFCFD7;background:#AA000077;', '[' + (new Date).toJSON() + '] [ERROR] (' + _loggingApp + ')  ');
            }else if(_loggingLevel <= LogLevel.ERROR && _isVivid && !_isDarkMode){
                return console.error.bind(console, '%c%s%s', 'color:#BB0000', '[' + (new Date).toJSON() + '] [ERROR] (' + _loggingApp + ')  ');
            }else if(_loggingLevel <= LogLevel.ERROR){
                return console.error.bind(console, '%s%s', '[' + (new Date).toJSON() + '] [ERROR] (' + _loggingApp + ')  ');
            }else{
                return () => {};
            };
        })(),
        errobj: (() => {
            if(_loggingLevel <= LogLevel.ERROR && _isVivid && _isDarkMode){
                return console.error.bind(console, '%c%s%o', 'color:#FFCFD7;background:#AA000077;', '[' + (new Date).toJSON() + '] [ERROR] (' + _loggingApp + ')  ');
            }else if(_loggingLevel <= LogLevel.ERROR && _isVivid && !_isDarkMode){
                return console.error.bind(console, '%c%s%o', 'color:#BB0000', '[' + (new Date).toJSON() + '] [ERROR] (' + _loggingApp + ')  ');
            }else if(_loggingLevel <= LogLevel.ERROR){
                return console.error.bind(console, '%s%o', '[' + (new Date).toJSON() + '] [ERROR] (' + _loggingApp + ')  ');
            }else{
                return () => {};
            };
        })(),
        fatal: (() => {
            if(_loggingLevel <= LogLevel.FATAL && _isVivid && _isDarkMode){
                return console.error.bind(console, '%c%s%s', 'color:#FFD700;background:#AA0000CC;', '[' + (new Date).toJSON() + '] [FATAL] (' + _loggingApp + ')  ');
            }else if(_loggingLevel <= LogLevel.FATAL && _isVivid && !_isDarkMode){
                return console.error.bind(console, '%c%s%s', 'color:#FFD700;background:#AA0000CC;', '[' + (new Date).toJSON() + '] [FATAL] (' + _loggingApp + ')  ');
            }else if(_loggingLevel <= LogLevel.FATAL && _isColored){
                return console.error.bind(console, '%c%s%s', 'color:#FFD700;background:#AA0000CC;', '[' + (new Date).toJSON() + '] [FATAL] (' + _loggingApp + ')  ');
            }else if(_loggingLevel <= LogLevel.FATAL){
                return console.error.bind(console, '%s%s', '[' + (new Date).toJSON() + '] [FATAL] (' + _loggingApp + ')  ');
            }else{
                return () => {};
            };
        })()
    };
};