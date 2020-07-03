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
  Jog = function(options)
  {
    this.mode = "track";
    this.jogTimer = 0;
    this.rateTimeout = 200;
    this.browseTimeout =100;
    this.searchSpeedSlow = 1;
    this.searchSpeedFast = 3;
    this.scratchRate = 1;
    this.alpha = 1.0/8;
    this.beta = this.alpha/32;

    components.Encoder.call(this,options);
  };

  _.assign(Jog,components.Encoder);

  Jog.prototype.setMode = function(mode)
  {
    this.mode = mode;
  }

  Jog.prototype.isBrowseMode = function()
  {
    return this.mode == "browse";
  }

  Jog.prototype.toggleBrowse = function()
  {
    this.mode = (this.mode == "track") ? "browse" : "track";
  }


  Jog.prototype.input =  function(channel, control, value, status, group) {
    switch(this.mode)
    {
      case "browse":
        this.browseMode(value);
        break;
      case "track":
      default:
      this.trackMode(value);
    }
  };

  Jog.prototype.browseMode = function(value)
  {
    if ( this.jogTimer !== 0 ) return; // we are timed out return

      this.jogTimer = engine.beginTimer(this.browseTimeout, function(){
        this.jogTimer = 0;
      }, true); //one shot

    if (value == 0) {
        if (this.isShifted)
        {
          //engine.setValue('[Library]', 'MoveFocusBackward', true);
          //MoveFocusBackward ( SHIFT+TAB ) iterates through the loop length
          //and beat jump length spinners as well as the library panes.
          //While this could be useful, it's kinda confusing and , more often than not,
          //results in setting odd loop lengths by mistake.
          //SO we'll just go forward, ever forward....
            engine.setValue('[Library]', 'MoveFocusForward', true);
        }else{
          engine.setValue('[Library]', 'MoveUp', true);
        }
    } else {
      if (this.isShifted)
      {
        engine.setValue('[Library]', 'MoveFocusForward', true);
      }else{
        engine.setValue('[Library]', 'MoveDown', true);
      }
    }
  }

  Jog.prototype.trackMode = function(value)
  {
    var currently_playing = engine.getValue(this.group, 'play');
    var deck = this.deckNumber();

    if (currently_playing) {
      if (this.isShifted)
      {
        var scratchValue = (value) ? this.scratchRate : -this.scratchRate;
        //enable scratch here playback so doesn't stop when shift is hit
        engine.scratchEnable(deck, 128, 33+1/3, this.alpha, this.beta);
        engine.scratchTick(deck, scratchValue);
      } else {
        if ( this.jogTimer !== 0 ) return; // we are timed out return

          var action = (value) ? 'rate_temp_up' : 'rate_temp_down';
          this.jogTimer = engine.beginTimer(this.rateTimeout, function(){
            this.jogTimer = 0;
            engine.setValue(this.group,'rate_temp_down',false);
            engine.setValue(this.group,'rate_temp_up',false);
          }, true); //one shot

          engine.setValue(this.group, action , true);
      }
    } else {
      /*
      jog is depreciated here
      https://www.mixxx.org/wiki/doku.php/mixxxcontrols
      but used here
      https://www.mixxx.org/wiki/doku.php/midi_scripting#scratching_and_jog_wheels
      this my need revisting
      */
        var speed = (this.isShifted) ? this.searchSpeedFast : this.searchSpeedSlow;
        if (value == 0) {
            speed *= -1;
        }
        engine.setValue(this.group, 'jog', speed);
    }
  }

  Jog.prototype.deckNumber = function()
  {
    return script.deckFromGroup(this.group);
  }

  Jog.prototype.shift = function()
  {
    this.isShifted= true;
  }

  Jog.prototype.unshift = function()
  {
    this.isShifted = false;
    engine.scratchDisable(this.deckNumber());
  }

  touchMixxx.merge("Jog",Jog);
}(this));
