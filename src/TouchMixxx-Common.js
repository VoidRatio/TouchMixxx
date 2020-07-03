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

/**
   TouchMixxx-Common.js

   This file should be loaded first in TouchMixxx.midi.xml as it adds
   touchMixxx ( deliberatly lowercase ) to the global environment.
   All our other modules add constructors to touchMixxx allow our code to be
   separated into muitiple files
*/

// add touchMixxx to the global scope
;(function (global){
  global.touchMixxx = {
    merge: function(key,obj)
    {
      this[key] = obj;
    },
  };

/**
    TMContainer

    Simular to the Container provided by Mixxx's midi components library
    TMContainer is mostly a way of grouping and iterating over mutliple
    components.

    It also allows each of its child components to be accessed by
    midi number and channel ( resolveControl() )which reduces the
    complexity of maintaining the midi.xml file when refactoring.
*/

  var TMContainer = function(group)
  {
    this.group = group;
    this.isShifted = false;
    this.components = {};
  }

  TMContainer.prototype.addComponent = function(key,component)
  {
    this.components[key] = component;
    return this.components[key];
  }

  TMContainer.prototype.clearComponents = function()
  {
    this.components = {};
  };

  TMContainer.prototype.resolveControl = function(status, control)
  {
    var ctrl = null;
    this.forEachComponent(function(component){
          if(Array.isArray(component.midi) && component.midi[0] === status && component.midi[1] === control)
          {
            ctrl = component;
          }
    });
    return ctrl;
  }

  TMContainer.prototype.shift = function()
  {
    this.isShifted = true;
    this.forEachComponent(function(component)
    {
      if(typeof component.shift === 'function')
      {
        component.shift();
      }
    });
  }

  TMContainer.prototype.unshift = function()
  {
    this.isShifted = false;
    this.forEachComponent(function(component)
    {
      if(typeof component.unshift === 'function')
      {
        component.unshift();
      }
    });
  }

  TMContainer.prototype.forEachComponent = function (operation, recursive)
  {
      if (typeof operation !== 'function') {
          print('ERROR: ComponentContainer.forEachComponent requires a function argument');
          return;
      }
      if (recursive === undefined) { recursive = true; }

      var that = this;
      var applyOperationTo = function (obj) {
        if (recursive && obj instanceof TMContainer) {
            obj.forEachComponent(operation);
        //AR :: Don't think we need arrays
        // }else if (Array.isArray(obj)) {
        //     obj.forEach(function (element) {
        //         applyOperationTo(element);
        //     });
        }else{
          operation.call(that, obj);
        }
      };

      for (var memberName in this.components) {
          applyOperationTo(this.components[memberName]);
      }
  };

  touchMixxx.merge("Container",TMContainer);

}(this));


// Ployfill for Function.bind() which does not appear to be supported
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Function/bind

if (!Function.prototype.bind) (function(){
  var slice = Array.prototype.slice;
  Function.prototype.bind = function() {
    var thatFunc = this, thatArg = arguments[0];
    var args = slice.call(arguments, 1);
    if (typeof thatFunc !== 'function') {
      // closest thing possible to the ECMAScript 5
      // internal IsCallable function
      throw new TypeError('Function.prototype.bind - ' +
             'what is trying to be bound is not callable');
    }
    return function(){
      var funcArgs = args.concat(slice.call(arguments))
      return thatFunc.apply(thatArg, funcArgs);
    };
  };
})();
