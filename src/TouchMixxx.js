var TouchMixxx = {
  numberOfDecks: 4,
  master: {},
  decks: [],
  addDeck: function (midiChannel) {
    this.decks.push(new TouchMixxxDeck(midiChannel, "[Channel" + (midiChannel + 1) + "]"));
  },
};

// Mixxx calls this function on startup or when TouchMixx is enabled in Preferences
TouchMixxx.init = function () {

  //Create our master section
  this.master = new TouchMixxxMaster();
  //And our decks
  for (var deckNumber = 0; deckNumber < this.numberOfDecks; deckNumber++) {
    this.addDeck(deckNumber);
  }
  console.log("TouchMixxx Init!");
};

/*
  This shift buttons act globally and are applied to all decks at once
  This is to allow use of Shift on the mixer page where we may not know
  which channel the control to be 'shifted' belongs to.
  As of V1 this is isn't used used but could be useful for kill switches etc
*/
TouchMixxx.shiftButton = function (channel, control, value, status, group) {
  if (value) {
    this.decks.forEach(function (deck) {
      deck.shift()
    });
  } else {
    this.decks.forEach(function (deck) {
      deck.unshift()
    });
  }
};

// When we switch pages in TouchOSC update the controlls
TouchMixxx.loadPage = function (channel, control, value, status, group) {
  this.decks.forEach(
    function (deck) {
      deck.forEachComponent(
        function (component) {
          if (typeof component.trigger === "function")
            component.trigger()
        }, true);
    }
  );
}

TouchMixxx.shutdown = function () {
  // send whatever MIDI messages you need to turn off the lights of your controller
};


// Pollyfill for Function.bind() which does not appear to be supported
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Function/bind

if (!Function.prototype.bind)(function () {
  var slice = Array.prototype.slice;
  Function.prototype.bind = function () {
    var thatFunc = this,
      thatArg = arguments[0];
    var args = slice.call(arguments, 1);
    if (typeof thatFunc !== 'function') {
      // closest thing possible to the ECMAScript 5
      // internal IsCallable function
      throw new TypeError('Function.prototype.bind - ' +
        'what is trying to be bound is not callable');
    }
    return function () {
      var funcArgs = args.concat(slice.call(arguments))
      return thatFunc.apply(thatArg, funcArgs);
    };
  };
})();



/**
 * TouchMixxxContainer
 * 
 * This lets us nest controls an simplifies the midi mapping
 */

class TouchMixxxContainer {
  constructor(group) {
    this.group = group;
    this.isShifted = false;
    this.components = {};
  }

  addComponent(key, component) {
    this.components[key] = component;
    return this.components[key];
  }

  clearComponents() {
    this.components = {};
  }

  forEachComponent(operation, recursive) {
    if (typeof operation !== 'function') {
      print('ERROR: ComponentContainer.forEachComponent requires a function argument');
      return;
    }
    if (recursive === undefined) {
      recursive = true;
    }

    var that = this;
    var applyOperationTo = function (obj) {
      if (recursive && obj instanceof TouchMixxxContainer) {
        obj.forEachComponent(operation);
      } else {
        operation.call(that, obj);
      }
    };

    for (var memberName in this.components) {
      applyOperationTo(this.components[memberName]);
    }
  }

  resolveControl(status, control) {
    var ctrl = null;
    this.forEachComponent(function (component) {
      if (Array.isArray(component.midi) && component.midi[0] === status && component.midi[1] === control) {
        ctrl = component;
      }
    });
    return ctrl;
  }

  shift() {
    this.isShifted = true;
    this.forEachComponent(function (component) {
      if (typeof component.shift === 'function') {
        component.shift();
      }
    });
  }

  unshift() {
    this.isShifted = false;
    this.forEachComponent(function (component) {
      if (typeof component.unshift === 'function') {
        component.unshift();
      }
    });
  }

}

/**
 * TouchMixxxPot 
 * 
 * Unlike physical pots we what to update the TochOSC skin when the konbs in Mixxx are twiddled 
 */

class TouchMixxxPot extends components.Pot {
  constructor(options) {
    super(options)
    this.updateLock = false;
    this.timer = undefined;
    this.updateLockDelay = 500;
    this.hiRes = options.hiRes || false
    this.centerZero = options.centerZero || false;
  }

  outValueScale(value) {
    //the eq controls ( and others ? ) seem to have a non-linear 0-4 range rather than 0-1
    //and we need 0-1 for TouchOSC.
    if (this.hiRes) {
      return script.absoluteNonLinInverse(value, 0, 1, 4, 0, 127)
    }

    // center zero control from Mixxx give us -1 / +1 range but we need 0-1
    if (this.centerZero) {
      return script.absoluteLinInverse(value, -1, 1, 0, 127)
    }

    return value * this.max
  };

  connect() {
    if (undefined !== this.group &&
      undefined !== this.outKey &&
      undefined !== this.output &&
      typeof this.output === 'function') {
      this.connections[0] = engine.makeConnection(this.group, this.outKey, this.output.bind(this));
    }
  };
}

/**
 * ToucuhMixxxJog
 */
class ToucuhMixxxJog extends components.Encoder {
  constructor(options) {
    super(options);
    this.mode = "track";
    this.jogTimer = 0;
    this.rateTimeout = 200;
    this.browseTimeout = 100;
    this.searchSpeedSlow = 1;
    this.searchSpeedFast = 3;
    this.scratchRate = 1;
    this.alpha = 1.0 / 8;
    this.beta = this.alpha / 32;
  }

  setMode(mode) {
    this.mode = mode;
  }

  isBrowseMode() {
    return this.mode == "browse";
  }

  toggleBrowse() {
    this.mode = (this.mode == "track") ? "browse" : "track";
  }


  input(channel, control, value, status, group) {
    switch (this.mode) {
      case "browse":
        this.browseMode(value);
        break;
      case "track":
      default:
        this.trackMode(value);
    }
  };

  browseMode(value) {
    if (this.jogTimer) return; // we are timed out return

    this.jogTimer = engine.beginTimer(this.browseTimeout, () => {
      this.jogTimer = undefined;
    }, true); //one shot

    if (value == 0) {
      if (this.isShifted) {
        //engine.setValue('[Library]', 'MoveFocusBackward', true);
        //MoveFocusBackward ( SHIFT+TAB ) iterates through the loop length
        //and beat jump length spinners as well as the library panes.
        //While this could be useful, it's kinda confusing and , more often than not,
        //results in setting odd loop lengths by mistake.
        //so we'll just go forward, ever forward....
        engine.setValue('[Library]', 'MoveFocusForward', true);
      } else {
        engine.setValue('[Library]', 'MoveUp', true);
      }
    } else {
      if (this.isShifted) {
        engine.setValue('[Library]', 'MoveFocusForward', true);
      } else {
        engine.setValue('[Library]', 'MoveDown', true);
      }
    }
  }

  trackMode(value) {
    var currently_playing = engine.getValue(this.group, 'play');
    var deck = this.deckNumber();

    if (currently_playing) {
      if (this.isShifted) {
        var scratchValue = (value) ? this.scratchRate : -this.scratchRate;
        //enable scratch here so playback doesn't stop when shift is hit
        engine.scratchEnable(deck, 128, 33 + 1 / 3, this.alpha, this.beta);
        engine.scratchTick(deck, scratchValue);
      } else {
        if (this.jogTimer !== 0) return; // we are timed out return

        var action = (value) ? 'rate_temp_up' : 'rate_temp_down';
        this.jogTimer = engine.beginTimer(this.rateTimeout, function () {
          this.jogTimer = 0;
          engine.setValue(this.group, 'rate_temp_down', false);
          engine.setValue(this.group, 'rate_temp_up', false);
        }, true); //one shot

        engine.setValue(this.group, action, true);
      }
    } else {
      /*
      jog is depreciated here
      https://www.mixxx.org/wiki/doku.php/mixxxcontrols
      but used here
      https://www.mixxx.org/wiki/doku.php/midi_scripting#scratching_and_jog_wheels
      this may need revisting
      */
      var speed = (this.isShifted) ? this.searchSpeedFast : this.searchSpeedSlow;
      if (value == 0) {
        speed *= -1;
      }
      engine.setValue(this.group, 'jog', speed);
    }
  }

  deckNumber() {
    return script.deckFromGroup(this.group);
  }

  shift() {
    this.isShifted = true;
  }

  unshift() {
    this.isShifted = false;
    engine.scratchDisable(this.deckNumber());
  }
}


/*
    TouchMixxxSlideSwitch uses TouchOSC's fader but gives it defined steps by rounding the
    incomming value to intervals and feeding that back to TouchOSC
*/

class TouchMixxxSlideSwitch extends TouchMixxxPot {
  constructor(options) {
    super(options)
    this.lower = options.lower || 0;
    this.upper = options.upper || 1;

  }

  input(channel, control, value, status, group) {
    var scaledValue = value / this.max * this.upper;

    this.inSetParameter(scaledValue);
  }

  output(value, group, control) {
    // we aren't using the updateLock which makes the control a little flickery
    //but also makes snap to the correct value
    //for the crossfader settings this is kinda ok but may need to improve if used elsewhere
    var inc = 1 / this.upper;
    value = value / this.upper;
    value = value - value % inc;
    this.send(value * this.max);
  }
}

/*
  TouchMixxxVUMeter
*/

class TouchMixxxVUMeter {
  constructor(options) {
    if (options.midiL === undefined) {
      print("Error: VUMeter midi undefined");
      return;
    }
    if (options.group === undefined) {
      print("Error: VUMeter group undefined");
      return;
    }

    this.connections = [];

    if (options.midiR === undefined) {
      this.connections[0] = engine.makeConnection(options.group, 'VuMeter', function (value) {
        midi.sendShortMsg(options.midiL[0], options.midiL[1], value * 128);
      });
    } else {
      this.connections[0] = engine.makeConnection(options.group, 'VuMeterL', function (value) {
        midi.sendShortMsg(options.midiL[0], options.midiL[1], value * 128);
      });
      this.connections[1] = engine.makeConnection(options.group, 'VuMeterR', function (value) {
        midi.sendShortMsg(options.midiR[0], options.midiR[1], value * 128);
      });
    }
  }
}

/*
 TouchMixxxPadBank
*/

class TouchMixxxPadBank extends TouchMixxxContainer {
  constructor(options) {
    super(options)
    this.midiChannel = options.midiChannel
    this.group = options.group
    this.modeOffset = options.modeOffset
    this.padOffset = options.padOffset

    this.numberOfPads = 8;
    this.padModes = {
      mode1: this.modeOffset,
      mode2: this.modeOffset + 1,
      mode3: this.modeOffset + 2,
      mode4: this.modeOffset + 3
    };
    this.modeButtons = this.addComponent('modeButtons', new TouchMixxxContainer(this.group));
    this.pads = this.addComponent('pads', new TouchMixxxContainer(this.group));
    this.connectModeButtons();
    //activate mode one on load
    this.modeButtons.components.mode1.input(0, 0, 127, 0, 0);
  }

  addPad(padNumber, options) {
    options.midi = options.midi || [0xB0 + this.midiChannel, this.padOffset + padNumber];
    options.group = options.group || this.group;
    return this.pads.addComponent('pad' + padNumber, new components.Button(options));
  }

  switchMode(activeModeButton) {

    this.modeButtons.forEachComponent(function (button) {
      if (button.mode != activeModeButton.mode) {
        button.off();
      } else {
        button.on(); //switching here means we act as a radio group and one button is always active
      }
    });

    this.pads.forEachComponent(function (pad) {
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
    switch (activeModeButton.mode) {
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


  connectLoopPads() {
    this.addPad(0, {
      key: 'loop_in',
    }).trigger();
    this.addPad(1, {
      key: 'loop_move_1_forward',
    }).trigger();
    this.addPad(2, {
      key: 'loop_double',
    }).trigger();
    this.addPad(3, {
      inKey: 'reloop_toggle',
      outKey: 'loop_enabled',
    }).trigger();
    this.addPad(4, {
      key: 'loop_out',
    }).trigger();
    this.addPad(5, {
      key: 'loop_move_1_backward',
    }).trigger();
    this.addPad(6, {
      key: 'loop_halve',
    }).trigger();
    //pad seven is unused but we need a null button to over write the pad that was created for the previous mode
    this.addPad(7, {
      disconnect: function () {},
    }); //disconnect is required as we are expecting a button
  }


  connectHotCues() {
    for (var padNumber = 0; padNumber < this.numberOfPads; padNumber++) {
      var pad = this.addPad(padNumber, {
        hotCue: padNumber + 1,
        outKey: 'hotcue_' + (padNumber + 1) + '_status', // need this to force conenction
        unshift: function () {
          this.inKey = 'hotcue_' + this.hotCue + '_activate';
        },
        shift: function () {
          this.inKey = 'hotcue_' + this.hotCue + '_clear';
        }
      }).trigger();
    }
  }


  connectBeatLoopPads(smallLoopSize) {
    var loopSize = smallLoopSize || 0.5;
    for (var padNumber = 0; padNumber < this.numberOfPads; padNumber++) {
      var pad = this.addPad(padNumber, {
        inKey: 'beatloop_' + loopSize + '_toggle',
        outKey: 'beatloop_' + loopSize + '_enabled',
      }).trigger();
      loopSize *= 2;
    }
  }


  connectBeatJumpPads(smallJumpSize) {
    var jumpSize = smallJumpSize || 0.5;
    for (var padNumber = 0; padNumber < this.numberOfPads; padNumber++) {
      var pad = this.addPad(padNumber, {
        jumpSize: jumpSize,
        shift: function () {
          this.inKey = 'beatjump_' + this.jumpSize + '_backward';
          this.outKey = 'beatjump_' + this.jumpSize + '_backward';
        },
        unshift: function () {
          this.inKey = 'beatjump_' + this.jumpSize + '_forward';
          this.outKey = 'beatjump_' + this.jumpSize + '_forward';
        },
        connect: function () {
          this.connections[0] = engine.makeConnection(this.group, 'beatjump_' + this.jumpSize + '_forward', this.output);
          this.connections[1] = engine.makeConnection(this.group, 'beatjump_' + this.jumpSize + '_backward', this.output);
        }
      }).trigger();
      jumpSize *= 2;
    }
  }


  connectSamplers() {
    var samplerOffset = (script.deckFromGroup(this.group) - 1) * 8;
    for (var padNumber = 0; padNumber < this.numberOfPads; padNumber++) {
      var pad = this.pads.addComponent('pad' + padNumber, new components.SamplerButton({
        midi: [0xB0 + this.midiChannel, this.padOffset + padNumber],
        number: padNumber + samplerOffset + 1,
      }));
      pad.trigger();

    }
  }


  connectModeButtons() {
    var callback = this.switchMode.bind(this);
    for (var mode in this.padModes) {
      this.modeButtons.addComponent(mode, {
        midi: [0xB0 + this.midiChannel, this.padModes[mode]],
        mode: mode,
        active: false,
        isShifted: false,
        isSecondFunction: false,
        callback: callback,
        input: function (channel, control, value, status, group) {
          //The TouchOSC midi buttons send a command on press and release we only respond to a press which allows us to toggle
          if (value) {
            /*
            the idea here is that second function persists when we switch mode
            we use shift to enable second function but a button press
            ( when second fucntion is active ) clears the second functions
            this means the engagment of second fucntion is visable even when we reassign the pads / switch modes
            */
            this.isSecondFunction = (this.isShifted || (this.isSecondFunction && !this.active)) ? true : false;
            //we do out swtiching in the callback to allow the buttons to act a a radio group
            this.callback(this);
          }
        },
        output: function () {
          midi.sendShortMsg(this.midi[0], this.midi[1], this.active * 127);
          //An led to indicate second function
          midi.sendShortMsg(this.midi[0], this.midi[1] + 4, this.isSecondFunction * 127);
        },

        toggle: function () {
          //we only toggle secondFunction if shift is held this allows it to persist even when the button is not active
          if (this.isShifted) this.isSecondFunction = !this.isSecondFunction;
          this.active = !this.active || (this.active && this.isShifted);
          this.output();
        },
        on: function () {
          this.active = true;
          this.output();
        },
        off: function () {
          this.active = false;
          this.output();
        },
        shift: function () {
          this.isShifted = true;
        },
        unshift: function () {
          this.isShifted = false;
        },
      });
    }
  }
}


/*
  TouchMixxxMaster
*/

class TouchMixxxMaster {
  constructor(midiChannel, group, numberOfSamplers) {
    this.midiChannel = midiChannel || 0x09;
    this.group = group || '[Master]';
    this.numberOfSamplers = numberOfSamplers || 64;

    this.ctrls = {
      knobs: {
        gain: 0x00,
        balance: 0x01,
        headGain: 0x02,
      },
      headMix: 0x03,
      crossfader: 0x04,
      fxMix1: 0x06,
      fxMix2: 0x07,
      shift: 0x08,
      sampleVolume: 0x05,
      loadPage: 0x0A,
      VUMeterL: 0x12,
      VUMeterR: 0x13,
      fx1Enable: 0x24,
      fx2Enable: 0x25,
      samplerFx1Enable: 0x26,
      samplerFx2Enable: 0x27,
    }

    //BASIC KNOBS
    for (let knob in this.ctrls.knobs) {
      this[knob] = new TouchMixxxPot({
        midi: [0xB0 + this.midiChannel, this.ctrls.knobs[knob]],
        key: knob,
        group: this.group,
        hiRes: true
      });
    }

    //HEADPHONE MIX
    this.headMix = new TouchMixxxPot({
      midi: [0xB0 + this.midiChannel, this.ctrls.headMix],
      key: 'headMix',
      group: this.group,
      centerZero: true,
    });

    //CROSS FADER
    this.crossfader = new TouchMixxxPot({
      midi: [0xB0 + this.midiChannel, this.ctrls.crossfader],
      key: 'crossfader',
      group: this.group,
      centerZero: true,
    });

    //MASTER FX 1 ENABLE
    this.fx1Enable = new components.Button({
      midi: [0xB0 + this.midiChannel, this.ctrls.fx1Enable],
      group: '[EffectRack1_EffectUnit1]',
      type: components.Button.prototype.types.toggle,
      key: 'group_' + this.group + '_enable',
    });

    //MASTER FX 1 MIX -- on the XY pad
    this.fxMix1 = new TouchMixxxPot({
      midi: [0xB0 + this.midiChannel, this.ctrls.fxMix1],
      key: 'mix',
      group: '[EffectRack1_EffectUnit1]',
    });

    //MASTER FX 2 ENABLE
    this.fx2Enable = new components.Button({
      midi: [0xB0 + this.midiChannel, this.ctrls.fx2Enable],
      group: '[EffectRack1_EffectUnit2]',
      type: components.Button.prototype.types.toggle,
      key: 'group_' + this.group + '_enable',
    });

    //MASTER FX 1 MIX -- on the XY pad
    this.fxMix2 = new TouchMixxxPot({
      midi: [0xB0 + this.midiChannel, this.ctrls.fxMix2],
      key: 'mix',
      group: '[EffectRack1_EffectUnit2]',
    });

    //SAMPLE VOLUMNE
    this.sampleVolume = new TouchMixxxPot({
      midi: [0xB0 + this.midiChannel, this.ctrls.sampleVolume],
      key: 'volume',
      group: '[Sampler1]', //hack to force an outgoing connection...
      numberOfSamplers: this.numberOfSamplers,
      input: function (channel, control, value, status, group) {
        for (var s = 1; s <= this.numberOfSamplers; s++) {
          engine.setParameter("[Sampler" + s + "]", "volume", value / this.max);
        }
      }
    });

    //SAMPLE FX 1 ENABLE
    this.samplerFx1Enable = new components.Button({
      midi: [0xB0 + this.midiChannel, this.ctrls.samplerFx1Enable],
      group: '[EffectRack1_EffectUnit1]',
      type: components.Button.prototype.types.toggle,
      key: 'group_[Sampler1]_enable',
      numberOfSamplers: this.numberOfSamplers,
      input: function (channel, control, value, status, group) {
        if (value) {
          for (var s = 1; s <= this.numberOfSamplers; s++) {
            var key = "group_[Sampler" + s + "]_enable";
            engine.setParameter(this.group, key, !engine.getParameter(this.group, key));
          }
        }
      }
    });

    //SAMPLE FX 2 ENABLE
    this.samplerFx2Enable = new components.Button({
      midi: [0xB0 + this.midiChannel, this.ctrls.samplerFx2Enable],
      group: '[EffectRack1_EffectUnit2]',
      type: components.Button.prototype.types.toggle,
      key: 'group_[Sampler1]_enable',
      numberOfSamplers: this.numberOfSamplers,
      input: function (channel, control, value, status, group) {
        if (value) {
          for (var s = 1; s <= this.numberOfSamplers; s++) {
            var key = "group_[Sampler" + s + "]_enable";
            engine.setParameter(this.group, key, !engine.getParameter(this.group, key));
          }
        }
      }
    });
    //VU METER
    this.vumeter = new TouchMixxxVUMeter({
      midiL: [0xB0 + this.midiChannel, this.ctrls.VUMeterL],
      midiR: [0xB0 + this.midiChannel, this.ctrls.VUMeterR],
      group: this.group,
    });
  };
}



/*
TouchMixxxDeck
*/
class TouchMixxxDeck extends TouchMixxxContainer {

  constructor(midiChannel, group) {
    super(group);
    this.midiChannel = midiChannel;
    this.ctrlNumbers = {
      jog: 0x00,
      play: 0x01,
      cue: 0x02,
      sync: 0x0A,
      rate: 0x0B,
      simpleKnobs: {
        volume: 0x04,
        pregain: 0x05,
      },
      simpleButtons: {
        rate_temp_down: 0x0C,
        rate_temp_up: 0x0D,
        rate_perm_down_small: 0x0E,
        rate_perm_up_small: 0x0F,
      },
      simpleToggles: {
        pfl: 0x03,
        quantize: 0x28,
        keylock: 0x29,
        slip_enabled: 0x2A,
      },
      eq: {
        parameter1: 0x06,
        parameter2: 0x07,
        parameter3: 0x08,
      },
      qfx: {
        super1: 0x09
      },
      browse: 0x10,
      load: 0x11,
      VUMeterL: 0x12,
      VUMeterR: 0x13,
      padModeOffset: 0x14 /* 0x1B */ ,
      padOffset: 0x1C /*0x23 */ ,
      fx1Enable: 0x24,
      fx2Enable: 0x25,
      orientation: 0x26,
      loopExit: 0x27,
    };

    //PLAY
    this.addComponent('play', new components.PlayButton({
      midi: [0xB0 + midiChannel, this.ctrlNumbers.play],
      group: this.group,
    }));

    //CUE
    this.addComponent('cue', new components.CueButton({
      midi: [0xB0 + midiChannel, this.ctrlNumbers.cue],
      group: this.group,
    }));

    //SYNC
    this.addComponent('sync', new components.SyncButton({
      midi: [0xB0 + midiChannel, this.ctrlNumbers.sync],
      group: this.group,
    }));

    this.addComponent('orientation', new TouchMixxxSlideSwitch({
      midi: [0xB0 + midiChannel, this.ctrlNumbers.orientation],
      group: this.group,
      key: 'orientation',
      lower: 0,
      upper: 2,
    }));

    //LOOP
    this.addComponent('loopExit', new components.Button({
      midi: [0xB0 + midiChannel, this.ctrlNumbers.loopExit],
      group: this.group,
      inKey: 'reloop_toggle',
      outKey: 'loop_enabled',
      type: components.Button.prototype.types.toggle,
    }));

    // RATE aka PITCH FADER
    this.addComponent('rate', new TouchMixxxPot({
      midi: [0xB0 + midiChannel, this.ctrlNumbers.rate],
      key: 'rate',
      group: this.group,
      centerZero: true,
    }));

    //FX ENABLE
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

    //SIMPLE KNOBS
    for (let knob in this.ctrlNumbers.simpleKnobs) {
      this.addComponent(knob, new TouchMixxxPot({
        midi: [0xB0 + midiChannel, this.ctrlNumbers.simpleKnobs[knob]],
        key: knob,
        group: this.group,
        hiRes: (knob == "pregain")
      }));
    }

    //SIMPLE BUTTONS
    for (let button in this.ctrlNumbers.simpleButtons) {
      this.addComponent(button, new components.Button({
        midi: [0xB0 + midiChannel, this.ctrlNumbers.simpleButtons[button]],
        key: button,
        group: this.group,
      }));
    }

    //SIMPLE TOGGLES 
    for (let button in this.ctrlNumbers.simpleToggles) {
      this.addComponent(button, new components.Button({
        midi: [0xB0 + midiChannel, this.ctrlNumbers.simpleToggles[button]],
        key: button,
        type: components.Button.prototype.types.toggle,
        group: this.group,
      }));
    }

    // EQ KNOBS
    this.addComponent('eq', new TouchMixxxContainer(this.group));
    var parameterNumber = 1;
    for (let parameter in this.ctrlNumbers.eq) {
      this.components.eq.addComponent(parameter, new TouchMixxxPot({
        midi: [0xB0 + midiChannel, this.ctrlNumbers.eq[parameter]],
        group: '[EqualizerRack1_' + this.group + '_Effect1]',
        key: "parameter" + parameterNumber++,
        hiRes: true
      }));
    }

    //FX KNOBS - ok just one for now
    this.addComponent('qfx', new TouchMixxxContainer(this.group));
    var parameterNumber = 1;
    for (let parameter in this.ctrlNumbers.qfx) {
      this.components.qfx.addComponent(parameter, new TouchMixxxPot({
        midi: [0xB0 + midiChannel, this.ctrlNumbers.qfx[parameter]],
        group: '[QuickEffectRack1_' + this.group + ']',
        key: "super" + parameterNumber++,
      }));
    }

    //PADS
    this.addComponent('pads', new TouchMixxxPadBank({
      midiChannel: midiChannel,
      group: this.group,
      modeOffset: this.ctrlNumbers.padModeOffset,
      padOffset: this.ctrlNumbers.padOffset,
    }));

    //JOG WHEEL
    this.addComponent('jog', new ToucuhMixxxJog({
      midi: [0xB0 + midiChannel, this.ctrlNumbers.jog],
      group: this.group,
    }));

    //BROWSE BUTTON
    const thisDeck = this;
    this.addComponent('browse', {
      midi: [0xB0 + midiChannel, this.ctrlNumbers.browse],
      group: this.group,
      input: function (channel, control, value, status, group) {
        if (value) {
          thisDeck.components.jog.toggleBrowse();
          this.output();
        }
      },
      output: function () {
        midi.sendShortMsg(this.midi[0], this.midi[1], thisDeck.components.jog.isBrowseMode() * 127);
      },
    });


    //LOAD BUTTON
    this.addComponent('load', new components.Button({
      midi: [0xB0 + midiChannel, this.ctrlNumbers.load],
      group: this.group,
      inKey: 'LoadSelectedTrack',
      input: function (channel, control, value, status, group) {
        if (!thisDeck.isPlaying() && thisDeck.components.jog.isBrowseMode()) {
          components.Button.prototype.input.call(this, channel, control, value, status, group);
        }
      },
      shift: function () {
        //this feels a bit of a hack but need to switch the button's group
        //to call the control. probably want a more custom button
        this.inKey = 'GoToItem';
        this.group = '[Library]';
      },
      unshift: function () {
        this.inKey = 'LoadSelectedTrack';
        this.group = thisDeck.group;
      }
    }));

    this.addComponent("vumeter", new TouchMixxxVUMeter({
      midiL: [0xB0 + midiChannel, this.ctrlNumbers.VUMeterL],
      group: this.group,
    }));

  }

  // INPUT - delegates messages to controls
  input(channel, control, value, status, group) {
    print("midi channel= " + channel + " control= " + control + " value= " + value + " st= " + status + " group= " + group);
    var ctrl = this.resolveControl(status, control);
    if (ctrl !== null) {
      ctrl.input(channel, control, value, status, group);
    } else {
      print("Error: control not found for Channel " + channel + ", Status " + status + ", Control " + control);
    }
  }

  isPlaying() {
    return engine.getValue(this.group, 'play');
  }

  deckNumber() {
    return script.deckFromGroup(this.group);
  }

}