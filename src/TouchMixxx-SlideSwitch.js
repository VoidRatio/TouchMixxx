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


/*
SlideSwitch uses TouchOSc's fader but gives it defined steps by rounding the
incomming value to intervals and feeding that back to TouchOSC
*/

;(function (global){
  var SlideSwitch = function(options)
  {
    this.lower = options.lower || 0;
    this.upper = options.upper || 1;
    touchMixxx.Pot.call(this,options);
  }

  _.merge(SlideSwitch.prototype,touchMixxx.Pot.prototype);

  SlideSwitch.prototype.input = function(channel, control, value, status, group)
  {
    var scaledValue = value / this.max * this.upper;

    this.inSetParameter(scaledValue);
  }

  SlideSwitch.prototype.output = function(value, group, control)
  {
      // we aren't using the updateLock which makes the control a little flickery
      //but also makes snap to the correct value
      //for the crossfader settings this is kinda ok but may need to improve if used elsewhere
        var inc = 1 / this.upper;
        value = value / this.upper;
        value = value - value % inc;
        print(value)
        this.send(value * this.max);
  }

touchMixxx.merge("SlideSwitch",SlideSwitch);
}(this));
