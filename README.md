# TouchMixxx

TouchMixxx is a [TouchOSC](https://hexler.net/products/touchosc) layout designed to control the Mixxx DJ software. TouchMixxx turns your iPad in to a 4 deck DJ controller giving you hands on performance controls for the key Mixxx controls.

![TouchMixxx 4Deck iPad controller for Mixxx](https://github.com/VoidRatio/TouchMixxx/blob/master/images/TouchMixxx_4DeckMixer.jpg "TouchMixxx 4Deck iPad controller for Mixxx")

##### Important:
* TouchMixxx and Mixxx are free, but you'll need to pay for TouchOSC MK1. That said, it's a great app and useful for controlling all sorts of MIDI-enabled software, so well worth the price of an overpriced coffee.
* Mixxx is available for macOS, Windows, and Linux, and TouchOSC MK1 is available for Android and iOS. However, TouchMixxx has not been tested with all these platforms. If it works, let me know; if it doesn't, let me know, and I'll see if I can fix it.
* TouchMixxx was designed for *TouchOSC MK1* and has not been tested with the new version of TouchOSC. As of March 2025, Hexler is still supporting [TouchOSC MK1](https://hexler.net/products/touchosc).

---

## Installation on macOS / iOS

### 1. Install and configure TouchOSC

* On your iPad, head over to the Apple App Store and purchase [TouchOSC MK1](https://apps.apple.com/app/touchosc/id288120394).
* On your Mac, download and install [TouchOSC Bridge](https://hexler.net/products/touchosc#downloads)  — _this allows the TouchOSC app to communicate with your Mac and control your MIDI-enabled software and devices._
* Open TouchOSC Bridge on your Mac.
* To copy the TouchOSC layout to your iPad, connect your iPad to your Mac with a USB cable and open it in Finder.
* Open the **Files** tab on your iPad and drag **TouchMixxx_v*.*.touchosc** onto the TouchOSC app.
* Launch TouchOSC on your iPad, open the settings menu (gray dot, top right), choose **TouchOSC Bridge**, and switch it to **Enabled**.
* You should see your Mac listed under **Found Hosts**.
* Return to the settings menu, tap on the item listed under **LAYOUT**.
* From the list of layouts, select **TouchMixxx** — _the file you installed above_.
* Tap **TouchOSC** to return to **Settings**, then tap **Done**. You should now see the TouchMixxx layout.

---

### 2. Install and configure Mixxx

* Download and install [Mixxx 2.5](https://www.mixxx.org/download/) or later.
* Copy **TouchMixxx.js** and **TouchMixxx.midi.xml** into:  
  `/Users/<username>/Library/Containers/org.mixxx.mixxx/Data/Library/Application Support/Mixxx/controllers`  

  _(For other operating systems, see the [Mixxx Wiki](https://github.com/mixxxdj/mixxx/wiki/Controller-Mapping-File-Locations))_.
* Start Mixxx and open **Preferences**.
* Under **Controllers**, you should see **TouchOSC Bridge**. Click on that.
* Ensure that the **Enable** checkbox is checked.
* In the **Load Preset** dropdown, choose **TouchMixxx**, click **OK**, and you're all done.  
  Now go drop some beats!

---

## User Guide

If you're familiar with Mixxx or other DJ software, most of the controls should be self-explanatory.  
If you're new to Mixxx and digital DJing, perhaps start with the [Mixxx manual](https://www.mixxx.org/manual/latest/en/chapters/introduction.html).  
The notes below cover the controls specific to TouchMixxx.

---

### Decks

* Each of the four decks can be accessed by tapping the numbered tabs at the top of the screen.
* The mixer channel strip for each deck is replicated alongside the deck for convenience.
* The **SHIFT** buttons (top left and right) allow access to _secondary functions_ as detailed below.
* Below the **Jog Wheel** are 8 Pads that allow setting/accessing Hot Cues, Beat Jump, Setting Loops, and triggering Samples — 8 per deck.

![TouchMixxx Deck](https://github.com/VoidRatio/TouchMixxx/blob/master/images/TouchMixxx_Deck.jpg "TouchMixxx Deck")

---

### Browsing & Loading Tracks

* Tap **BROWSE** to navigate your Library and load tracks.  
  When **BROWSE** is enabled, the **Jog Wheel** scrolls up and down through your tracks, playlists, and crates.
* To load a track, enable **BROWSE**, use the **Jog Wheel** to highlight a track, and tap **LOAD** to load it into the current deck.  
  _Note: A new track cannot be loaded while the current track is playing._
* Holding **SHIFT** while **BROWSE** is enabled allows you to use the **Jog Wheel** to switch between the two Library panes.  
  When the Library Sidebar has focus, holding **SHIFT** while tapping **LOAD** expands the selected folder in the hierarchy.

---

### Jog Wheel

* The **Jog Wheel’s** function changes depending on whether the deck is playing or if **BROWSE** is enabled.
* When a track is paused, use the **Jog Wheel** to scrub through the track.  
  Holding **SHIFT** increases the scrub speed.  
  _(The pads in Beat Jump mode can also be used to navigate through a track while paused or playing.)_
* When a track is playing, the **Jog Wheel** functions like touching the platter of a vinyl turntable,  
  allowing you to temporarily speed up or slow down the track for beatmatching.
* Below the jog wheel, the **+** and **-** buttons adjust the playback speed while held.
* If **SHIFT** is held while the track is playing, the **Jog Wheel** behaves as if you were touching the record,  
  allowing you to scratch or stop playback until **SHIFT** is released.

---

### Pitch Control

* Left of the **Jog Wheel** is the **Pitch Control** and **Sync** button.
* Pull the **Pitch Control** down to increase the playback speed, push up to decrease it.
* The **+** and **-** buttons adjust the pitch in small increments.
* The **Sync** button engages sync for the deck and fills the comments section of your YouTube clip with helpful hints like:  
  > *"Real DJs don’t use sync, dude."* 😉

---

### Pads

#### Decks
* Each of the four decks can be accessed by tapping the numbered tabs at the top of the screen
* The mixer channel strip for each deck is replicated alongside the deck for convenience
* Top left and right you'll find duplicate SHIFT buttons these allow access to _second functions_ as detailed below
* Below the 'Jog Wheel' are 8 Pads that allow, setting / accessing Hot Cues, Beat Jump, Setting Loops, and triggering Samples - 8 per deck.

---

### Mixer

![TouchMixxx Mixer](https://github.com/VoidRatio/TouchMixxx/blob/master/images/TouchMixxx_Mixer.jpg "TouchMixxx Mixer")

* The **Mixer** is accessed by tapping the **Mixer** tab.
* Four **Channel Strips** correspond to the 4 decks.
* The **Sample Knob** (next to **Master Volume**) adjusts the volume of all samples.
* The **XY Pad** adjusts the FX mix of the two FX racks.
* **Loop Toggle** buttons allow you to exit a loop from the mixer.

---

## Contributing

Suggestions and bug reports are welcome.

## License

[GNU General Public License v3.0](https://choosealicense.com/licenses/gpl-3.0/)