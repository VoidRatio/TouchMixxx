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

  var Deck = function(midiChannel,group)
  {
      touchMixxx.Container.call(this,group);
      this.midiChannel = midiChannel;
      this.ctrlNumbers = {
        jog: 0x00, play: 0x01, cue: 0x02, sync: 0x0A, rate: 0x0B,

        simpleKnobs: {volume: 0x04, pregain: 0x05,},
        simpleButtons: {rate_temp_down: 0x0C, rate_temp_up: 0x0D, rate_perm_down_small: 0x0E, rate_perm_up_small: 0x0F,},
        simpleToggles: {pfl: 0x03, quantize:0x28 ,keylock:0x29, slip_enabled: 0x2A,},
        eq:{parameter1: 0x06,parameter2: 0x07,parameter3: 0x08,},
        qfx:{super1:0x09},browse: 0x10, load: 0x11, VUMeterL: 0x12,VUMeterR: 0x13,
        padModeOffset:0x14/* 0x1B */, padOffset:0x1C /*0x23 */,
        fx1Enable: 0x24, fx2Enable: 0x25,
        orientation: 0x26, loopExit: 0x27,
      };

      this.addComponent('play', new components.PlayButton({
        midi: [0xB0 + midiChannel, this.ctrlNumbers.play],
        group: this.group,
      }));

      this.addComponent('cue', new components.CueButton({
        midi: [0xB0 + midiChannel, this.ctrlNumbers.cue],
        group: this.group,
      }));

      this.addComponent('sync', new components.SyncButton({
        midi: [0xB0 + midiChannel, this.ctrlNumbers.sync],
        group: this.group,
      }));

      this.addComponent('orientation', new touchMixxx.SlideSwitch({
        midi: [0xB0 + midiChannel, this.ctrlNumbers.orientation],
        group: this.group,
        key: 'orientation',
        lower:0,
        upper:2,
      }));

      this.addComponent('loopExit', new components.Button({
        midi: [0xB0 + midiChannel, this.ctrlNumbers.loopExit],
        group: this.group,
        inKey: 'reloop_toggle',
        outKey: 'loop_enabled',
        type: components.Button.prototype.types.toggle,
      }));

      this.addComponent('rate', new touchMixxx.Pot({
            midi: [0xB0 + midiChannel, this.ctrlNumbers.rate],
            key: 'rate',
            group: this.group,
            centerZero: true,
      }));

      this.addComponent('fx1Enable', new components.Button({
        midi: [0xB0 + this.midiChannel, this.ctrlNumbers.fx1Enable],
        group: '[EffectRack1_EffectUnit1]',
        type: components.Button.prototype.types.toggle,
        key: 'group_' + this.group + '_enable',
      }));

      this.addComponent('fx2Enable', new components.Button({
        midi: [0xB0 + this.midiChannel, this.ctrlNumbers.fx2Enable],
        group: '[EffectRack1_EffectUnit2]',
        type: components.Button.prototype.types.toggle,
        key: 'group_' + this.group + '_enable',
      }));


      for(knob in this.ctrlNumbers.simpleKnobs)
      {
        this.addComponent(knob, new touchMixxx.Pot({
            midi: [0xB0 + midiChannel, this.ctrlNumbers.simpleKnobs[knob]],
            key: knob,
            group: this.group,
        }));
      }

      for(button in this.ctrlNumbers.simpleButtons)
      {
        this.addComponent(button, new components.Button({
            midi: [0xB0 + midiChannel, this.ctrlNumbers.simpleButtons[button]],
            key: button,
            group: this.group,
        }));
      }

      for(button in this.ctrlNumbers.simpleToggles)
      {
        this.addComponent(button, new components.Button({
            midi: [0xB0 + midiChannel, this.ctrlNumbers.simpleToggles[button]],
            key: button,
            type: components.Button.prototype.types.toggle,
            group: this.group,
        }));
      }

      this.addComponent('eq', new touchMixxx.Container(this.group));
      var parameterNumber = 1;
      for(parameter in this.ctrlNumbers.eq)
      {
        this.components.eq.addComponent(parameter,  new touchMixxx.Pot({
             midi: [0xB0 + midiChannel, this.ctrlNumbers.eq[parameter]],
             group: '[EqualizerRack1_' + this.group + '_Effect1]',
             key: "parameter" + parameterNumber++ ,
         }));
      }

      this.addComponent('qfx', new touchMixxx.Container(this.group));
        var parameterNumber = 1;
      for(parameter in this.ctrlNumbers.qfx)
      {
        this.components.qfx.addComponent(parameter, new touchMixxx.Pot({
             midi: [0xB0 + midiChannel, this.ctrlNumbers.qfx[parameter]],
             group: '[QuickEffectRack1_' + this.group + ']',
             key: "super" + parameterNumber++,
         }));
      }

      this.addComponent('pads', new touchMixxx.PadBank({
        midiChannel:  midiChannel,
        group: this.group,
        modeOffset: this.ctrlNumbers.padModeOffset,
        padOffset: this.ctrlNumbers.padOffset,
      }));

      this.addComponent('jog', new touchMixxx.Jog({
        midi: [0xB0 + midiChannel, this.ctrlNumbers.jog],
        group: this.group,
      }));

      var thisDeck = this;

      this.addComponent('browse', {
        midi: [0xB0 + midiChannel, this.ctrlNumbers.browse],
        group: this.group,
        input: function(channel, control, value, status, group)
        {
          if(value)
          {
            thisDeck.components.jog.toggleBrowse();
            this.output();
          }
        },
        output: function()
        {
            midi.sendShortMsg(this.midi[0], this.midi[1], thisDeck.components.jog.isBrowseMode()* 127);
        },
      });


      this.addComponent('load', new components.Button({
        midi: [0xB0 + midiChannel, this.ctrlNumbers.load],
        group: this.group,
        inKey: 'LoadSelectedTrack',
        input: function(channel, control, value, status, group)
        {
          if(! thisDeck.isPlaying() && thisDeck.components.jog.isBrowseMode() )
          {
            components.Button.prototype.input.call(this,channel, control, value, status, group);
          }
        },
        shift: function()
        {
          //this feels a bit of a hack but need to switch the button's group
          //to call the control. probably want a more custom button
          this.inKey = 'GoToItem';
          this.group = '[Library]';
        },
        unshift: function()
        {
          this.inKey = 'LoadSelectedTrack';
          this.group = thisDeck.group;
        }
      }));

      this.addComponent("vumeter" , new touchMixxx.VUMeter({
        midiL:[0xB0 + midiChannel, this.ctrlNumbers.VUMeterL],
        group: this.group,
      }));

  };


  _.assign(Deck,touchMixxx.Container);

  Deck.prototype.input = function(channel, control, value, status, group)
  {
    print("midi channel= " + channel + " control= " + control + " value= " + value + " st= " + status + " group= " + group);
    var ctrl = this.resolveControl( status, control);
    if (ctrl !== null)
    {
      ctrl.input(channel, control, value, status, group);
    }else{
      print("Error: not control found for Channel "+ channel +", Status " + status + ", Control " + control);
    }
  }

  Deck.prototype.isPlaying = function()
  {
    return engine.getValue(this.group, 'play');
  }

  Deck.prototype.deckNumber = function()
  {
    return script.deckFromGroup(this.group);
  }

  touchMixxx.merge("Deck",Deck);
}(this));
