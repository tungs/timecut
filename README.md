# timecut

**timecut** is a Node.js program that records smooth videos of web pages that use JavaScript animations. It uses **[timesnap](https://github.com/tungs/timesnap)** and [puppeteer](https://github.com/GoogleChrome/puppeteer) to open a web page, overwrite its time-handling functions, take snapshots of the web page, and then passes the results to ffmpeg to encode those frames into a video. This allows for slower-than-realtime and/or virtual high-fps capture of frames, while the resulting video is smooth.

# timecut-core

**timecut-core** is a version of timecut that uses [timesnap-core](https://github.com/tungs/timesnap/tree/core#timesnap-core) which does not automatically bundle puppeteer. It differs from `timecut` by requiring a [`config.launcher`](#js-config-launcher) function or a [`config.browser`](#js-config-browser) object to be passed, and does not have a command line interface. It's stored on the [`core`](https://github.com/tungs/timecut/tree/core#timecut-core) branch of `timecut` and derived from its code. All pull requests should be based on the main branches of `timecut` and `timesnap` instead of the core branches, unless in the rare event that it's particular only to the core branches.

To only record screenshots and save them as pictures, see **[timesnap](https://github.com/tungs/timesnap)** and **[timesnap-core](https://github.com/tungs/timesnap/tree/core#timesnap-core)**.

## <a name="limitations" href="#limitations">#</a> **timecut** and **timesnap** Limitations
**timesnap** (and **timecut** by extension) only overwrites JavaScript functions and video playback, so pages where changes occur via other means (e.g. through transitions/animations from CSS rules) will likely not render as intended.

## Read Me Contents

* [From Node.js](#from-node)
  * [Node Install](#node-install)
  * [Node Examples](#node-examples)
  * [Node API](#node-api)
* [timecut Modes](#modes)
* [How it works](#how-it-works)

## <a name="from-node" href="#from-node">#</a> From Node.js

### <a name="node-install" href="#node-install">#</a> Node Install
```
npm install timecut-core --save
```

`timecut-core` also requires ffmpeg to be installed.

### <a name="node-examples" href="#node-examples">#</a> Node Examples

For these examples, we'll use puppeteer version 2.1.1, which doesn't require additional libraries, beyond ffmpeg, to be installed.

```
npm install puppeteer@2.1.1 --save
```

**<a name="node-example-basic" href="#node-example-basic">#</a> Basic Use:**

Specify a [`config.launcher`](#js-config-launcher) function that creates a browser instance with certain launch options.

```node
const timecut = require('timecut-core');
const puppeteer = require('puppeteer');
timecut({
  launcher: launchOptions => puppeteer.launch(launchOptions),
  url: 'https://tungs.github.io/truchet-tiles-original/#autoplay=true&switchStyle=random',
  viewport: {
    width: 800,               // sets the viewport (window size) to 800x600
    height: 600
  },
  selector: '#container',     // crops each frame to the bounding box of '#container'
  left: 20, top: 40,          // further crops the left by 20px, and the top by 40px
  right: 6, bottom: 30,       // and the right by 6px, and the bottom by 30px
  fps: 30,                    // saves 30 frames for each virtual second
  duration: 20,               // for 20 virtual seconds 
  output: 'video.mp4'         // to video.mp4 of the current working directory
}).then(function () {
  console.log('Done!');
});
```

**<a name="node-example-browser" href="#node-example-browser">#</a> Using `config.browser`:**

You can also use [`config.browser`](#js-config-browser), though it might ignore / disable some launch options like [`config.quiet`](#js-config-quiet), [`config.logToStdErr`](#js-config-log-to-std-err), [`config.headless`](#js-config-headless), [`config.executablePath`](#js-config-executable-path), and [`config.launchArguments`](#js-config-launch-arguments). You can specify custom launch arguments through `puppeteer.launch()`.

```node
const timecut = require('timecut-core');
const puppeteer = require('puppeteer');
timecut({
  browser: puppeteer.launch({ dumpio: true }), // can add custom launch options here
  url: 'https://tungs.github.io/truchet-tiles-original/#autoplay=true&switchStyle=random',
  selector: '#container',
  output: 'truchet-tiles.mp4'
}).then(function () {
  console.log('Done!');
});
```

### <a name="node-api" href="#node-api">#</a> Node API

The Node API is structured similarly to the command line options, but there are a few options for the Node API that are not accessible through the command line interface: [`config.logToStdErr`](#js-config-log-to-std-err), [`config.preparePage`](#js-config-prepare-page), [`config.preparePageForScreenshot`](#js-config-prepare-page-for-screenshot), [`config.logger`](#js-config-logger), and certain [`config.viewport`](#js-config-viewport) properties.

**timecut(config)**
*  <a name="js-api-config" href="#js-api-config">#</a> `config` &lt;[Object][]&gt;
    * <a name="js-config-launcher" href="#js-config-launcher">#</a> `launcher` &lt;[function][]([Object][])&gt; A function that returns or resolves a puppeteer or puppeteer-like browser. It is passed a [launch options argument](https://github.com/puppeteer/puppeteer/blob/main/docs/api.md#puppeteerlaunchoptions), which should be passed to `puppeteer.launch`, if possible.
    * <a name="js-config-browser" href="#js-config-browser">#</a> `browser` &lt;[Object][]&gt; The instance of a puppeteer or puppeteer-like browser. Note that certain configuration options might not work as intended or might be ignored, like [`config.quiet`](#js-config-quiet), [`config.logToStdErr`](#js-config-log-to-std-err), [`config.headless`](#js-config-headless), [`config.executablePath`](#js-config-executable-path), and [`config.launchArguments`](#js-config-launch-arguments).
    * <a name="js-config-url" href="#js-config-url">#</a> `url` &lt;[string][]&gt; The url to load. It can be a web url, like `https://github.com` or a file path, with relative paths resolving in the current working directory (default: `index.html`).
    * <a name="js-config-output" href="#js-config-output">#</a> `output` &lt;[string][]&gt; Tells ffmpeg to save the video as *name*.  Its file extension determines encoding if not explicitly specified. Default name: `video.mp4`.
    * <a name="js-config-fps" href="#js-config-fps">#</a> `fps` &lt;[number][]&gt; frame rate, in frames per virtual second, of capture (default: `60`).
    * <a name="js-config-duration" href="#js-config-duration">#</a> `duration` &lt;[number][]&gt; Duration of capture, in seconds (default: `5`).
    * <a name="js-config-frames" href="#js-config-frames">#</a> `frames` &lt;[number][]&gt; Number of frames to capture. Overrides default fps or default duration.
    * <a name="js-config-selector" href="#js-config-selector">#</a> `selector` &lt;[string][]&gt; Crops each frame to the bounding box of the first item found by the specified [CSS selector][].
    * <a name="js-config-frame-cache" href="#js-config-frame-cache">#</a> `frameCache` &lt;[string][]|[boolean][]&gt; Saves each frame temporarily to disk before ffmpeg processes it. If `config.frameCache` is a string, uses that as the directory to save the temporary files. If `config.frameCache` is a boolean `true`, temporarily creates a directory in the current working directory. See [cache frame mode](#cache-frame-mode).
    * <a name="js-config-pipe-mode" href="#js-config-pipe-mode">#</a> `pipeMode` &lt;[boolean][]&gt; Experimental. If set to `true`, pipes frames directly to ffmpeg, without saving to disk. See [pipe mode](#pipe-mode).
    * <a name="js-config-viewport" href="#js-config-viewport">#</a> `viewport` &lt;[Object][]&gt;
        * <a name="js-config-viewport-width" href="#js-config-viewport-width">#</a> `width` &lt;[number][]&gt; Width of viewport, in pixels (default: `800`).
        * <a name="js-config-viewport-height" href="#js-config-viewport-height">#</a> `height` &lt;[number][]&gt; Height of viewport, in pixels (default: `600`).
        * <a name="js-config-viewport-scale-factor" href="#js-config-viewport-scale-factor">#</a> `deviceScaleFactor` &lt;[number][]&gt; Device scale factor (default: `1`).
        * <a name="js-config-viewport-mobile" href="#js-config-viewport-mobile">#</a> `isMobile` &lt;[boolean][]&gt; Specifies whether the `meta viewport` tag should be used (default: `false`).
        * <a name="js-config-viewport-touch" href="#js-config-viewport-touch">#</a> `hasTouch` &lt;[boolean][]&gt; Specifies whether the viewport supports touch (default: `false`).
        * <a name="js-config-viewport-landscape" href="#js-config-viewport-landscape">#</a> `isLandscape` &lt;[boolean][]&gt; Specifies whether the viewport is in landscape mode (default: `false`).
    * <a name="js-config-canvas-capture-mode" href="#js-config-canvas-capture-mode">#</a> `canvasCaptureMode` &lt;[boolean][] | [string][]&gt;
        * Experimental. Captures images from canvas data instead of screenshots. See [canvas capture mode](#canvas-capture-mode). Can provide an optional image format (e.g. `png`), otherwise it uses the saved image's extension, or defaults to `png` if the format is not specified or supported. Can prefix the format with `immediate:` (e.g. `immediate:png`) to immediately capture pixel data after rendering, which is sometimes needed for some WebGL renderers. Specify the canvas by [setting `config.selector`](#js-config-selector), otherwise it defaults to the first canvas in the document.
    * <a name="js-config-start" href="#js-config-start">#</a> `start` &lt;[number][]&gt; Runs code for `config.start` virtual seconds before saving any frames (default: `0`).
    * <a name="js-config-x-offset" href="#js-config-x-offset">#</a> `xOffset` &lt;[number][]&gt; X offset of capture, in pixels (default: `0`).
    * <a name="js-config-y-offset" href="#js-config-y-offset">#</a> `yOffset` &lt;[number][]&gt; Y offset of capture, in pixels (default: `0`).
    * <a name="js-config-width" href="#js-config-width">#</a> `width` &lt;[number][]&gt; Width of capture, in pixels.
    * <a name="js-config-height" href="#js-config-height">#</a> `height` &lt;[number][]&gt; Height of capture, in pixels.
    * <a name="js-config-transparent-background" href="#js-config-transparent-background">#</a> `transparentBackground` &lt;[boolean][]&gt; Allows background to be transparent if there is no background styling. Only works if the output video format supports transparency.
    * <a name="js-config-round-to-even-width" href="#js-config-round-to-even-width">#</a> `roundToEvenWidth` &lt;[boolean][]&gt; Rounds capture width up to the nearest even number (default: `true`).
    * <a name="js-config-round-to-even-height" href="#js-config-round-to-even-height">#</a> `roundToEvenHeight` &lt;[boolean][]&gt; Rounds capture height up to the nearest even number (default: `true`).
    * <a name="js-config-left" href="#js-config-left">#</a> `left` &lt;[number][]&gt; Left edge of capture, in pixels. Equivalent to `config.xOffset`.
    * <a name="js-config-right" href="#js-config-right">#</a> `right` &lt;[number][]&gt; Right edge of capture, in pixels. Ignored if `config.width` is specified.
    * <a name="js-config-top" href="#js-config-top">#</a> `top` &lt;[number][]&gt; Top edge of capture, in pixels. Equivalent to `config.yOffset`.
    * <a name="js-config-bottom" href="#js-config-bottom">#</a> `bottom` &lt;[number][]&gt; Bottom edge of capture, in pixels. Ignored if `config.height` is specified.
    * <a name="js-config-unrandomize" href="#js-config-unrandomize">#</a> `unrandomize` &lt;[boolean][] | [string][] | [number][] | [Array][]&lt;[number][]&gt;&gt; Overwrites `Math.random` with a seeded pseudorandom number generator. If it is a number, an array of up to four numbers, or a string of up to four comma separated numbers, then those values are used as the initial seeds. If it is true, then the default seed is used. If it is the string 'random-seed', a random seed will be generated, displayed (if quiet mode is not enabled), and used.
    * <a name="js-config-executable-path" href="#js-config-executable-path">#</a> `executablePath` &lt;[string][]&gt; Uses the Chromium/Chrome instance at `config.executablePath` for puppeteer.
    * <a name="js-config-launch-arguments" href="#js-config-launch-arguments">#</a> `launchArguments` &lt;[Array][] &lt;[string][]&gt;&gt; Extra arguments for Puppeteer/Chromium. Example: `['--single-process']`. A list of arguments can be found [here](https://peter.sh/experiments/chromium-command-line-switches).
    * <a name="js-config-headless" href="#js-config-headless">#</a> `headless` &lt;[boolean][]&gt; Runs puppeteer in headless (nonwindowed) mode (default: `true`).
    * <a name="js-config-screenshot-type" href="#js-config-screenshot-type">#</a> `screenshotType` &lt;[string][]&gt; Output image format for the screenshots. By default, `'png'` is used. `'jpeg'` is also available.
    * <a name="js-config-screenshot-quality" href="#js-config-screenshot-quality">#</a> `screenshotQuality` &lt;[number][]&gt; Quality level between 0 to 1 for lossy screenshots. Defaults to 0.92 when in [canvas capture mode](#js-config-canvas-capture-mode) and 0.8 otherwise.
    * <a name="js-config-input-options" href="#js-config-input-options">#</a> `inputOptions` &lt;[Array][] &lt;[string][]&gt;&gt; Extra arguments for ffmpeg input. Example: `['-framerate', '30']`
    * <a name="js-config-output-options" href="#js-config-output-options">#</a> `outputOptions` &lt;[Array][] &lt;[string][]&gt;&gt; Extra arguments for ffmpeg output. Example: `['-vf', 'scale=320:240']`
    * <a name="js-config-pixel-format" href="#js-config-pixel-format">#</a> `pixFmt` &lt;[string][]&gt; Pixel format for output video (default: `yuv420p`).
    * <a name="js-config-start-delay" href="#js-config-start-delay">#</a> `startDelay` &lt;[number][]&gt; Waits `config.startDelay` real seconds after loading before starting (default: `0`).
    * <a name="js-config-keep-frames" href="#js-config-keep-frames">#</a> `keepFrames` &lt;[boolean][]&gt; If set to true, doesn't delete frames after processing them. Doesn't do anything in pipe mode.
    * <a name="js-config-quiet" href="#js-config-quiet">#</a> `quiet` &lt;[boolean][]&gt; Suppresses console logging.
    * <a name="js-config-logger" href="#js-config-logger">#</a> `logger` &lt;[function][](...[Object][])&gt; Replaces console logging with a particular function. The passed arguments are the same as those to `console.log` (in this case, usually one string).
    * <a name="js-config-log-to-std-err" href="#js-config-log-to-std-err">#</a> `logToStdErr` &lt;[boolean][]&gt; Logs to stderr instead of stdout. Doesn't do anything if `config.quiet` is set to true.
    * <a name="js-config-prepare-page" href="#js-config-prepare-page">#</a> `preparePage` &lt;[function][]([Page][])&gt; A setup function that will be called one time before taking screenshots. If it returns a promise, capture will be paused until the promise resolves.
        * `page` &lt;[Page][]&gt; The puppeteer instance of the page being captured.
    * <a name="js-config-prepare-page-for-screenshot" href="#js-config-prepare-page-for-screenshot">#</a> `preparePageForScreenshot` &lt;[function][]([Page][], [number][], [number][])&gt; A setup function that will be called before each screenshot. If it returns a promise, capture will be paused until the promise resolves.
        * `page` &lt;[Page][]&gt; The puppeteer instance of the page being captured.
        * `frameNumber` &lt;[number][]&gt; The current frame number (1 based).
        * `totalFrames` &lt;[number][]&gt; The total number of frames.
* <a name="js-api-return" href="#js-api-return">#</a> returns: &lt;[Promise][]&gt; resolves after all the frames have been captured.

## <a name="modes" href="#modes">#</a> **timecut** Modes
### <a name="capture-modes" href="#capture-modes">#</a> Capture Modes
**timecut** can capture frames to using one of two modes:
  * <a name="screenshot-capture-mode" href="#screenshot-capture-mode">#</a> **Screenshot capture mode** (default) uses puppeteer's built-in API to take screenshots of Chromium/Chrome windows. It can capture most parts of a webpage (e.g. div, svg, canvas) as they are rendered on the webpage. It can crop images, round to even widths/heights, but it usually runs slower than canvas capture mode.
  * <a name="canvas-capture-mode" href="#canvas-capture-mode">#</a> **Canvas capture mode** (experimental) directly copies data from a canvas element and is often faster than using screenshot capture mode. If the background of the canvas is transparent, it may show up as transparent or black depending on the captured image format and the output video format. Configuration options that adjust the crop and round to an even width/height do not currently have an effect. To use this mode, [use the `--canvas-capture-mode` option from the command line](#cli-options-canvas-capture-mode) or [set `config.canvasCaptureMode` from Node.js](#js-config-canvas-capture-mode). Also specify the canvas using a css selector, [using the `--selector` option from the command line](#cli-options-selector) or [setting `config.selector` from Node.js](#js-config-selector), otherwise it uses the first canvas element.
### <a name="frame-transfer-modes" href="#frame-transfer-modes">#</a> Frame Transfer Modes
**timecut** can pass frames to ffmpeg using one of two modes:
  * <a name="cache-frame-mode" href="#cache-frame-mode">#</a> **Cache frame mode** stores each frame temporarily before running ffmpeg on all of the images. This mode can use a lot of temporary disk space (hundreds of megabytes per second of recorded time), but takes up less memory and is more stable than [pipe mode](#pipe-mode). This is currently enabled by default, though it may change in the future. To explicitly use this mode, [use the `--frame-cache` option from the command line](#cli-options-frame-cache) or [set `config.frameCache` from Node.js](#js-config-frame-cache) to `true` or to a directory name.
  * <a name="pipe-mode" href="#pipe-mode">#</a> **Pipe mode** (experimental) pipes each frame directly to `ffmpeg`, without saving each frame. This takes up less temporary space than [cache frame mode](#cache-frame-mode), but it currently has some observed stability issues. To use this mode, [use the `--pipe-mode` option from the command line](#cli-options-pipe-mode) or [set `config.pipeCache` to `true` from Node.js](#js-config-pipe-mode). If you run into issues, you may want to try [cache frame mode](#cache-frame-mode) or to install and use **timesnap** and [pipe it directly to ffmpeg](https://github.com/tungs/timesnap#cli-example-piping). Both alternative implementations seem more stable than the current pipe mode.

## <a name="how-it-works" href="#how-it-works">#</a> How it works
**timecut** uses **[timesnap](https://github.com/tungs/timesnap)** to record frames to send to `ffmpeg`. **timesnap** uses puppeteer's `page.evaluateOnNewDocument` feature to automatically overwrite a page's native time-handling JavaScript functions and objects (`new Date()`, `Date.now`, `performance.now`, `requestAnimationFrame`, `setTimeout`, `setInterval`, `cancelAnimationFrame`, `cancelTimeout`, and `cancelInterval`) to custom ones that use a virtual timeline, allowing for JavaScript computation to complete before taking a screenshot.

This work was inspired by [a talk by Noah Veltman](https://github.com/veltman/d3-unconf), who described altering a document's `Date.now` and `performance.now` functions to refer to a virtual time and using `puppeteer` to change that virtual time and take snapshots.

[Object]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object
[Array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
[Promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[string]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type
[number]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type
[boolean]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type
[function]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions
[CSS selector]: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors
[Page]: https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-page
