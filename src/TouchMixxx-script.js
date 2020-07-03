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

var TouchMixxx = {
  numberOfDecks: 4,
  master:{},
  decks:[],
  addDeck: function(midiChannel)
  {
    this.decks.push(new touchMixxx.Deck(midiChannel,"[Channel" + (midiChannel + 1)  + "]") );
    //print("deck " + (midiChannel + 1) );
  },
};

// Mixxx calls this function on startup or when TouchMixx is enabled in Preferences
TouchMixxx.init = function() {

    //Create our master section
     this.master = new touchMixxx.Master();
     //print("master");
     //And our decks
     for(var deckNumber = 0; deckNumber  < this.numberOfDecks ; deckNumber ++)
     {
      this.addDeck(deckNumber);
     }
    print("TouchMixxx Init!");
};

/*
  This shift buttons act global and are applied to all decks at once
  This is to allow use of Shift on the mixer page where we may not know
  which channel the control to be 'shifted' belongs to.
  As of V1 this is pratically used but could be useful for kill switches etc
*/
TouchMixxx.shiftButton = function(channel, control, value, status, group)
{
  if(value)
  {
    this.decks.forEach(function(deck){ deck.shift() });
  }else{
    this.decks.forEach(function(deck){ deck.unshift() } );
  }
};

TouchMixxx.loadPage = function(channel, control, value, status, group)
{
  this.decks.forEach(
    function(deck){
      deck.forEachComponent(function(component){if(typeof component.trigger === "function") component.trigger()},true);
    }
  );
}

TouchMixxx.shutdown = function() {
    // send whatever MIDI messages you need to turn off the lights of your controller
};
