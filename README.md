**Bower** `helios-audio-mixer`

# Web Audio Mixer

Javascript audio multi-track mixer library. Optimally uses the web audio API ([caniuse](http://caniuse.com/audio-api)), but gracefully degrades to HTML5.

#### Contents

- Dependencies
- How To Use
	- Basic
	- Groups
- Reference
	- Mixer Methods
	- Track/Group Methods
	- Track Options
	- Track Events
- HTML5 Mode


### Dependencies

- [heliosFrameRunner](https://github.com/heliosdesign/helios-frame-runner) (not _really_ a dependency, but recommended for managing `requestAnimationFrame`)
- [tween.js](https://github.com/sole/tween.js/) (recommended, but works without it)
- [Bowser](https://github.com/ded/bowser) (recommended, but works without it)

### Props

…to Kevin Ennis for his excellent [Mix.js](https://github.com/kevincennis/Mix.js). We based this library on Mix.js when we started working with the web audio API a couple years ago.

## How to use


#### Basic

```
var Mixer = new heliosAudioMixer();

// A) buffer source mode
Mixer.createTrack('track1', { source: 'path/to/audio/file' }); // note no file extension

// OR B) pre-existing media element source mode
Mixer.createTrack('track1', { source: document.querySelector('#mediaElement') });

Mixer.getTrack('track1').gain(0.5).pan(180); // setters are chainable!

Mixer.getTrack('track1').tweenGain(0, 1000, function(){
	Mixer.getTrack('track1').stop();
});



```


#### Groups

Work with groups of tracks using `getTracks()`.

```
Mixer.createTrack('meow', {
	source:   'audio/meow',
	group:    'cats',
	autoplay:  false
})

Mixer.createTrack('hiss', {
	source:   'audio/hiss',
	group:    'cats',
	autoplay:  false		
})

Mixer.createTrack('hown', {
	source:   'audio/howl',
	group:    'dogs',
	autoplay:  true
})

function cats(){
	Mixer.getTracks('dogs').tweenGain(0, 1000, function(){
		Mixer.getTracks('dogs').pause();
		Mixer.getTracks('cats').play();		
	})
}

```


## API Reference

### Detect Object

Used internally for falling back and playing the right type of audio file. Access/override/whatever through `Mixer.detect`.

```
Detect = {
	webAudio:    true | false
	nodes:     { gain, gainNode, panner, convolver, delay, delayNode, compressor }
//	audioType:  '.m4a' | '.ogg' | '.mp3' // deprecated
	audioTypes: '{ m4a, mp4, ogg }'
	videoType:  '.webm' | '.mp4' | '.ogv'
	tween:       true | false
}
```

### Mixer Methods

##### Constructor Options

`new heliosAudioMixer( options{} )`

`audioTypes: [ 'm4a', 'mp3', 'ogg' ]` List file types in order of preference. The first type available in the current browser will be used.

`videoTypes: [ '.webm', '.mp4', '.ogv' ]`

##### Events

- `on('event',function)` events: see below
- `off('event')`

##### Track Management

- `createTrack( name, opts )` see below for `opts`
- `removeTrack(name)`
- `getTrack( name )`
- `getTracks( group/* )`
- `each( tracks, function(track){} )`

##### Globals

- `mute( toggle )`
- `unmute()`
- `masterVolume( 0-1 )`

##### Utilities

- `updateTween()` **IMPORTANT:** call this (or `TWEEN.update()`) using rAF for tweens to work
- `setLogLvl()` 0 none, 1 minimal, 2 all (spammy)
- `formatTime( seconds )` `78` -> `"01:18"`

### Getting Track(s)

`Mix.getTrack('name')` returns a single track. You can chain commands to the track, ie `Mix.getTrack('name').volume(1).currentTime(0)`.

`Mix.getTracks('group')` returns an array of tracks. If you call it with no arguments, it will return all tracks. You can command multiple tracks using `each()`: `Mix.each( getTracks('group'), function(track){ track.volume(1) } )`.

##### Events

- `on('event',function)`
- `off('event')`

##### Control

- `play()`
- `pause()`
- `stop()`

##### Pan

- `pan(angle)` stereo pan: angle can be a number in degrees (0° front, counts clockwise: 90° is right) or a string: `'front'`, `'back'`, `'left'`, `'right'`
- `tweenPan(angle, duration, callback)`

##### Gain

- `gain(setTo)` range 0-1
- `tweenGain(setTo, duration, callback)`
- `mute()`
- `unmute()`

##### Time

- `currentTime( setTo )` get/set current time in seconds
- `duration()` get track duration in seconds


### Track Options

name | default | notes
---------|---------|---------
source       | ``     | Path to audio source file (without file extension), OR media element to use as source
nodes        | `[]`      | array of strings: names of desired additional audio nodes
gain         | `0`        | initial/current gain (0-1)
pan          | `0`        | stereo pan (in degrees, clockwise, 0 is front)
start        | `0`        | start time in seconds
currentTime  | `0`        | current time (cached for resuming from pause)
looping      | `false`    | 
autoplay     | `true`     | play immediately on load
muted        | `false`    | 

#### Track Events

name | when
:-- | :--
`remove` | removeTrack()
`load` | audio track is ready to play
`play` | 
`pause` | 
`stop` | 
`ended` | track reaches the end
`pan` | pan is changed
`gain` | gain is changed

```
mix.getTrack('name').on('eventType',function(){
	// do!
});
mix.getTrack('name').off('eventType');
```

## HTML5 Mode

Fallback mode for older browsers, and iOS 7. Trying to use Web Audio features like pan will fail gracefully, without errors (`return false`).

#### Tracks

In HTML5 mode, creating a track that already exists will change its source, unlike Web Audio mode where this will return an error. This allows you to circumvent the iOS requirement that media elements can only be played after a user taps 'play'—simply play all your tracks on that first tap. **NOTE** that you can only play one audio element at a time.

```
// Create all tracks at the start
Mixer.createTrack('track1', {
	source: 'a_file.mp3'
});
Mixer.createTrack('track2', {});

// on iOS play button tap
for(var i=0; i < Mixer.tracks.length; i++ ){
	Mixer.tracks[i].play();
}

// If the track’s already been created, the mixer will swap its source
Mixer.createTrack('track1', { 
	source:   'file.mp3',
	autoplay:  true
});
```

#### iOS 7

iOS 6 supports the Web Audio API and it works pretty well. iOS 7 "supports" the Web Audio API, but it’s very unstable. Web apps that worked perfectly on iOS 6 will crash in under a minute on iOS 7. Unfortunately Apple won’t allow alternative web rendering engines, so this library falls back to HTML5 on iOS 7.

#### iOS Volume Control

iOS does *not* support volume control for HTML5 audio elements. The reasoning is that the user should be able to control the volume with the OS-level volume control. Apparently in Apple-land nobody could ever possibly want to layer two tracks, or fade anything in or out, ever.
