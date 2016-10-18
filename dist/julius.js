/*!
 * JuliusJS
 *
 * This is a modification of the Large Vocabulary Continuous Speech Recognition Engine Julius
 * to work in modern browser environments with JavaScript.
 *
 * The modifications are licensed under The MIT License (MIT)
 *
 * Copyright (c) 2014 Zachary Pomerantz, @zzmp
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * Original licensing still applies.
 *
 * ORIGINAL LICENSES
 *
 * XAUDIOJS
 * Resampler.js is taken from https://github.com/grantgalitz/XAudioJS, and is in the Public Domain.
 *
 *
 * LARGE VOCABULARY CONTINUOUS SPEECH RECOGNITION ENGINE JULIUS:
 * THIS IS ENGLISH TRANSLATION OF THE JAPANESE ORIGINAL FOR REFERENCE
 *
 *
 * Copyright (c) 1991-2013 Kawahara Lab., Kyoto University
 * Copyright (c) 1997-2000 Information-technology Promotion Agency, Japan
 * Copyright (c) 2000-2005 Shikano Lab., Nara Institute of Science and Technology
 * Copyright (c) 2005-2013 Julius project team, Nagoya Institute of Technology
 *
 * "Large Vocabulary Continuous Speech Recognition Engine Julius",
 * including Julian, is being developed at Kawahara Lab., Kyoto
 * University, Shikano Lab., Nara Institute of Science and Technology,
 * and Julius project team, Nagoya Institute of Technology (collectively
 * referred to herein as the "Licensers").  Julius was funded by the
 * Advanced Information Technology Program Project of
 * Information-technology Promotion Agency (IPA), Japan for three years
 * since 1997.
 *
 * The Licensers reserve the copyright thereto.  However, as long as you
 * accept and remain in strict compliance with the terms and conditions
 * of the license set forth herein, you are hereby granted a royalty-free
 * license to use "Large Vocabulary Continuous Speech Recognition Engine
 * Julius" including the source code thereof and the documentation
 * thereto (collectively referred to herein as the "Software").  Use by
 * you of the Software shall constitute acceptance by you of all terms
 * and conditions of the license set forth herein.
 *
 * TERMS AND CONDITIONS OF LICENSE
 *
 * 1. So long as you accept and strictly comply with the terms and
 * conditions of the license set forth herein, the Licensers will not
 * enforce the copyright or moral rights in respect of the Software, in
 * connection with the use, copying, duplication, adaptation,
 * modification, preparation of a derivative work, aggregation with
 * another program, or insertion into another program of the Software or
 * the distribution or transmission of the Software.  However, in the
 * event you or any other user of the Software revises all or any portion
 * of the Software, and such revision is distributed, then, in addition
 * to the notice required to be affixed pursuant to paragraph 2 below, a
 * notice shall be affixed indicating that the Software has been revised,
 * and indicating the date of such revision and the name of the person or
 * entity that made the revision.
 *
 * 2. In the event you provide to any third party all or any portion of
 * the Software, whether for copying, duplication, adaptation,
 * modification, preparation of a derivative work, aggregation with
 * another program, insertion into another program, or other use, you
 * shall affix the following copyright notice and all terms and
 * conditions of this license (both the Japanese original and English
 * translation) as set forth herein, without any revision or change
 * whatsoever.
 *
 * FORM OF COPYRIGHT NOTICE:
 *
 * Copyright (c) 1991-2013 Kawahara Lab., Kyoto University
 * Copyright (c) 1997-2000 Information-technology Promotion Agency, Japan
 * Copyright (c) 2000-2005 Shikano Lab., Nara Institute of Science and Technology
 * Copyright (c) 2005-2013 Julius project team, Nagoya Institute of Technology
 *
 * 3. When you publish or present any results by using the Software, you
 * must explicitly mention your use of "Large Vocabulary Continuous
 * Speech Recognition Engine Julius".
 *
 * 4. The Licensers are licensing the Software, which is the trial
 * product of research and project, on an "as is" and royalty-free basis,
 * and makes no warranty or guaranty whatsoever with respect to the
 * Software, whether express or implied, irrespective of the nation where
 * used, and whether or not arising out of statute or otherwise,
 * including but not limited to any warranty or guaranty with respect to
 * quality, performance, merchantability, fitness for a particular
 * purpose, absence of defects, or absence of infringement of copyright,
 * patent rights, trademark rights or other intellectual property rights,
 * trade secrets or proprietary rights of any third party.  You and every
 * other user of the Software hereby acknowledge that the Software is
 * licensed without any warranty or guaranty, and assume all risks
 * arising out of the absence of any warranty or guaranty.  In the event
 * that obligations imposed upon you by judgment of a court would make it
 * impossible for you to comply with the conditions of this license, you
 * may not use the Software.
 *
 * The Licensers shall not have any liability to you or to any third
 * party for damages or liabilities of any nature whatsoever arising out
 * of your use of or inability to use the Software, whether of an
 * ordinary, special, direct, indirect, consequential or incidental
 * nature (including without limitation lost profits) or otherwise, and
 * whether arising out of contract, negligence, tortuous conduct, product
 * liability or any other legal theory or reason whatsoever of any nation
 * or jurisdiction.
 *
 * 5. This license of use of the Software shall be governed by the laws
 * of Japan, and the Kyoto District Court shall have exclusive primary
 * jurisdiction with respect to all disputes arising with respect
 * thereto.
 *
 * 6. Inquiries for support or maintenance of the Software, or inquiries
 * concerning this license of use besides the conditions above, may be
 * sent to Julius project team, Nagoya Institute of Technology, or
 * Kawahara Lab., Kyoto University.
 */

(function(window, navigator, undefined) {
    var postBuffer = function() {
      var that = this;

      return function(e) {
        var buffer = e.inputBuffer.getChannelData(0);
        
        if (that.audio._transfer) {
          var out = e.outputBuffer.getChannelData(0);

          for (var i = 0; i < 4096; i++) {
            out[i] = buffer[i];
          }
        }

        // Transfer audio to the recognizer
        that.recognizer.postMessage(buffer);
      };
    };

    var bootstrap = function(pathToDfa, pathToDict, stream, options) {
      var audio = this.audio;
      var recognizer = this.recognizer;

      audio.source = stream;
      audio.source.connect(audio.processor);
      audio.processor.connect(audio.context.destination);

      // Bootstrap the recognizer
      recognizer.postMessage({
        type: 'begin',
        pathToDfa: pathToDfa,
        pathToDict: pathToDict,
        options: options
      });
    };

    var Julius = function(pathToDfa, pathToDict, stream, context, options) {
      var that = this;
      options = options || {};

      // The context's nodemap: `source` -> `processor` -> `destination`
      this.audio = {
        // `AudioContext`
        context:   context,
        // `AudioSourceNode` from captured microphone input
        source:    null,
        // `ScriptProcessorNode` for julius
        processor: context.createScriptProcessor(4096, 1, 1),
        _transfer:  options.transfer
      };

      // Do not pollute the object
      delete options.transfer;

      // _Recognition is offloaded to a separate thread to avoid slowing UI_
      this.recognizer = new Worker(options.pathToWorker || 'worker.js');

      this.recognizer.onmessage = function(e) {
        if (e.data.type === 'begin') {
          that.audio.processor.onaudioprocess = postBuffer.call(that);

        } else if (e.data.type === 'recog') {
          if (e.data.firstpass) {
            typeof that.onfirstpass === 'function' &&
              that.onfirstpass(e.data.sentence, e.data.score);
          } else
            typeof that.onrecognition === 'function' &&
              that.onrecognition(e.data.sentence);

        } else if (e.data.type === 'log') {
          typeof that.onlog === 'function' &&
            that.onlog(e.data.sentence);

        } else if (e.data.type === 'error') {
          console.error(e.data.error);
          that.terminate();

        } else {
          console.info('Unexpected data received from julius:');
          console.info(e.data);
        }
      };

      bootstrap.call(this, pathToDfa, pathToDict, stream, options);
    };

    Julius.prototype.onfirstpass = function(sentence) { /* noop */ };
    Julius.prototype.onrecognition = function(sentence, score) { /* noop */ };
    Julius.prototype.onlog = function(obj) { console.log(obj); };
    Julius.prototype.onfail = function() { /* noop */ };
    Julius.prototype.terminate = function(cb) {
      this.audio.processor.onaudioprocess = null;
      this.recognizer.terminate();
      console.error('JuliusJS was terminated.');
      typeof this.onfail === 'function' && this.onfail();
    };

    window.Julius = Julius;
}(window,window.navigator) );
