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
  var VUMeter = function(options)
  {
    if(options.midiL === undefined)
    {
      print("Error: VUMeter midi undefined");
      return;
    }
    if(options.group === undefined)
    {
      print("Error: VUMeter group undefined");
      return;
    }
    _.assign(this, options);
    this.connections = [];

    if(this.midiR === undefined)
    {
      this.connections[0] = engine.makeConnection(this.group, 'VuMeter', function(value){
        midi.sendShortMsg(this.midiL[0], this.midiL[1], value * 128);
      });
    }else{
      this.connections[0] = engine.makeConnection(this.group, 'VuMeterL', function(value){
        midi.sendShortMsg(this.midiL[0], this.midiL[1], value * 128);
      });
      this.connections[1] = engine.makeConnection(this.group, 'VuMeterR', function(value){
        midi.sendShortMsg(this.midiR[0], this.midiR[1], value * 128);
      });
    }
  }
touchMixxx.merge("VUMeter",VUMeter);
}(this));
