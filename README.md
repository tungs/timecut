# timecut

**timecut** is a Node.js program that records smooth movies of webpages. It uses **[timesnap](https://github.com/tungs/timesnap)** and [puppeteer](https://github.com/GoogleChrome/puppeteer) to open a webpage, overwrite its time-handling functions, and takes snapshots of the webpage, and passes the results to ffmpeg to encode those frames into a movie. This allows for slower-than-realtime and/or virtual high-fps capture of frames, while the resulting movie is smooth.

**timecut** requires ffmpeg to be installed. **timecut** can be run from the command line or as a Node.js library.

## <a name="limitations" href="#limitations">#</a> **timecut** and **timesnap** Limitations
**timesnap** (and **timecut** by extension) only overwrites JavaScript functions, so pages where changes occur via other means (e.g. through video or transitions/animations from css rules) will likely not render as intended.

## <a name="modes" href="#modes">#</a> **timecut** Modes
**timecut** can pass frames to ffmpeg using one of two methods:
  * <a name="cache-frame-mode" href="#cache-frame-mode">#</a> **Cache frame mode** stores each frame temporarily in the working directory, before running ffmpeg on all of the images. This mode can use a lot of temporary space (multiple gigabytes per second of recorded time), but takes up less memory, and it is more stable than **pipe mode**. This is currently enabled by default, though it may change in the future. To explicitly use this in case of the default mode changing, use the `--frame-cache` option from the command line or setting `config.frameCache` to true when using it as a Node.js library.
  * <a name="pipe-mode" href="#pipe-mode">#</a> **Pipe mode** (experimental) pipes each frame directly to `ffmpeg`, without saving each frame. This takes up less temporary space than *cache frame mode*, but it currently has some observed stability issues. To use this mode, use the `--pipe-mode` option from the command line or setting `config.pipeCache` to true when using it as a Node.js library. If you run into issues, you may want to use [cache frame mode](#cache-frame-mode), or install and use **timesnap** and [pipe it directly to ffmpeg](https://github.com/tungs/timesnap#cli-example-piping). Both alternative implementations seem more stable than the current pipe mode.

## Read Me Contents

* [From the Command Line](#cli-use)
  * [Global Install and Use](#cli-global-install)
  * [Local Install and Use](#cli-local-install)
  * [Command Line *url*](#cli-url-use)
  * [Command Line Examples](#cli-examples)
  * [Command Line *options*](#cli-options)
* [From Node.js](#node-use)
  * [Node Install](#node-install)
  * [Node Examples](#node-examples)
  * [Node API](#node-api)

## <a name="from-cli" href="#from-cli">#</a> From the Command Line

### <a name="cli-global-install" href="#cli-global-install">#</a> Global Install and Use

Due to [an issue in puppeteer](https://github.com/GoogleChrome/puppeteer/issues/375) with permissions, timecut is not supported for global installation for root. You can configure `npm` to install global packages for a specific user following this guide: https://docs.npmjs.com/getting-started/fixing-npm-permissions#option-two-change-npms-default-directory

After configuring, to install, run:
```
npm install -g timecut
```

To use:
```
timecut "url" [options]
```

### <a name="cli-local-install" href="#cli-local-install">#</a> Local Install and Use
```
cd /path/to/installation/directory
npm install timecut
```

To use:
```
node /path/to/installation/directory/node_modules/timecut/cli.js "url" [options]
```

### <a name="cli-url-use" href="#cli-url-use">#</a> Command Line *url*
The url can be a web url (e.g. `https://github.com`) or a relative path to the current working directory (e.g. `index.html`). If no url is specified, defaults to `index.html`. For urls with special characters (like `#` and `&`), enclose the urls with quotes.

### <a name="cli-examples" href="#cli-examples">#</a> Command Line Examples

**<a name="cli-example-default" href="#cli-example-default">#</a> Default behavior**:
```
timecut
```
Opens `index.html` in the current working directory, sets the viewport to 800x600, captures at 60 frames per second for 5 virtual seconds (temporarily saving each frame), and saves `video.mp4` with the `yuv420p` pixel format in current working directory. The defaults may change in the future, so for longer term scripting, it's a good idea to explicitly pass those options, like in the following example.

**<a name="cli-example-viewport-fps-duration-mode-output" href="#cli-example-viewport-fps-duration-mode-output">#</a> Setting viewport size, frames per second, duration, mode, and output**:
```
timecut index.html --viewport 800,600 --fps 60 --duration 5 \
  --frame-cache --pix-fmt yuv420p --output video.mp4
```
Equivalent to the current default `timecut` invocation, but with explicit options. Opens `index.html` in the current working directory, sets the viewport to 800x600, captures at 60 frames per second for 5 virtual seconds (temporarily saving each frame), and saves the resulting movie using the pixel format `yuv420p` as `video.mp4`.

**<a name="cli-example-selector" href="#cli-example-selector">#</a> Using a selector**:
```
timecut drawing.html -S "canvas,svg"
```
Opens `drawing.html` in the current working directory, crops each frame to the bounding box of the first canvas or svg element, and captures frames using default settings (5 seconds @ 60fps saving to `video.mp4`).

**<a name="cli-example-offsets" href="#cli-example-offsets">#</a> Using offsets**:
```
timecut "https://tungs.github.io/truchet-tiles-original/#autoplay=true&switchStyle=random" \ 
  -S "#container" \ 
  --left 20 --top 40 --right 6 --bottom 30 \
  --duration 20
```
Opens https://tungs.github.io/truchet-tiles-original/ with the appropriate fragment url (note the quotes in the url and selector are necessary because of the `#` and `&`). Crops each frame to the `#container` element, with an additional crop of 20px, 40px, 6px, and 30px for the left, top, right, and bottom, respectively. Captures frames for 20 virtual seconds at 60fps to `video.mp4`.

### <a name="cli-options" href="#cli-options">#</a> Command Line *options*
* <a name="cli-options-output" href="#cli-options-output">#</a> Output: `-O`, `--output` *name*
    * Tells ffmpeg to save the video as *name*. File extension is used to choose encoding.
* <a name="cli-options-fps" href="#cli-options-fps">#</a> Frame Rate: `-R`, `--fps` *frame rate*
    * *frame rate* (in frames per virtual second) of capture (default: 60).
* <a name="cli-options-duration" href="#cli-options-duration">#</a> Duration: `-d`, `--duration` *seconds*
    * Duration of capture, in *seconds* (default: 5).
* <a name="cli-options-frames" href="#cli-options-frames">#</a> Frames: `-f`, `--frames` *count*
    * Number of frames to capture.
* <a name="cli-options-selector" href="#cli-options-selector">#</a> Selector: `-S`, `--selector` "*selector*"
    * CSS *selector* of item to capture.
* <a name="cli-options-viewport" href="#cli-options-viewport">#</a> Viewport: `-V`, `--viewport` *dimensions*
    * Viewport dimensions, in pixels. For example `800` (for width) or `800,600` (for width and height).
* <a name="cli-options-frame-cache" href="#cli-options-frame-cache">#</a> Frame Cache: `--frame-cache` *[directory]*
    * Saves each frame temporarily to disk before ffmpeg processes it. If *directory* is not specified, temporarily creates one in the current working directory. Enabled by default. See [cache frame mode](#cache-frame-mode).
* <a name="cli-options-pipe-mode" href="#cli-options-pipe-mode">#</a> Pipe Mode: `--pipe-mode`
    * Experimental. Pipes frames directly to ffmpeg, without saving to disk. See [pipe mode](#pipe-mode).
* <a name="cli-options-viewport" href="#cli-options-viewport">#</a> Viewport: `-V`, `--viewport` *dimensions*
    * Viewport dimensions, in pixels. For example `800` (for width) or `800,600` (for width and height).
* <a name="cli-options-start" href="#cli-options-start">#</a> Start: `-s`, `--start` *n seconds*
    * Runs code for n virtual seconds before saving any frames (default: 0).
* <a name="cli-options-x-offset" href="#cli-options-x-offset">#</a> X Offset: `-x`, `--x-offset` *pixels*
    * X offset of capture, in pixels (default: 0).
* <a name="cli-options-y-offset" href="#cli-options-y-offset">#</a> Y Offset: `-y`, `--y-offset` *pixels*
    * Y offset of capture, in pixels (default: 0).
* <a name="cli-options-width" href="#cli-options-width">#</a> Width: `-W`, `--width` *pixels*
    * Width of capture, in pixels.
* <a name="cli-options-height" href="#cli-options-height">#</a> Height: `-H`, `--height` *pixels*
    * Height of capture, in pixels.
* <a name="cli-options-transparent-background" href="#cli-options-transparent-background">#</a> Transparent Background: `--transparent-background`
    * Allows background to be transparent if there is no background styling. Only works if the output video format supports transparency.
* <a name="cli-options-even-width" href="#cli-options-width">#</a> Even Width: `--even-width`
    * Rounds width up to the nearest even number.
* <a name="cli-options-left" href="#cli-options-left">#</a> Left: `-l`, `--left` *pixels*
    * Left edge of capture, in pixels. Equivalent to `--x-offset`.
* <a name="cli-options-right" href="#cli-options-right">#</a> Right: `-r`, `--right` *pixels*
    * Right edge of capture, in pixels. Ignored if `width` is specified.
* <a name="cli-options-top" href="#cli-options-top">#</a> Top: `-t`, `--top` *pixels*
    * Top edge of capture, in pixels. Equivalent to `--y-offset`.
* <a name="cli-options-bottom" href="#cli-options-bottom">#</a> Bottom: `-b`, `--bottom` *pixels*
    * Bottom edge of capture, in pixels. Ignored if `height` is specified.
* <a name="cli-options-load-delay" href="#cli-options-load-delay">#</a> Load Delay: `--load-delay` *n seconds*
    * Wait *n real seconds* after loading.
* <a name="cli-options-quiet" href="#cli-options-quiet">#</a> Quiet: `-q`, `--quiet`
    * Suppress console logging.
* <a name="cli-options-extra-input-options" href="#cli-options-extra-input-options">#</a> Extra input options: `-e`, `--input-options`. Extra arguments for ffmpeg input, enclosed in quotes. Example: `--input-options="-framerate 30"`
* <a name="cli-options-extra-output-options" href="#cli-options-extra-output-options">#</a> Extra output options: `-E`, `--input-options`. Extra arguments for ffmpeg output, enclosed in quotes. Example: `--output-options="-vf scale=320:240"`
    * Pixel Format for output video (default: `yuv420p`).
* <a name="cli-options-pixel-format" href="#cli-options-pixel-format">#</a> Pixel Format: `--pix-fmt` *pixel format*
    * Pixel Format for output video (default: `yuv420p`).
* <a name="cli-options-version" href="#cli-options-version">#</a> Version: `v`, `--version`
    * Display version information. Immediately exits.
* <a name="cli-options-help" href="#cli-options-help">#</a> Help: `h`, `--help`
    * Display command line options. Immediately exits.

## <a name="node-use" href="#node-use">#</a> From Node.js
**timecut** can also be included as a library inside Node.js programs.

### <a name="node-install" href="#node-install">#</a> Node Install
```
npm install timecut --save
```

### <a name="node-examples" href="#node-examples">#</a> Node Examples
```
const timecut = require('timecut');
timecut({
  url: 'https://github.com',
  fps: 30,
  duration: 10
}).then(function () {
  console.log('Done!');
});
```

### <a name="node-api" href="#node-api">#</a> Node API

There are a few options for the Node API that are not accessible through the command line interface: `config.logToStdErr`

**timecut(config)**
*  <a name="js-api-config" href="#js-api-config">#</a> `config` &lt;[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)&gt;
    * <a name="js-config-url" href="#js-config-url">#</a> `url` &lt;[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type)&gt; The url to load. It can be a web url, like `https://github.com` or a relative path to the current working directory, like `index.html` (default: 'index.html').
    * <a name="js-config-output" href="#js-config-output">#</a> `output` &lt;[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type)&gt; Tells ffmpeg to save the video as *name*. File extension is used to choose encoding.
    * <a name="js-config-fps" href="#js-config-fps">#</a> `fps` &lt;[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type)&gt; frame rate, in frames per virtual second, of capture (default: 60).
    * <a name="js-config-duration" href="#js-config-duration">#</a> `duration` &lt;[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type)&gt; Duration of capture, in seconds (default: 5).
    * <a name="js-config-frames" href="#js-config-frames">#</a> `frames` &lt;[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type)&gt; Number of frames to capture. Overrides default fps or default duration.
    * <a name="js-config-selector" href="#js-config-selector">#</a> `selector` &lt;[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type)&gt; [CSS selector](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors) of item to capture.
    * <a name="js-config-frame-cache" href="#js-config-frame-cache">#</a> `frameCache` &lt;[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type)|[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type)&gt; Saves each frame temporarily to disk before ffmpeg processes it. If `config.frameCache` is a string, uses that as the directory to save the temporary files. If `config.frameCache` is a boolean `true`, temporarily creates a directory in the current working directory. See [cache frame mode](#cache-frame-mode).
    * <a name="js-config-pipe-mode" href="#js-config-pipe-mode">#</a> `pipeMode` &lt;[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type)&gt; Experimental. If set to `true`, pipes frames directly to ffmpeg, without saving to disk. See [pipe mode](#pipe-mode).
    * <a name="js-config-viewport" href="#js-config-viewport">#</a> `viewport` &lt;[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)&gt;
        * <a name="js-config-viewport-width" href="#js-config-viewport-width">#</a> `width` &lt;[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type)&gt; Width of viewport.
        * <a name="js-config-viewport-height" href="#js-config-viewport-height">#</a> `height` &lt;[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type)&gt; Height of viewport.
        * <a name="js-config-viewport-scale-factor" href="#js-config-viewport-scale-factor">#</a> `deviceScaleFactor` &lt;[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type)&gt; Device scale factor (default: 1).
        * <a name="js-config-viewport-mobile" href="#js-config-viewport-mobile">#</a> `isMobile` &lt;[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type)&gt; Specifies whether the `meta viewport` tag should be used (default: false).
        * <a name="js-config-viewport-touch" href="#js-config-viewport-touch">#</a> `hasTouch` &lt;[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type)&gt; Specifies whether the viewport supports touch (default: false).
        * <a name="js-config-viewport-landscape" href="#js-config-viewport-landscape">#</a> `isLandscape` &lt;[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type)&gt; Specifies whether the viewport is in landscape mode (default: false).
    * <a name="js-config-start" href="#js-config-start">#</a> `start` &lt;[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type)&gt; Runs code for `config.start` virtual seconds before saving any frames (default: 0).
    * <a name="js-config-x-offset" href="#js-config-x-offset">#</a> `xOffset` &lt;[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type)&gt; X offset of capture, in pixels (default: 0).
    * <a name="js-config-y-offset" href="#js-config-y-offset">#</a> `yOffset` &lt;[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type)&gt; Y offset of capture, in pixels (default: 0).
    * <a name="js-config-width" href="#js-config-width">#</a> `width` &lt;[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type)&gt; Width of capture, in pixels.
    * <a name="js-config-height" href="#js-config-height">#</a> `height` &lt;[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type)&gt; Height of capture, in pixels.
    * <a name="js-config-transparent-background" href="#js-config-transparent-background">#</a> `transparentBackground` &lt;[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type)&gt; Allows background to be transparent if there is no background styling. Only works if the output video format supports transparency.
    * <a name="js-config-even-width" href="#js-config-even-width">#</a> `evenWidth` &lt;[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type)&gt; Rounds width up to the nearest even number.
    * <a name="js-config-left" href="#js-config-left">#</a> `left` &lt;[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type)&gt; Left edge of capture, in pixels. Equivalent to `config.xOffset`.
    * <a name="js-config-right" href="#js-config-right">#</a> `right` &lt;[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type)&gt; Right edge of capture, in pixels. Ignored if `width` is specified.
    * <a name="js-config-top" href="#js-config-top">#</a> `top` &lt;[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type)&gt; Top edge of capture, in pixels. Equivalent to `config.yOffset`.
    * <a name="js-config-bottom" href="#js-config-bottom">#</a> `bottom` &lt;[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type)&gt; Bottom edge of capture, in pixels. Ignored if `height` is specified.
    * <a name="js-config-load-delay" href="#js-config-load-delay">#</a> `loadDelay` &lt;[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type)&gt; Wait `config.loadDelay` real seconds after loading (default: 0).
    * <a name="js-config-quiet" href="#js-config-quiet">#</a> `quiet` &lt;[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type)&gt; Suppress console logging.
    * <a name="js-config-input-options" href="#js-config-input-options">#</a> `inputOptions` &lt;[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) &lt;[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type)&gt;&gt; Extra arguments for ffmpeg input. Example: `['-framerate', '30']`
    * <a name="js-config-output-options" href="#js-config-output-options">#</a> `outputOptions` &lt;[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) &lt;[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type)&gt;&gt; Extra arguments for ffmpeg output. Example: `['-vf', 'scale=320:240']`
    * <a name="js-config-pixel-format" href="#js-config-pixel-format">#</a> `pixelFormat` &lt;[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type)&gt; Pixel Format for output video (default: `yuv420p`).
    * <a name="js-config-log-to-std-err" href="#js-config-log-to-std-err">#</a> `logToStdErr` &lt;[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type)&gt; Log to stderr instead of stdout. Doesn't do anything if `config.quiet` is set to true.
* <a name="js-api-return" href="#js-api-return">#</a> returns: &lt;[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&gt; resolves after all the frames have been captured.

## <a name="how-it-works" href="#how-it-works">#</a> How it works
**timecut** uses **[timesnap](https://github.com/tungs/timesnap)** to record frames to send to `ffmpeg`. **timesnap** uses puppeteer's `page.evaluateOnNewDocument` feature to automatically overwrite a page's native time-handling JavaScript functions (`new Date().getTime()`, `Date.now`, `performance.now`, `requestAnimationFrame`, `setTimeout`, `setInterval`, `cancelAnimationFrame`, `cancelTimeout`, and `cancelInterval`) to custom ones that use a virtual timeline. Events, allowing for any computation to complete before taking a screenshot.

This work was inspired by [a talk by Noah Veltman](https://github.com/veltman/d3-unconf), who described manually altering a document's `Date.now` and `performance.now` functions and using `puppeteer` to change time and take snapshots. 
