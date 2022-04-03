/**
 * BSD 3-Clause License
 *
 * Copyright (c) 2018-2022, Steve Tung
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

const timesnap = require('timesnap-core');
const path = require('path');
const fs = require('fs');
const spawn = require('child_process').spawn;
const cpus = require('os').cpus().length;
const defaultFPS = 60;
const defaultThreads = 1;
const defaultDuration = 5;

const makeFileDirectoryIfNeeded = function (filepath) {
  var dir = path.parse(filepath).dir, ind, currDir;
  var directories = dir.split(path.sep);
  for (ind = 1; ind <= directories.length; ind++) {
    currDir = directories.slice(0, ind).join(path.sep);
    if (currDir && !fs.existsSync(currDir)) {
      fs.mkdirSync(currDir);
    }
  }
};

const deleteFolder = function (dir) {
  fs.readdirSync(dir).forEach(function (file) {
    fs.unlinkSync(path.join(dir, file));
  });
  fs.rmdirSync(dir);
};

const argumentArrayContains = function (args, item) {
  return args.reduce(function (accumulator, currentValue) {
    return accumulator ||
      (currentValue === item) ||
      currentValue.startsWith(item + '=');
  }, false);
};

module.exports = async function (config) {
  config = Object.assign({
    roundToEvenWidth: true,
    roundToEvenHeight: true,
    url: 'index.html',
    pixFmt: 'yuv420p'
  }, config || {});
  var output = path.resolve(process.cwd(), config.output || 'video.mp4');
  var ffmpegArgs;
  var ffmpegPath = config.ffmpegPath || 'ffmpeg';
  var inputOptions = config.inputOptions || [];
  var outputOptions = config.outputOptions || [];
  var frameDirectory = config.tempDir || config.frameDir;
  var fps;
  var threads;
  var frameMode = config.frameCache || !config.pipeMode;
  var pipeMode = config.pipeMode;
  var processError;
  var outputPattern;
  var convertProcess, processPromise;
  var extension;
  var screenshotType = (config.screenshotType || 'png');
  if (frameMode) {
    if (!frameDirectory) {
      frameDirectory = 'timecut-' + (config.keepFrames ? 'frames-' : 'temp-') + (new Date()).getTime();
    }
    if (typeof config.frameCache === 'string') {
      frameDirectory = path.join(config.frameCache, frameDirectory);
    }
    frameDirectory = path.resolve(path.parse(output).dir, frameDirectory);
    extension = '.' + screenshotType;
    outputPattern = path.resolve(frameDirectory, 'image-%09d' + extension);
  } else {
    outputPattern = '';
  }
  var timesnapConfig = Object.assign({}, config, {
    output: '',
    outputPattern: outputPattern
  });

  if (config.fps) {
    fps = config.fps;
  } else if (config.frames && config.duration) {
    fps = config.frames / config.duration;
  } else {
    fps = defaultFPS;
  }

  threads = config.threads || defaultThreads;
  if (threads > cpus) {
    threads = cpus;
  }

  const log = function () {
    if (!config.quiet) {
      // eslint-disable-next-line no-console
      console.log.apply(this, arguments);
    }
  };

  var makeProcessPromise = function () {
    makeFileDirectoryIfNeeded(output);
    var input;
    if (pipeMode) {
      input = 'pipe:0';
    } else {
      input = outputPattern;
    }
    ffmpegArgs = inputOptions;
    if (!argumentArrayContains(inputOptions, '-framerate')) {
      ffmpegArgs = ffmpegArgs.concat(['-framerate', fps]);
    }

    if (pipeMode && (screenshotType === 'jpeg' || screenshotType === 'jpg')) {
      // piping jpegs with the other method can cause an error
      // this is intended to fix that
      ffmpegArgs = ffmpegArgs.concat(['-f', 'image2pipe', '-vcodec', 'mjpeg', '-i', '-']);
    } else {
      ffmpegArgs = ffmpegArgs.concat(['-i', input]);
    }

    if (!argumentArrayContains(outputOptions, '-pix_fmt') && config.pixFmt) {
      ffmpegArgs = ffmpegArgs.concat(['-pix_fmt', config.pixFmt]);
    }
    ffmpegArgs = ffmpegArgs.concat(outputOptions);
    if (config.outputStream) {
      let outputStreamOptions = config.outputStreamOptions || {};
      let outputStreamArgs = ['-f', outputStreamOptions.format || 'mp4'];
      let movflags = outputStreamOptions.movflags;
      if (movflags === undefined) {
        movflags = 'frag_keyframe+empty_moov+faststart';
      }
      if (movflags) {
        outputStreamArgs = outputStreamArgs.concat(['-movflags', movflags]);
      }
      ffmpegArgs = ffmpegArgs.concat(outputStreamArgs).concat(['pipe:1']);
    } else {
      // by default just write out the file
      // -y writes over existing files
      ffmpegArgs = ffmpegArgs.concat(['-y', output]);
    }

    convertProcess = spawn(ffmpegPath, ffmpegArgs);
    convertProcess.stderr.setEncoding('utf8');
    convertProcess.stderr.on('data', function (data) {
      log(data);
    });
    return new Promise(function (resolve, reject) {
      convertProcess.on('close', function () {
        resolve();
      });
      convertProcess.on('error', function (err) {
        processError = err;
        reject(err);
      });
      convertProcess.stdin.on('error', function (err) {
        processError = err;
        reject(err);
      });
      if (config.outputStream) {
        convertProcess.stdout.on('error', function (err) {
          processError = err;
          reject(err);
        });
        convertProcess.stdout.pipe(config.outputStream);
      }
    });
  };

  if (pipeMode) {
    processPromise = makeProcessPromise();
    timesnapConfig.frameProcessor = function (buffer) {
      if (processError) {
        throw processError;
      }
      convertProcess.stdin.write(buffer);
    };
  }

  var overallError;
  try {
    if (threads === 1) {
      await timesnap(timesnapConfig);
    } else {
      var progress = [];
      var framesLeft = config.frames || config.duration * fps || defaultDuration * fps;
      var startFrame = 0;
      while (threads >= 1) {
        let frameLength = Math.floor(framesLeft / threads--);
        let frameStart = startFrame;
        let frameEnd = frameStart + frameLength;
        let threadConfig = Object.assign({} , timesnapConfig, {
          shouldSkipFrame({ frameCount }) {
            // frameCount is 1 based
            return frameCount <= frameStart || frameCount > frameEnd;
          }
        });
        progress.push(timesnap(threadConfig));
        startFrame = frameEnd;
        framesLeft -= frameLength;
      }
      await Promise.all(progress);
    }
    if (convertProcess) {
      convertProcess.stdin.end();
    }
    if (processPromise) {
      await processPromise;
    } else {
      await makeProcessPromise();
    }
  } catch (err) {
    overallError = err;
    log(err);
  }
  if (frameMode && !config.keepFrames) {
    deleteFolder(frameDirectory);
  }
  if (overallError) {
    throw overallError;
  }
};
