# TouchMixxx

TouchMixxx is a [TouchOSC](https://hexler.net/products/touchosc) layout designed to control the Mixxx DJ software. TouchMixxx turns your iPad in to a 4 deck DJ controller giving you hands on performance controls for the key Mixxx controls.

To make use of TouchMixxx you'll need and iPad Mini ( or better ) a copy of the excellent, and free, [Mixxx DJ Software](https://www.mixxx.org) and the [TouchOSC](https://hexler.net/products/touchosc) app.

![alt tag](https://github.com/VoidRatio/TouchMixxx/blob/master/TouchMixxx_4DeckMixer.jpg "TocuhMixxx 4Deck iPad controller for Mixxx")

##### Important:
* TouchMixxx and Mixxx are free but you'll need to pay for TouchOSC, that said it's a great app and useful for controlling all sorts of midi enabled software so well worth the price of and over priced coffee.
* Mixxx is available for Windows and Linux and TouchOSC is available for Android but currently TouchMixx has not be tested with these platforms. If it works let me know, if it doesn't work let me know and I'll see if I can fix it.

## Installation on OS X


#### 1. Install and configure TouchOSC

* On your iPad head over to the Apple App store and purchase [TouchOSC](https://apps.apple.com/app/touchosc/id288120394)
* On your Mac Download and install [TouchOSC Bridge](https://hexler.net/products/touchosc#downloads) - _this allows the TouchOSC app to communicate with your Mac and control your midi enabled software and devices_
* Run TouchOSC Bridge on your Mac
* Connect your iPad to your Mac and launch iTunes
* In iTunes navigate to the 'file sharing' menu for your iPad and select the 'TouchOSC' app
* Download TouchMixxx_v.1.0.touchosc from the 'TouchOSC' directory and drag it onto the 'TouchOSC Documents' pane in iTunes
* Launch TouchOSC on your iPad, open the settings menu ( grey dot, top right ), choose 'TouchOSC Bridge' and switch to 'Enabled'
* You should see your Mac listed under 'Found Hosts'
* Return to settings menu, tap on the item listed under 'LAYOUT'
* From the list of layouts select the TouchMixxx_v.1.0 -- _the file you downloaded and installed above_
* Tap 'TouchOSC' to return to 'Settings', tap 'Done'. You should now see the TouchMixxx layout

### 2. Install and configure Mixxx

* Download and install [Mixxx 2.2](https://www.mixxx.org/download/) or better
* Copy the files contained in the 'src' directory into ''/Users/<your username>/Library/Application Support/Mixxx/Controllers'
* Start Mixxx and open 'Preferences'
* Under Controllers, you should see 'TouchOSC Bridge', click on that bad boy
* Ensure that the 'Enable' check box is checked
* In the 'Load Preset' dropdown, choose 'TouchMixxx', click 'OK' and you're all done. Go drop some beats!

## User Guide

If you are familiar with Mixxx or other DJ software most of the controls should be self explanatory. If you are new to Mixxx and digital DJing then perhaps start with the [Mixxx manual](https://www.mixxx.org/manual/latest/en/chapters/introduction.html). The notes below cover the controls specific to TouchMixxx.

#### Decks
* Each of the four decks can be accessed by tapping the numbered tabs at the top of the screen
* The mixer channel strip for each deck is replicated alongside the deck for convenience
* Top left and right you'll find duplicate SHIFT buttons these allow access to _second functions_ as detailed below
* Below the 'Jog Wheel' are 8 Pads that allow, setting / accessing Hot Cues, Beat Jump, Setting Loops, and triggering Samples - 8 per deck.

![alt tag](https://github.com/VoidRatio/TouchMixxx/blob/master/TouchMixxx_Deck.jpg "TouchMixxx Deck")

##### Pads
* The _pad mode_ is selected but tapping the corresponding buttons directly above the pads
* In Hot Cue mode, Hot Cues are indicated by the pad being illuminated, tap an unilluminated pad to set a Hot Cue, hold SHIFT and tap a illuminated pad to clear the Hot Cue
* In Beat Jump mode holding SHIFT while tapping a pad will cause the track to jump backwards instead of forwards by the number of beats indicated above each pad
* Sample pads are active when illuminated, tap the pad to play the sample. Holding SHIFT while tapping will clear the sample. _Note there is currently no way to load a sample directly from TouchMixxx_

##### Jog Wheel
* The Jog Wheel's function changes depending on whether the deck is playing or if BROWSE is enabled
* When the track is paused use the Jog Wheel to scrub through the track. Holding SHIFT increases the scrub speed. _Note the pads in Beat Jump mode can also be used to quickly navigate through a track while paused or playing_
* When the track is playing the Jog Wheel replicates touching the platter of a vinyl turntable, allowing you to temporarily speed up or slow down the track to beat match
* If SHIFT is held when the track is playing the Jog Wheel behaves as if you were touching the record on a turntable and allows you to scratch or stop playback until SHIFT is released

##### Browsing loading tracks
* Tapping BROWSE allows you to navigate your Library and load tracks. When BROWSE is enabled the Jog Wheel is used to scroll up and down through your tracks, playlists, and crates
* To load a track, enable BROWSE, then use the Jog Wheel to highlight the track on your playlist and tap LOAD to load it into the current deck. _Note a new track cannot be loaded while the current track is playing_
* Holding SHIFT while BROWSE is enabled allows you to use the Jog Wheel to switch between the two Library panes. When the Library SideBar has focus holding SHIFT while tapping LOAD expands the selected folder in the hierarchy


#### Mixer
* The mixer is accessed by tapping the 'Mixer' tab
* To the left of the Mixer page are four channel strips corresponding to the 4 Decks
* The overall level of the Samples can be adjusted via the Sample knob located next to the Master volume knob. This adjusts the volume of all samples, use the sample pre-gain controls in Mixxx to balance the level between samples as needed
* Below the Sample and Master gain controls are buttons that engage the two FX racks for the sample and master buses
* If any of the decks are looping the corresponding 'Loop Toggle' button will be illuminated and can be used to exit the loop from the Mixer
* Below the 'Loop Toggle' buttons are two rows of buttons that toggle the two FX racks for each channel
* The XY pad adjusts the FX mix of the two FX racks
* Either side of the crossfader are switches that allow the configuration of the four decks to the left, right of centre of the crossfader

![alt tag](https://github.com/VoidRatio/TouchMixxx/blob/master/TouchMixxx_Mixer.jpg "TouchMixxx Mixer")

#### FX Racks
Currently the effects in the FX racks cannot be configured via the TouchMixxx interface but once configured the two racks can be enabled for each deck, the Samplers and the Master output. The XY pad is used to mix the effect wet / dry mix for channels on which they are active

#### Contributing
Suggestions and bug reports are welcome.


## Licence
[GNU General Public License v3.0](https://choosealicense.com/licenses/gpl-3.0/)
