# jslogger
A simple module for Chromium based browser extensions to output console messages in comfortable or highlighted colors with specified level, the application name and ISO 8601 timestamp. 
This module is optimized for me to debug extensions. What brings the motivation to implement this is that popular methods didn't preserve the original filename and line number when I tried to insert a timestamp for debugging. In my opinion, two functions, one for timestamp and another for console.log, need to be called in the same line.

## How to use
### 1. Add "web_accessible_resources" key to manifest.json like:

```json
"web_accessible_resources": [{
    "matches": ["https://this-module-enabled-site/*"],
    "resources": ["this-module-filename.js"]
}],
```
or add with other modules like:

```json
"web_accessible_resources": [{
    "matches": ["<all_urls>"],
    "resources": ["/your-module-located-dir/*.js"]
}],
```

### 2. Import this module at the head section of content_script.js like:

```javascript
var jslogger;
(async () => {
    jslogger = (await import(chrome.runtime.getURL("jslogger.js")));
    await jslogger.setLogging(true);
    await jslogger.setLevel('DEBUG');
    await jslogger.setApp('MyApp');
    await jslogger.setVivid(true);
})();
```

or in the async function like:

```javascript
// Load this module by 'await loadModules();' in async function main().
var jslogger;
async function loadModules () {
    if(typeof jslogger === 'undefined'){
        jslogger = (await import(chrome.runtime.getURL("jslogger.js")));
        await jslogger.setLogging(true);
        await jslogger.setLevel('DEBUG');
        await jslogger.setApp('MyApp');
        await jslogger.setVivid(true);
    };
    return true;
}
```

### 3. Use this module like:

```javascript
// content_script.js
100  await loadModules();  // Ensure the completion of the loading module
101  const logger = jslogger.logger;
...
200  logger().info('This is a test.');  // Use logger().info(), not logger.info()
201  logger().object({'a':1, 'b':2});
202  logger().debug('object: ', {'a':1, 'b':2});
...
300  logger().errobj(err);
301  logger().fatal('', err);

// Browser console
//   [2023-04-05T06:07:08.090Z] [INFO] (MyApp)  This is a test.                               content_script.js:200
//   [2023-04-05T06:07:08.091Z] [INFO] (MyApp)  >{'a':1, 'b':2}                               content_script.js:201
//   [2023-04-05T06:07:08.092Z] [DEBUG] (MyApp)  object: >{'a':1, 'b':2}                      content_script.js:202
// x > [2023-04-05T06:07:08.093Z] [ERROR] (MyApp)  TypeError: Cannot read properties of ...   content_script.js:300
// x > [2023-04-05T06:07:08.094Z] [FATAL] (MyApp)  TypeError: Cannot read properties of ...   content_script.js:301
```
