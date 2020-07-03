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

  var PadBank = function(options)
  {
    touchMixxx.Container.call(this,options);
    _.assign(this, options);

    this.numberOfPads = 8;
    this.padModes = {
      mode1: this.modeOffset,
      mode2: this.modeOffset + 1,
      mode3: this.modeOffset + 2,
      mode4: this.modeOffset + 3
    };
    this.modeButtons = this.addComponent('modeButtons', new touchMixxx.Container(this.group));
    this.pads = this.addComponent('pads', new touchMixxx.Container(this.group));
    this.connectModeButtons();
  }

  _.assign(PadBank, touchMixxx.Container);

  PadBank.prototype.addPad = function(padNumber,options)
  {
    options.midi = options.midi || [0xB0 + this.midiChannel, this.padOffset + padNumber];
    options.group = options.group || this.group;
    return this.pads.addComponent('pad' + padNumber, new components.Button(options));
  }

  PadBank.prototype.switchMode = function(activeModeButton)
  {

    this.modeButtons.forEachComponent(function(button){
      if(button.mode != activeModeButton.mode)
      {
        button.off();
      }else{
        button.on(); //switching here means we act as a radio group an one button is always active
      }
    });

    this.pads.forEachComponent(function(pad){
      pad.disconnect();
      pad = null;
    });
    // Our pads can have a second layer activated via shift plus the pad mode button
    //decided not to go with this until we have more useful functions to apply to pads
    // if(activeModeButton.isSecondFunction)
    // {
    //   switch(activeModeButton.mode)
    //   {
    //     case "mode1":
    //       //this.connectHotCues("gotoandplay");
    //       this.connectBeatJumpPads(0.5);
    //     break;
    //     /*beat loop small*/
    //     case "mode2":
    //       this.connectBeatLoopPads(0.03125)
    //     break;
    //     case "mode3":
    //       /* pitch */
    //       break;
    //       /*sampes*/
    //     case "mode4":
    //     break;
    //   }
    // }else{
      switch(activeModeButton.mode)
      {
        /* HotCue */
        case "mode1":
          this.connectHotCues();
        break;
        /* Beat Loop Large */
        case "mode2":
          this.connectBeatJumpPads(0.5);
        break;
        case "mode3":
          /* loop */
          this.connectLoopPads();
          break;
          /*sampes*/
        case "mode4":
        this.connectSamplers()
        break;
      }
    // }
  }


  PadBank.prototype.connectLoopPads = function()
  {
    this.addPad(0, {key: 'loop_in',}).trigger();
    this.addPad(1, {key: 'loop_move_1_forward',}).trigger();
    this.addPad(2, { key: 'loop_double',}).trigger();
    this.addPad(3, {inKey: 'reloop_toggle', outKey: 'loop_enabled',}).trigger();
    this.addPad(4, {key: 'loop_out',}).trigger();
    this.addPad(5, { key: 'loop_move_1_backward',}).trigger();
    this.addPad(6, { key: 'loop_halve',}).trigger();
    //pad seven is unused but we need a null button to over write the pad that was created for the previous mode
    this.addPad(7, { disconnect: function(){},} ); //disconnect is required as we are expecting a button
  }


  PadBank.prototype.connectHotCues = function()
  {
    for (var padNumber = 0; padNumber < this.numberOfPads; padNumber++) {
      var pad = this.addPad(padNumber, {
          hotCue: padNumber + 1,
          outKey: 'hotcue_' + (padNumber + 1) + '_enabled', // need this to force conenction
          unshift: function()
          {
            this.inKey = 'hotcue_' + this.hotCue+ '_activate';
          },
          shift: function()
          {
            this.inKey = 'hotcue_' + this.hotCue  + '_clear';
          }
      }).trigger();
    }
  }


  PadBank.prototype.connectBeatLoopPads = function(smallLoopSize)
  {
    var loopSize = smallLoopSize || 0.5;
    for (var padNumber = 0; padNumber < this.numberOfPads; padNumber++) {
      var pad =  this.addPad(padNumber, {
           inKey: 'beatloop_' + loopSize + '_toggle',
           outKey: 'beatloop_' + loopSize + '_enabled',
        }).trigger();
        loopSize *= 2;
      }
  }


  PadBank.prototype.connectBeatJumpPads = function(smallJumpSize)
  {
    var jumpSize = smallJumpSize || 0.5;
    for (var padNumber = 0; padNumber < this.numberOfPads; padNumber++) {
      var pad = this.addPad(padNumber,  {
            jumpSize: jumpSize,
            shift: function()
            {
              this.inKey = 'beatjump_' + this.jumpSize + '_backward';
              this.outKey = 'beatjump_'+ this.jumpSize + '_backward';
            },
            unshift: function()
            {
              this.inKey = 'beatjump_' + this.jumpSize + '_forward';
              this.outKey = 'beatjump_'+ this.jumpSize + '_forward';
            },
            connect: function()
            {
              this.connections[0] = engine.makeConnection(this.group, 'beatjump_'+ this.jumpSize + '_forward', this.output);
              this.connections[1] = engine.makeConnection(this.group, 'beatjump_'+ this.jumpSize + '_backward', this.output);
            }
        }).trigger();
        jumpSize *= 2;
      }
  }


  PadBank.prototype.connectSamplers = function()
  {
    var samplerOffset = (script.deckFromGroup(this.group) - 1) * 8;
    for (var padNumber = 0; padNumber < this.numberOfPads; padNumber++) {
      var pad = this.pads.addComponent('pad' + padNumber, new components.SamplerButton({
          midi: [0xB0 + this.midiChannel, this.padOffset + padNumber],
          number: padNumber + samplerOffset + 1,
      }));
      pad.trigger();

    }
  }


  PadBank.prototype.connectModeButtons = function()
  {
     var callback = this.switchMode.bind(this);
    for(var mode in this.padModes)
    {
        this.modeButtons.addComponent(mode, {
          midi: [0xB0 + this.midiChannel, this.padModes[mode]],
          mode: mode,
          active: false,
          isShifted: false,
          isSecondFunction: false,
          callback: callback,
          input: function(channel, control, value, status, group)
          {
            /*
            the TouchOSC midi buttons send a command on press and release we only respond
            to a press which allows us to toggle
            */
            if(value)
            {
              /*
              the idea here is that second function persists when we switch mode
              we use shift to enable second function but a button press
              ( when second fucntion is active ) clears the second functions
              this means the engagment of second fucntion is visable even when we reassign the pads / switch modes
              */
              this.isSecondFunction = (this.isShifted || (this.isSecondFunction && ! this.active)) ? true : false;
              //we do out swtiching in the callback to allow the buttons to act a a radio group
              this.callback(this);
            }
          },
          output: function()
          {
              midi.sendShortMsg(this.midi[0], this.midi[1], this.active * 127);
              //for an led to indicate second function
              midi.sendShortMsg(this.midi[0], this.midi[1] + 4, this.isSecondFunction * 127);
          },
          toggle: function()
          {
            /*we only toggle secondFunction if shift is held this allows it to
            persist even when the button is not active*/
            if(this.isShifted) this.isSecondFunction = ! this.isSecondFunction;
            this.active = ! this.active || (this.active && this.isShifted);
            this.output();
          },
          on: function()
          {
            this.active = true;
            this.output();
          },
          off: function()
          {
            this.active = false;
            this.output();
          },
          shift: function()
          {
            this.isShifted = true;
          },
          unshift: function()
          {
            this.isShifted = false;
          },
      });
    }
    //activate mode one on load
    this.modeButtons.components.mode1.input(0, 0, 127, 0, 0);
  };

  touchMixxx.merge("PadBank",PadBank);
}(this));
