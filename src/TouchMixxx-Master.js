/**
*    The TouchMixxx library allows the TouchMixxx controller layout to be used with Mixxx
*    Details and the latest version are available at www.voidratio.co.uk/touchmixxx
*
*    Copyright (C) 2020  VoidRatio <info@voidratio.co.uk>
*
*    This program is free software: you can redistribute it and/or modify
*    it under the terms of the GNU General Public License as published by
*    the Free Software Foundation, either version 3 of the License, or
*    (at your option) any later version.
*
*    This program is distributed in the hope that it will be useful,
*    but WITHOUT ANY WARRANTY; without even the implied warranty of
*    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*    GNU General Public License for more details.
*
*    You should have received a copy of the GNU General Public License
*    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*
*   This library depends on Components JS library for Mixxx, which is Copyright
*   Be <be.0@gmx.com> and licensed under the GNU General Public License.
*   Documentation is on the Mixxx wiki at http://mixxx.org/wiki/doku.php/components_js
*
*   This library depends on Lodash, which is copyright JS Foundation
*   and other contributors and licensed under the MIT license. Refer to
*   the lodash.mixxx.js file for details.
*
**/

;(function (global){
  var Master = function(midiChannel, group, numberOfSamplers)
  {
    this.midiChannel = midiChannel || 0x09;
    this.group = group || '[Master]';
    this.numberOfSamplers = numberOfSamplers || 64;

    this.ctrls = {
      knobs:{gain: 0x00, balance: 0x01, headGain: 0x02,},
      headMix: 0x03, crossfader: 0x04,fxMix1: 0x06, fxMix2: 0x07,
      shift: 0x08,
      sampleVolume: 0x05,
      loadPage: 0x0A,
      VUMeterL: 0x12, VUMeterR: 0x13,
      fx1Enable: 0x24, fx2Enable: 0x25,
      samplerFx1Enable: 0x26,samplerFx2Enable: 0x27,
    }

    for(knob in this.ctrls.knobs)
    {
      this[knob] = new touchMixxx.Pot({
        midi: [0xB0 + this.midiChannel, this.ctrls.knobs[knob]],
        key: knob,
        group: this.group,
      });
    }

    this.headMix = new touchMixxx.Pot({
      midi: [0xB0 + this.midiChannel, this.ctrls.headMix],
      key: 'headMix',
      group: this.group,
      centerZero: true,
    });

    this.crossfader = new touchMixxx.Pot({
      midi: [0xB0 + this.midiChannel, this.ctrls.crossfader],
      key: 'crossfader',
      group: this.group,
      centerZero: true,
    });

    this.fx1Enable = new components.Button({
      midi: [0xB0 + this.midiChannel, this.ctrls.fx1Enable],
      group: '[EffectRack1_EffectUnit1]',
      type: components.Button.prototype.types.toggle,
      key: 'group_' + this.group + '_enable',
    });

    this.fxMix1 = new touchMixxx.Pot({
      midi: [0xB0 + this.midiChannel, this.ctrls.fxMix1],
      key: 'mix',
      group: '[EffectRack1_EffectUnit1]',
    });

    this.fx2Enable = new components.Button({
      midi: [0xB0 + this.midiChannel, this.ctrls.fx2Enable],
      group: '[EffectRack1_EffectUnit2]',
      type: components.Button.prototype.types.toggle,
      key: 'group_' + this.group + '_enable',
    });

    this.fxMix2 = new touchMixxx.Pot({
      midi: [0xB0 + this.midiChannel, this.ctrls.fxMix2],
      key: 'mix',
      group: '[EffectRack1_EffectUnit2]',
    });

  /* adjusts the volume for all samplers*/
    this.sampleVolume = new touchMixxx.Pot({
      midi: [0xB0 + this.midiChannel, this.ctrls.sampleVolume],
      key: 'volume',
    group: '[Sampler1]', //hack to force an outgoing connection...
      numberOfSamplers: this.numberOfSamplers,
      input: function(channel, control, value, status, group)
      {
        for(var s = 1 ; s <= this.numberOfSamplers ; s++)
        {
          engine.setParameter("[Sampler" + s + "]", "volume", value / this.max);
        }
      }
    });

  /* toggle FX 1 for all samplers */
    this.samplerFx1Enable = new components.Button({
      midi: [0xB0 + this.midiChannel, this.ctrls.samplerFx1Enable],
      group: '[EffectRack1_EffectUnit1]',
      type: components.Button.prototype.types.toggle,
      key: 'group_[Sampler1]_enable',
      numberOfSamplers: this.numberOfSamplers,
      input: function(channel, control, value, status, group)
      {
        if(value)
        {
        for(var s = 1 ; s <= this.numberOfSamplers ; s++)
        {
          var key = "group_[Sampler" + s + "]_enable";
          engine.setParameter(this.group, key, ! engine.getParameter(this.group, key));
        }
      }
      }
    });

  /* toggle FX 1 for all samplers */
    this.samplerFx2Enable = new components.Button({
      midi: [0xB0 + this.midiChannel, this.ctrls.samplerFx2Enable],
      group: '[EffectRack1_EffectUnit2]',
      type: components.Button.prototype.types.toggle,
      key: 'group_[Sampler1]_enable',
      numberOfSamplers: this.numberOfSamplers,
      input: function(channel, control, value, status, group)
      {
        if (value)
        {
        for(var s = 1 ; s <= this.numberOfSamplers ; s++)
        {
          var key = "group_[Sampler" + s + "]_enable";
          engine.setParameter(this.group, key, ! engine.getParameter(this.group, key));
        }
      }
      }
    });

    this.vumeter = new touchMixxx.VUMeter({
      midiL:[0xB0 + this.midiChannel, this.ctrls.VUMeterL],
      midiR:[0xB0 + this.midiChannel, this.ctrls.VUMeterR],
      group: this.group,
    });
  };

  touchMixxx.merge("Master",Master);
}(this));
