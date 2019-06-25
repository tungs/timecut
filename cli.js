#!/usr/bin/env node

/**
 * BSD 3-Clause License
 *
 * Copyright (c) 2018-2019, Steve Tung
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 * * Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 * * Neither the name of the copyright holder nor the names of its
 *   contributors may be used to endorse or promote products derived from
 *   this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

const commander = require('commander');
const recorder = require('./index.js');
const packageInfo = require('./package.json');

commander
  .version(packageInfo.version, '-v, --version')
  .usage('<url> [options]')
  .option('-O, --output <file name>', 'Name of output (default: video.mp4)')
  .option('-R, --fps <frame rate>', 'Frames per second to capture (default: 60)', parseFloat)
  .option('-d, --duration <seconds>', 'Duration of capture, in seconds (default: 5)', parseFloat)
  .option('--frames <count>', 'Number of frames to capture', parseInt)
  .option('-S, --selector <selector>', 'CSS Selector of item to capture')
  .option('-V, --viewport <dimensions>', 'Viewport dimensions, in pixels (e.g. 800,600)', function (str) {
    var dims = str.split(',').map(function (d) { return parseInt(d); });
    return dims.length > 1 ? { width: dims[0], height: dims[1] } : { width: dims[0] };
  })
  .option('--transparent-background', 'Allow transparent backgrounds (only works for certain encodings)')
  .option('--frame-cache [directory]', 'Save frames in a temporary directory before processing')
  .option('-e, --input-options <options>', 'Extra arguments for ffmpeg input', function (str) {
    // TODO: make a more sophisticated parser for options that can handle quote marks
    return str.split(' ');
  })
  .option('-E, --output-options <options>', 'Extra arguments for ffmpeg output', function (str) {
    // TODO: make a more sophisticated parser for options that can handle quote marks
    return str.split(' ');
  })
  .option('-p, --pix-fmt <pixel format>', 'Pixel format of output (default: yuv420p)')
  .option('-P, --pipe-mode', 'Pipe directly to ffmpeg (experimental)')
  .option('-s, --start <n seconds>', 'Runs code for n virtual seconds before saving any frames.', parseFloat, 0)
  .option('-x, --x-offset <pixels>', 'X offset of capture, in pixels', parseFloat, 0)
  .option('-y, --y-offset <pixels>', 'Y offset of capture, in pixels', parseFloat, 0)
  .option('-W, --width <pixels>', 'Width of capture, in pixels', parseInt)
  .option('-H, --height <pixels>', 'Height of capture, in pixels', parseInt)
  .option('-l, --left <pixels>', 'left edge of capture, in pixels. Equivalent to --x-offset', parseInt)
  .option('-r, --right <pixels>', 'right edge of capture, in pixels', parseInt)
  .option('-t, --top <pixels>', 'top edge of capture, in pixels. Equivalent to --y-offset', parseInt)
  .option('-b, --bottom <pixels>', 'bottom edge of capture, in pixels', parseInt)
  .option('--start-delay <n seconds>', 'Wait n real seconds after loading.', parseFloat, 0)
  .option('-u, --unrandomize [seed]', 'Overwrite Math.random() with a PRNG with up to 4 optional, comma-separated integer seeds')
  .option('--canvas-capture-mode [type]', '(experimental) Switches to canvas mode, capturing the canvas selected by --selector as image type (default: png)')
  .option('--no-round-to-even-width', 'Disables automatic rounding of capture width up to the nearest even number.')
  .option('--no-round-to-even-height', 'Disables automatic rounding of capture height up to the nearest even number.')
  .option('-q, --quiet', 'Suppresses console logging')
  .option('--executable-path <path>', 'Uses Chromium/Chrome application at specified path for puppeteer')
  .option('-L, --launch-arguments <arguments>', 'Custom launch arguments for Puppeteer browser', function (str) {
    // TODO: make a more sophisticated parser for options that can handle quote marks
    return str.split(' ');
  })
  .option('--no-headless', 'Chromium/Chrome runs in a window instead of headless mode')
  .option('--keep-frames', 'Doesn\'t delete frames after processing them. Doesn\'t do anything in pipe mode')
  .parse(process.argv);

commander.url = commander.args[0] || 'index.html';
recorder(commander);
