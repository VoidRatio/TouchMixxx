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

  var Pot = function(options)
  {

    this.centerZero = options.centerZero;
    this.updateLock = false;
    this.timer = 0;
    this.updateLockDelay = 500;
    //remember this  needs to be called last as it sets up connections,
    //which is relient on the pot being intiialised -- eg timer set to zero
    components.Pot.call(this,options);
  };

  //FIX ME -- THIS SHOULD BE ASSIGN BUT FAILS
  _.merge(Pot.prototype,components.Pot.prototype);

  Pot.prototype.input = function(channel, control, value, status, group)
  {
    this.updateLock = true;
    components.Pot.prototype.input.call(this,channel, control, value, status, group);

    if (this.timer !== 0)
    {
      engine.stopTimer(this.timer);
    }

    this.timer = engine.beginTimer(this.updateLockDelay, function() {
      this.updateLock = false;
      this.timer = 0;
    },true);
  };

  Pot.prototype.outValueScale = function (value)
  {
      //rate values range -1 to 1 so we need to scale them to 0 to 1
      if ( this.centerZero )
      {
        value = (value + 1) / 2;
        return value * this.max;
      }else{
        return components.Pot.prototype.outValueScale.call(this,value);
      }
  };

  Pot.prototype.output = function(value, group, control)
  {
    if (! this.updateLock ) {
      /* based on midi-components-0.0.js this should be sending out outValueScale() as per the other components
        however the EQ knobs appear to set value between 0 - 4 when triggered ( we trigger to update the page on TouchOSC )
        so we are getting the paremeer direct and scaling here
      */
        this.send(this.inGetParameter() * this.max);
      }else{
         //print("updatelocked");
      }
  };

  Pot.prototype.connect = function ()
  {
      components.Pot.prototype.connect.call(this);
     if (undefined !== this.group &&
          undefined !== this.outKey &&
          undefined !== this.output &&
          typeof this.output === 'function') {
          this.connections[0] = engine.makeConnection(this.group, this.outKey, this.output);
      }
  };

  /*
  component.Pot overwrites the trigger method of components.Component
  ( because why would you send a midi message to a physical pot ?)
  so we reinstate it for our virtual pots
  */

  Pot.prototype.trigger = function()
  {
   if ( this.timer !== 0)
   {
    engine.stopTimer(this.timer);
    this.updateLock = false;
    this.timer = 0;
   }

    if (this.connections[0] !== undefined) {
        this.connections.forEach(function (conn) {
            conn.trigger();
        });
    }
  };

  touchMixxx.merge("Pot", Pot);

}(this));
