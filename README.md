# timecut

**timecut** is a Node.js program that records smooth videos of web pages that use JavaScript animations. It uses **[timesnap](https://github.com/tungs/timesnap)** and [puppeteer](https://github.com/GoogleChrome/puppeteer) to open a web page, overwrite its time-handling functions, take snapshots of the web page, and then passes the results to ffmpeg to encode those frames into a video. This allows for slower-than-realtime and/or virtual high-fps capture of frames, while the resulting video is smooth.

You can run **timecut** from the command line or as a Node.js library. It requires ffmpeg, Node v6.4.0 or higher, and npm.

To only record screenshots and save them as pictures, see **[timesnap](https://github.com/tungs/timesnap)**.

## <a name="limitations" href="#limitations">#</a> **timecut** and **timesnap** Limitations
**timesnap** (and **timecut** by extension) only overwrites JavaScript functions and video playback, so pages where changes occur via other means (e.g. through transitions/animations from CSS rules) will likely not render as intended.

## Read Me Contents

* [From the Command Line](#from-cli)
  * [Global Install and Use](#cli-global-install)
  * [Local Install and Use](#cli-local-install)
  * [Command Line *url*](#cli-url-use)
  * [Command Line Examples](#cli-examples)
  * [Command Line *options*](#cli-options)
* [From Node.js](#from-node)
  * [Node Install](#node-install)
  * [Node Examples](#node-examples)
  * [Node API](#node-api)
* [timecut Modes](#modes)
* [How it works](#how-it-works)

## <a name="from-cli" href="#from-cli">#</a> From the Command Line

### <a name="cli-global-install" href="#cli-global-install">#</a> Global Install and Use

To install:

Due to [an issue in puppeteer](https://github.com/GoogleChrome/puppeteer/issues/375) with permissions, timecut is not supported for global installation for root. You can configure `npm` to install global packages for a specific user following this guide: https://docs.npmjs.com/getting-started/fixing-npm-permissions#option-two-change-npms-default-directory

After configuring, run:
```
npm install -g timecut
```

To use:
```
timecut "url" [options]
```

### <a name="cli-local-install" href="#cli-local-install">#</a> Local Install and Use

To install:

```
cd /path/to/installation/directory
npm install timecut
```

To use:
```
node /path/to/installation/directory/node_modules/timecut/cli.js "url" [options]
```

*Alternatively*:

To install:


```
cd /path/to/installation/directory
git clone https://github.com/tungs/timecut.git
cd timecut
npm install
```

To use:
```
node /path/to/installation/directory/timecut/cli.js "url" [options]
```

### <a name="cli-url-use" href="#cli-url-use">#</a> Command Line *url*
The url can be a web url (e.g. `https://github.com`) or a file path, with relative paths resolving in the current working directory. If no url is specified, defaults to `index.html`. Remember to enclose urls that contain special characters (like `#` and `&`) with quotes.

### <a name="cli-examples" href="#cli-examples">#</a> Command Line Examples

**<a name="cli-example-default" href="#cli-example-default">#</a> Default behavior**:
```
timecut
```
Opens `index.html` in the current working directory, sets the viewport to 800x600, captures at 60 frames per second for 5 virtual seconds (temporarily saving each frame), and saves `video.mp4` with the `yuv420p` pixel format in the current working directory. The defaults may change in the future, so for long-term scripting, it's a good idea to explicitly pass these options, like in the following example.

**<a name="cli-example-viewport-fps-duration-mode-output" href="#cli-example-viewport-fps-duration-mode-output">#</a> Setting viewport size, frames per second, duration, mode, and output**:
```
timecut index.html --viewport=800,600 --fps=60 --duration=5 \
  --frame-cache --pix-fmt=yuv420p --output=video.mp4
```
Equivalent to the current default `timecut` invocation, but with explicit options. Opens `index.html` in the current working directory, sets the viewport to 800x600, captures at 60 frames per second for 5 virtual seconds (temporarily saving each frame), and saves the resulting video using the pixel format `yuv420p` as `video.mp4`.

**<a name="cli-example-selector" href="#cli-example-selector">#</a> Using a selector**:
```
timecut drawing.html -S "canvas,svg"
```
Opens `drawing.html` in the current working directory, crops each frame to the bounding box of the first canvas or svg element, and captures frames using default settings (5 seconds @ 60fps saving to `video.mp4`).

**<a name="cli-example-offsets" href="#cli-example-offsets">#</a> Using offsets**:
```
timecut "https://tungs.github.io/truchet-tiles-original/#autoplay=true&switchStyle=random" \ 
  -S "#container" \ 
  --left=20 --top=40 --right=6 --bottom=30 \
  --duration=20
```
Opens https://tungs.github.io/truchet-tiles-original/#autoplay=true&switchStyle=random (note the quotes in the url and selector are necessary because of the `#` and `&`). Crops each frame to the `#container` element, with an additional crop of 20px, 40px, 6px, and 30px for the left, top, right, and bottom, respectively. Captures frames for 20 virtual seconds at 60fps to `video.mp4` in the current working directory.

### <a name="cli-options" href="#cli-options">#</a> Command Line *options*
* <a name="cli-options-output" href="#cli-options-output">#</a> Output: `-O`, `--output` *name*
    * Tells ffmpeg to save the video as *name*. Its file extension determines encoding if not explicitly specified.
* <a name="cli-options-fps" href="#cli-options-fps">#</a> Frame Rate: `-R`, `--fps` *frame rate*
    * Frame rate (in frames per virtual second) of capture (default: `60`).
* <a name="cli-options-duration" href="#cli-options-duration">#</a> Duration: `-d`, `--duration` *seconds*
    * Duration of capture, in *seconds* (default: `5`).
* <a name="cli-options-frames" href="#cli-options-frames">#</a> Frames: `--frames` *count*
    * Number of frames to capture.
* <a name="cli-options-selector" href="#cli-options-selector">#</a> Selector: `-S`, `--selector` "*selector*"
    * Crops each frame to the bounding box of the first item found by the [CSS *selector*][CSS selector].
* <a name="cli-options-viewport" href="#cli-options-viewport">#</a> Viewport: `-V`, `--viewport` *dimensions*
    * Viewport dimensions, in pixels. For example `800` (for width) or `800,600` (for width and height).
* <a name="cli-options-frame-cache" href="#cli-options-frame-cache">#</a> Frame Cache: `--frame-cache` *[directory]*
    * Saves each frame temporarily to disk before ffmpeg processes it. If *directory* is not specified, temporarily creates one in the current working directory. Enabled by default. See [cache frame mode](#cache-frame-mode).
* <a name="cli-options-pipe-mode" href="#cli-options-pipe-mode">#</a> Pipe Mode: `--pipe-mode`
    * Experimental. Pipes frames directly to ffmpeg, without saving to disk. See [pipe mode](#pipe-mode).
* <a name="cli-options-canvas-capture-mode" href="#cli-options-canvas-capture-mode">#</a> Canvas Mode: `--canvas-capture-mode` *\[format\]*
    * Experimental. Captures images from canvas data instead of screenshots. See [canvas capture mode](#canvas-capture-mode). Can provide an optional image format (e.g. `png`), otherwise it uses the saved image's extension, or defaults to `png` if the format is not specified or supported. Can prefix the format with `immediate:` (e.g. `immediate:png`) to immediately capture pixel data after rendering, which is sometimes needed for some WebGL renderers. Specify the canvas [using the `--selector` option](#cli-options-selector), otherwise it defaults to the first canvas in the document.
* <a name="cli-options-start" href="#cli-options-start">#</a> Start: `-s`, `--start` *n seconds*
    * Runs code for n virtual seconds before saving any frames (default: `0`).
* <a name="cli-options-x-offset" href="#cli-options-x-offset">#</a> X Offset: `-x`, `--x-offset` *pixels*
    * X offset of capture, in pixels (default: `0`).
* <a name="cli-options-y-offset" href="#cli-options-y-offset">#</a> Y Offset: `-y`, `--y-offset` *pixels*
    * Y offset of capture, in pixels (default: `0`).
* <a name="cli-options-width" href="#cli-options-width">#</a> Width: `-W`, `--width` *pixels*
    * Width of capture, in pixels.
* <a name="cli-options-height" href="#cli-options-height">#</a> Height: `-H`, `--height` *pixels*
    * Height of capture, in pixels.
* <a name="cli-options-no-round-to-even-width" href="#cli-options-no-round-to-even-width">#</a> No Even Width Rounding: `--no-round-to-even-width`
    * Disables automatic rounding of capture width up to the nearest even number.
* <a name="cli-options-no-round-to-even-height" href="#cli-options-no-round-to-even-height">#</a> No Even Height Rounding: `--no-round-to-even-height`
    * Disables automatic rounding of capture height up to the nearest even number.
* <a name="cli-options-transparent-background" href="#cli-options-transparent-background">#</a> Transparent Background: `--transparent-background`
    * Allows background to be transparent if there is no background styling. Only works if the output video format supports transparency.
* <a name="cli-options-left" href="#cli-options-left">#</a> Left: `-l`, `--left` *pixels*
    * Left edge of capture, in pixels. Equivalent to `--x-offset`.
* <a name="cli-options-right" href="#cli-options-right">#</a> Right: `-r`, `--right` *pixels*
    * Right edge of capture, in pixels. Ignored if `width` is specified.
* <a name="cli-options-top" href="#cli-options-top">#</a> Top: `-t`, `--top` *pixels*
    * Top edge of capture, in pixels. Equivalent to `--y-offset`.
* <a name="cli-options-bottom" href="#cli-options-bottom">#</a> Bottom: `-b`, `--bottom` *pixels*
    * Bottom edge of capture, in pixels. Ignored if `height` is specified.
* <a name="cli-options-unrandomize" href="#cli-options-unrandomize">#</a> Unrandomize: `-u`, `--unrandomize` *\[seeds\]*
    * Overwrites `Math.random` with a seeded pseudorandom number generator. Can provide optional seeds as up to four comma separated integers (e.g. `--unrandomize 2,3,5,7` or `--unrandomize 42`). If `seeds` is `random-seed` (i.e. `--unrandomize random-seed`), a random seed will be generated, displayed (if not in quiet mode), and used. If `seeds` is not provided, it uses the seeds `10,0,20,0`.
* <a name="cli-options-executable-path" href="#cli-options-executable-path">#</a> Executable Path: `--executable-path` *path*
    * Uses the Chromium/Chrome instance at *path* for puppeteer.
* <a name="cli-options-launch-arguments" href="#cli-options-launch-arguments">#</a> Puppeteer Launch Arguments: `-L`, `--launch-arguments` *arguments*
    * Arguments to pass to Puppeteer/Chromium, enclosed in quotes. Example: `--launch-arguments="--single-process"`. A list of arguments can be found [here](https://peter.sh/experiments/chromium-command-line-switches).
* <a name="cli-options-no-headless" href="#cli-options-no-headless">#</a> No Headless: `--no-headless`
    * Runs Chromium/Chrome in windowed mode.
* <a name="cli-options-extra-input-options" href="#cli-options-extra-input-options">#</a> Extra input options: `-e`, `--input-options` *options*
    * Extra arguments for ffmpeg input, enclosed in quotes. Example: `--input-options="-framerate 30"`
* <a name="cli-options-extra-output-options" href="#cli-options-extra-output-options">#</a> Extra output options: `-E`, `--output-options` *options*
    * Extra arguments for ffmpeg output, enclosed in quotes. Example: `--output-options="-vf scale=320:240"`
* <a name="cli-options-pixel-format" href="#cli-options-pixel-format">#</a> Pixel Format: `--pix-fmt` *pixel format*
    * Pixel format for output video (default: `yuv420p`).
* <a name="cli-options-start-delay" href="#cli-options-start-delay">#</a> Start Delay: `--start-delay` *n seconds*
    * Waits *n real seconds* after loading the page before starting to capture.
* <a name="cli-options-keep-frames" href="#cli-options-keep-frames">#</a> Keep Frames: `--keep-frames`
    * Doesn't delete frames after processing them. Doesn't do anything in pipe mode.
* <a name="cli-options-quiet" href="#cli-options-quiet">#</a> Quiet: `-q`, `--quiet`
    * Suppresses console logging.
* <a name="cli-options-version" href="#cli-options-version">#</a> Version: `-v`, `--version`
    * Displays version information. Immediately exits.
* <a name="cli-options-help" href="#cli-options-help">#</a> Help: `-h`, `--help`
    * Displays command line options. Immediately exits.

## <a name="from-node" href="#from-node">#</a> From Node.js
**timecut** can also be included as a library inside Node.js programs.

### <a name="node-install" href="#node-install">#</a> Node Install
```
npm install timecut --save
```

### <a name="node-examples" href="#node-examples">#</a> Node Examples

**<a name="node-example-basic" href="#node-example-basic">#</a> Basic Use:**
```node
const timecut = require('timecut');
timecut({
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

**<a name="node-example-multiple" href="#node-example-multiple">#</a> Multiple pages (Requires Node v7.6.0 or higher):**
```node
const timecut = require('timecut');
var pages = [
  {
    url: 'https://tungs.github.io/truchet-tiles-original/#autoplay=true',
    output: 'truchet-tiles.mp4',
    selector: '#container'
  }, {
    url: 'https://breathejs.org/examples/Drawing-US-Counties.html',
    output: 'counties.mp4',
    selector: null // with no selector, it defaults to the viewport dimensions
  }
];
(async () => {
  for (let page of pages) {
    await timecut({
      url: page.url,
      output: page.output,
      selector: page.selector,
      viewport: {
        width: 800,
        height: 600
      },
      duration: 20
    });
  }
})();
```

### <a name="node-api" href="#node-api">#</a> Node API

The Node API is structured similarly to the command line options, but there are a few options for the Node API that are not accessible through the command line interface: [`config.logToStdErr`](#js-config-log-to-std-err), [`config.preparePage`](#js-config-prepare-page), [`config.preparePageForScreenshot`](#js-config-prepare-page-for-screenshot), and certain [`config.viewport`](#js-config-viewport) properties.

**timecut(config)**
*  <a name="js-api-config" href="#js-api-config">#</a> `config` &lt;[Object][]&gt;
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
    * <a name="js-config-input-options" href="#js-config-input-options">#</a> `inputOptions` &lt;[Array][] &lt;[string][]&gt;&gt; Extra arguments for ffmpeg input. Example: `['-framerate', '30']`
    * <a name="js-config-output-options" href="#js-config-output-options">#</a> `outputOptions` &lt;[Array][] &lt;[string][]&gt;&gt; Extra arguments for ffmpeg output. Example: `['-vf', 'scale=320:240']`
    * <a name="js-config-pixel-format" href="#js-config-pixel-format">#</a> `pixelFormat` &lt;[string][]&gt; Pixel format for output video (default: `yuv420p`).
    * <a name="js-config-start-delay" href="#js-config-start-delay">#</a> `startDelay` &lt;[number][]&gt; Waits `config.loadDelay` real seconds after loading before starting (default: `0`).
    * <a name="js-config-keep-frames" href="#js-config-keep-frames">#</a> `keepFrames` &lt;[boolean][]&gt; If set to true, doesn't delete frames after processing them. Doesn't do anything in pipe mode.
    * <a name="js-config-quiet" href="#js-config-quiet">#</a> `quiet` &lt;[boolean][]&gt; Suppresses console logging.
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