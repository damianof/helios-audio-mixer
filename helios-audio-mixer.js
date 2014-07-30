;(function(window, undefined){

'use strict';

var GLOBAL = {
    trackTypes: [ 'html5', 'elementSrc', 'bufferSrc' ],
    eventTypes: [
        // 'loadstart',
        // 'progress',
        // 'suspend',
        // 'abort',
        // 'error',
        // 'emptied',
        // 'stalled',

        // 'loadedmetadata',
        // 'loadeddata',
        // 'canplay',
        'canplaythrough',

        'playing',
        // 'waiting',

        'play',
        'pause',
        'timeupdate',

        'seeking',
        'seeked',
        'ended',

        // 'ratechange',
        // 'durationchange',

        // 'resize',
        'volumechange'
    ]
}

var extend = function(){
    var output = {}, 
        args = arguments,
        l = args.length;

    for ( var i = 0; i < l; i++ )       
        for ( var key in args[i] )
            if ( args[i].hasOwnProperty(key) )
                output[key] = args[i][key];
    return output;
}

var constrain = function(val, min, max){
    if(val < min) return min;
    if(val > max) return max;
    return val;
}




// ██████  ██████ ██████ ██████  █████ ██████ 
// ██   ██ ██       ██   ██     ██       ██   
// ██   ██ █████    ██   █████  ██       ██   
// ██   ██ ██       ██   ██     ██       ██   
// ██████  ██████   ██   ██████  █████   ██   

// Feature Detection

var Detect = {

    audioElement : !!document.createElement('audio').canPlayType,
    videoElement : !!document.createElement('video').canPlayType,

    // General web audio support
    webAudio : !!(window.webkitAudioContext || window.AudioContext),

    // THE ALL-IN-ONE ALMOST-ALPHABETICAL GUIDE TO DETECTING EVERYTHING
    // http://diveintohtml5.info/everything.html

    audioType : (function(){

        var el = document.createElement('audio'),
            extension = false;

        if( !!(el.canPlayType && el.canPlayType('audio/mp4; codecs="mp4a.40.2"').replace(/no/, '')) ) {
            extension = '.m4a';
        } else if( !!(el.canPlayType && el.canPlayType('audio/mpeg;').replace(/no/, ''))  ) {
            extension = '.mp3';
        } else if( !!(el.canPlayType && el.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/, '')) ) {
            extension = '.ogg';
        } else {
            extension = false;
        }

        el = null;
        return extension;
    })(),

    // Which audio types can the browser actually play?
    audioTypes : (function(){
        var el = document.createElement('audio')

        return {
            '.m4a': !!(el.canPlayType && el.canPlayType('audio/mp4; codecs="mp4a.40.2"').replace(/no/, '')),
            '.mp3': !!(el.canPlayType && el.canPlayType('audio/mpeg;').replace(/no/, '')),
            '.ogg': !!(el.canPlayType && el.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/, ''))    
        }
    })(),

    videoType : (function(){

        var el = document.createElement('video'),
            extension = false;

        if( !!(el.canPlayType && el.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/no/, '')) ) {
            extension = '.webm';
        } else if( !!(el.canPlayType && el.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"').replace(/no/, ''))  ) {
            extension = '.mp4'; // h264
        } else if( !!(el.canPlayType && el.canPlayType('video/ogg; codecs="theora"').replace(/no/, '')) ) {
            extension = '.ogv';
        } else {
            extension = false;
        }

        el = null;
        return extension;

    })(),

    videoTypes: (function(){
        var el = document.createElement('video')

        return {
            '.webm': !!(el.canPlayType && el.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/no/, '')),
            '.mp4':  !!(el.canPlayType && el.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"').replace(/no/, '')),
            '.ogv':  !!(el.canPlayType && el.canPlayType('video/ogg; codecs="theora"').replace(/no/, ''))
        }

    })(),

    // prefer bowser, but with fallback

    browser : (function(){

        if( typeof bowser !== 'undefined' ) return bowser;

        return {
            firefox: navigator.userAgent.match(/Firefox/g) ? true : false,
            android: navigator.userAgent.match(/Android/g) ? true : false,
            msie:    navigator.userAgent.match(/MSIE/g) ? true : false,
            ios:     navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false,

            version: false
        };
    })(),

    tween : (function(){
        return ( typeof TWEEN === 'undefined' ) ? false : true
    })() // is tween.js present?

};

















// ██████ ██  ██ ██████ ███  ██ ██████ ████  
// ██     ██  ██ ██     ████ ██   ██  ██     
// █████  ██  ██ █████  ██ ████   ██   ████  
// ██      ████  ██     ██  ███   ██      ██ 
// ██████   ██   ██████ ██   ██   ██  █████  

var Eventful = function(){};

Eventful.prototype.on = function(type, callback){
    this.events[type] = this.events[type] || [];
    this.events[type].push( callback );

    return this
};

Eventful.prototype.one = function(type, callback){
    // this.events[type] = this.events[type] || [];
    // this.events[type].push( callback );

    return this
};

Eventful.prototype.off = function(type){

    if( type === '*' )  this.events = {};
    else                this.events[type] = [];

    return this
};

Eventful.prototype.trigger = function(type){

    if ( !this.events[type] ) return;

    // Mix.log(arguments,2);

    var args = Array.prototype.slice.call(arguments, 1);

    for (var i = 0, l = this.events[type].length; i < l;  i++)
            if ( typeof this.events[type][i] == 'function' ) 
                this.events[type][i].apply(this, args);

};








// ███  ███ ████ ██   ██ 
// ████████  ██   ██ ██  
// ██ ██ ██  ██    ███   
// ██    ██  ██   ██ ██  
// ██    ██ ████ ██   ██ 


var Mix = function(opts){

    this.debug = 1;      // 0 no logging, 1 minimal, 2 all (very spammy)

    this.log = function(msg, lvl){
        if(lvl <= this.debug) console.log(msg);
    };

    this.setLogLvl = function( lvl ){
        this.debug = constrain(lvl,0,2);
        this.log('[Mixer] Set log level: ' + lvl, 1)
        console.log(this)
    };

    var defaults = {
        audioTypes: [ '.m4a', '.mp3', '.ogg' ],
        videoTypes: [ '.webm', '.mp4', '.ogv' ],
        // html5: false,
    };
    this.options = extend.call(this, defaults, opts || {});


    this.tracks  = [] // tracks as numbered array
    this.lookup  = {} // tracks as lookup table: lookup['trackname']

    this.groups  = {} // easy access to groups: group['groupname']

    this.playing = false; // true if any tracks are playing
    this.muted   = false; // 
    this.gain    = 1;     // master gain for entire mix

    this.events  = {};    
    this.context = null;  // AudioContext object (if webAudio is available)

    this.detect  = Detect; // just an external reference for debugging


    // // Web Audio supported?
    // // ********************************************************

    // if( 
    //     ( Detect.browser.name === 'Firefox' && Detect.version && Detect.version < 25 ) || // Firefox < 25
    //     ( Detect.browser.ios === true && Detect.browser.version != 6 ) ||                 // ios 7
    //     this.options.html5 
    // ){
    //     Detect.webAudio = false;
    // }


    // File Types
    // ********************************************************

    for (var i = this.options.audioTypes.length-1; i >= 0; i--) {
        if( ! Detect.audioTypes[ this.options.audioTypes[i] ] )
            this.options.audioTypes.splice(i,1); 
    };
    if( this.options.audioTypes.length <= 0 ) {
        console.warn('None of the specified audio types can play in this browser.')
    }

    for (var i = this.options.videoTypes.length-1; i >= 0; i--) {
        if( ! Detect.videoTypes[ this.options.videoTypes[i] ] )
            this.options.videoTypes.splice(i,1); 
    };
    if( this.options.videoTypes.length <= 0 ) {
        console.warn('None of the specified video types can play in this browser.')
    }

    this.log(this.options.audioTypes,1)
    this.log(this.options.videoTypes,1)


    // if web audio is supported, create a context
    if( Detect.webAudio === true ){

        if ( typeof AudioContext === 'function' ) this.context = new window.AudioContext();
        else                                      this.context = new window.webkitAudioContext();

    }

    return this

};

Mix.prototype = new Eventful(); // inherit event handling




Mix.prototype.createTrack = function( _name, _opts ){

    if( !_name )
        throw new Error('Can’t create track with no name')

    if( this.lookup[_name] )
        throw new Error('A track called "' +_name+ '" already exists')

    if( (_type === 'element' || _type === 'buffer') && !Detect.webAudio )
        throw new Error('Can’t create ' + _type + ' track, web audio not supported.')

    if( _type && GLOBAL.trackTypes.indexOf( _type ) === -1 )
        throw new Error('Can’t create track, "' + _type + '" is not a supported track type.')


    var track = new Track( _name, _opts, this );

    this.tracks.push( track )
    this.lookup[ _name ] = track

    return track;
    
};




Mix.prototype.removeTrack = function(name){

    var mix  = this,
        track = mix.lookup[name];

    if(!track) {
        console.warn('[Mixer] can’t remove "%s", it doesn’t exist', name);
        return;
    }

    var rest, 
        arr   = mix.tracks, 
        total = arr.length;

    for ( var i = 0; i < total; i++ ){
        if ( arr[i] && arr[i].name == name ) {
            rest = arr.slice(i + 1 || total);
            arr.length = i < 0 ? total + i : i;
            arr.push.apply( arr, rest );
        }
    }

    track.stop()
    track.trigger('remove', mix);
    // track.events = [];
    track = null;
    delete mix.lookup[name];
    
};



Mix.prototype.getTrack = function(name){
    return this.lookup[name];
};

Mix.prototype.getTracks = function(group){

    if( typeof group === 'undefined' ) {
        return this.tracks;

    } else {

        if( ! this.groups[group]){
            console.warn('[Mixer] Can’t get group "%s", it doesn’t exist.', group);
            return;
        }

        return this.groups[group];

    }
};


Mix.prototype.each = function( tracks, f ){
    for (var i = tracks.length - 1; i >= 0; i--) {
        f( tracks[i] );
    };
}




Mix.prototype.mute = function(toggle){
        
    // toggle
    if( this.muted === true && toggle ) {
        this.unmute();
        return;
    }

    var tracks = this.getTracks(),
        total = tracks.length;
    
    this.log('[Mixer] Muting master', 1);
    this.muted   = true;

    for ( var i = 0; i < total; i++ )
        tracks[i].mute();

    for (var j = 0; j < tracks.length; j++) {
        if(tracks[j].playing) this.playing = true;
    }
};


Mix.prototype.unmute = function(){

    var tracks = this.getTracks(),
        total = tracks.length;
    
    this.log('[Mixer] Unmuting master', 1);
    this.muted   = false;

    for ( var i = 0; i < total; i++ )
        tracks[i].unmute();

};




Mix.prototype.masterVolume = function(masterGain){

    if( typeof masterGain !== 'undefined') {
        var total = this.tracks.length;
        this.gain = masterGain;

        // this seems silly, but tracks multiply their gain by the master's
        // so if we change the master gain and call track.gain() we will
        // get the intended result
        for ( var i = 0; i < total; i++ )
            this.tracks[i].gain( this.tracks[i].gain() );
    }

    return this.gain;
    
};





/**************************************************************************
    
    Utilities

**************************************************************************/


// call this using rAF
Mix.prototype.updateTween = function(){
    TWEEN.update();
};

Mix.prototype.formatTime = function( seconds ){
    var m=Math.floor(seconds/60)<10 ? '0'+Math.floor(seconds/60):Math.floor(seconds/60);
    var s=Math.floor(seconds-(m*60))<10 ? '0'+Math.floor(seconds-(m*60)):Math.floor(seconds-(m*60));
    return m+':'+s;
}




















// ██████   █████   ████  ██████
// ██   ██ ██   ██ ██     ██    
// ██████  ███████  ████  █████ 
// ██   ██ ██   ██     ██ ██    
// ██████  ██   ██ █████  ██████
        
// ██████ █████   █████   ██████ ██  ██ 
//   ██   ██  ██ ██   ██ ██      ██ ██  
//   ██   █████  ███████ ██      ████   
//   ██   ██  ██ ██   ██ ██      ██ ██  
//   ██   ██  ██ ██   ██  ██████ ██  ██ 

// Dummy track, basic required functionality and properties

var Track = function( _name, _mix ){
    var self = this

    // mixer properties
    self.type = 'dummy'
    self.name = _name
    self.mix = _mix

    self.options = {}

    self.element = {
        volume: 0,
        muted: false
    }

    return this
}

Track.prototype = new Eventful(); // inherit events

Track.prototype.load  = function(){ return this }
Track.prototype.play  = function(){ return this }
Track.prototype.pause = function(){ return this }
Track.prototype.stop  = function(){ return this }

Track.prototype.currentTime = function(){ return this }
Track.prototype.duration    = function(){ return this }

Track.prototype.gain = function( _val ){

    if(typeof _val === 'number') {

        _val = constrain( _val, 0,1 )

        // if muted, remember this volume change for when we un-mute
        if( this.element.muted ){
            this.gainCache = _val
        } else {
            this.local.gain( this.options.gain * this.mix.gain )    
        }

        this.trigger( 'volumechange', { 
            volume: this.element.volume, 
            track: this 
        });

        return this

    }

    return this.element.volume
}


// // ██   ██ ██████ ███  ███ ██    ██████
// // ██   ██   ██   ████████ ██    ██    
// // ███████   ██   ██ ██ ██ ██    █████ 
// // ██   ██   ██   ██    ██ ██        ██
// // ██   ██   ██   ██    ██ █████ █████ 
                                                                          
// // ██████ █████   █████   ██████ ██  ██ 
// //   ██   ██  ██ ██   ██ ██      ██ ██  
// //   ██   █████  ███████ ██      ████   
// //   ██   ██  ██ ██   ██ ██      ██ ██  
// //   ██   ██  ██ ██   ██  ██████ ██  ██ 


// var HTML5Track = function( _name, _opts, _mix ){
//     var self = this

//     self.type = 'html5'
//     self.name = _name
//     self.mix = _mix

//     var defaults = {
//         element: 'audio',
//         params: {}
//     }

//     self.options = extend(  defaults, _opts || {} )

//     self.element = getElement( self.options.element )

//     // set up events

//     var canplay = function(){
//         if( self.status.loaded ) return;

//         self.status.loaded = true;
//         self.status.ready = true;
//         self.trigger('load', self);

//         if( ! self.options.autoplay) 
//             self.pause();
//     }
//     self.element.addEventListener('canplaythrough', canplay, false)

//     return this
// }

// HTML5Track.prototype = new Track();

// HTML5Track.prototype.load  = function(){ return this }
// HTML5Track.prototype.play  = function(){ return this }
// HTML5Track.prototype.pause = function(){ return this }
// HTML5Track.prototype.stop  = function(){ return this }

// HTML5Track.prototype.currentTime = function(){ return false }
// HTML5Track.prototype.duration    = function(){ return false }











// // ██████  ██   ██ █████ █████ ██████ █████ 
// // ██   ██ ██   ██ ██    ██    ██     ██  ██
// // ██████  ██   ██ ████  ████  █████  █████ 
// // ██   ██ ██   ██ ██    ██    ██     ██  ██
// // ██████   █████  ██    ██    ██████ ██  ██

// // ██████ █████   █████   ██████ ██  ██ 
// //   ██   ██  ██ ██   ██ ██      ██ ██  
// //   ██   █████  ███████ ██      ████   
// //   ██   ██  ██ ██   ██ ██      ██ ██  
// //   ██   ██  ██ ██   ██  ██████ ██  ██ 

// var BufferTrack = function( _name, _opts, _mix ){
//     var self = this

//     self.type = 'bufferSrc'
//     self.name = _name
//     self.mix = _mix

//     var defaults = {}
//     self.options = extend(  defaults, _opts || {} )

//     self.element = {}

//     return this
// }

// BufferTrack.prototype = new Track();

// BufferTrack.prototype.load  = function(){ return this }
// BufferTrack.prototype.play  = function(){ return this }
// BufferTrack.prototype.pause = function(){ return this }
// BufferTrack.prototype.stop  = function(){ return this }

// BufferTrack.prototype.currentTime = function(){ return false }
// BufferTrack.prototype.duration    = function(){ return false }








// // ██████ ██    ██████ ███  ███ ██████ ███  ██ ██████ 
// // ██     ██    ██     ████████ ██     ████ ██   ██   
// // █████  ██    █████  ██ ██ ██ █████  ██ ████   ██   
// // ██     ██    ██     ██    ██ ██     ██  ███   ██   
// // ██████ █████ ██████ ██    ██ ██████ ██   ██   ██   

// // ██████ █████   █████   ██████ ██  ██ 
// //   ██   ██  ██ ██   ██ ██      ██ ██  
// //   ██   █████  ███████ ██      ████   
// //   ██   ██  ██ ██   ██ ██      ██ ██  
// //   ██   ██  ██ ██   ██  ██████ ██  ██ 
                                     


// var ElementTrack = function( _name, _opts, _mix ){

//     var self = this

//     self.type = 'elementSrc'
//     self.name = _name
//     self.mix = _mix

//     var defaults = {
//         element: 'audio'

//     }
//     self.options = extend(  defaults, _opts || {} )

//     self.element = getElement( self.options.element )

//     return this

// }

// ElementTrack.prototype.load  = function(){ return this }
// ElementTrack.prototype.play  = function(){ return this }
// ElementTrack.prototype.pause = function(){ return this }
// ElementTrack.prototype.stop  = function(){ return this }

// ElementTrack.prototype.currentTime = function(){ return false }
// ElementTrack.prototype.duration    = function(){ return false }









// ██████ █████   █████   █████ ██  ██ 
//   ██   ██  ██ ██   ██ ██     ██ ██  
//   ██   █████  ███████ ██     ████   
//   ██   ██  ██ ██   ██ ██     ██ ██  
//   ██   ██  ██ ██   ██  █████ ██  ██ 

// Constructor

var Track = function(name, opts, mix){

    // default options
    this.defaults = {

        source: false,     // either a) path to audio source (without file extension)
                           //     or b) html5 <audio> or <video> element
        group:  false,

        nodes: [],         // array of strings: names of desired additional audio nodes

        gain:        1,    // initial/current gain (0-1)
        gainCache:   1,    // for resuming from mute

        pan:         0,    // circular horizontal pan

        panX:        0,    // real 3d pan
        panY:        0,    // 
        panZ:        0,    // 

        start:       0,    // start time in seconds
        cachedTime:  0,    // local current time (cached for resuming from pause)
        startTime:   0,    // time started (cached for accurately reporting currentTime)

        looping:  false,   //

        autoplay: true,    // play immediately on load

        muted: false,

        dummy: false // making it possible to chain bad getTrack() calls
    };

    // override option defaults
    this.options = extend.call(this, this.defaults, opts || {});


    this.name = name;

    // Status
    this.status = {
        loaded:  false,
        ready:   false,
        playing: false
    }

    this.mix     = mix;  // reference to parent

    this.events  = {};
    this.tweens  = {};
    this.nodes   = null;   // holds the web audio nodes (gain and pan are defaults, all other optional)

    this.onendtimer = null,  // web audio api in chrome doesn't support onend event yet (WTF)

    this.element = null; // html5 <audio> or <video> element
    this.source  = null; //  web audio source:

    if( this.options.dummy ){ 
        console.log(this.options)
        console.warn('[Mixer] Couldn’t find track "' + this.options.dummy + '"')
        return
    }

    var self = this;

    if( self.mix.muted === true )
        self.options.muted = true;

    // append extension only if it’s a file path
    this.sourceMode = null
    if( typeof this.options.source === 'string' ){
        this.options.source += this.mix.options.fileTypes[0];
        this.sourceMode = 'buffer'
    } else if( typeof this.options.source === 'object' ){
        this.sourceMode = 'element'
    }

    this.mix.log(this.options, 2);

    // Group
    // ~~~~~

    if(this.options.group){
        if( ! this.mix.groups[ this.options.group ] ) {
            this.mix.groups[ this.options.group ] = new Group();
        }

        this.mix.groups[this.options.group].tracks.push(this);
    }







    // TODO: Stopped here

    if( _option === 'audio' )
        return document.createElement('audio')
    else if( _option === 'video' )
        return document.createElement('video')
    else if( _option )
        return _option
    else
        throw new Error('Can’t create track without element')









    
    // Load
    // ~~~~

    if( Detect.webAudio === true ) {

        if(!this.options.source) {
            this.mix.log('[Mixer] Creating track "'+name+'" without a source', 1);
            return;
        }

        if( this.sourceMode === 'buffer' )
            this.webAudioSource()
        else if ( this.sourceMode === 'element' )
            this.useHTML5elementSource()

    } else {

        this.mix.log('[Mixer] creating html5 element for track '+name, 1);

        // Look for pre-created audio element and failing that create one
        self.element = document.querySelector( 'audio#'+name );

        if( ! self.element ) {
            var el = document.createElement('audio');
            el.id = name;
            document.body.appendChild( el );
            self.element = document.querySelector( 'audio#'+name );
        }

        var canplay = function(){
            if( self.status.loaded ) return;

            self.status.loaded = true;
            self.status.ready = true;
            self.trigger('load', self);

            if( ! self.options.autoplay) 
                self.pause();
        }

        // canplaythrough listener
        self.element.addEventListener('canplaythrough', canplay, false);
        self.element.addEventListener('load',           canplay, false);

        // Looping
        self.element.addEventListener('ended', function(){

            if(self.options.looping){

                self.mix.log('Track '+self.name+' looping', 2);

                self.element.currentTime = 0;
                self.element.play();  

            } else {

                self.trigger('ended', self);
                self.mix.removeTrack(self.name);
            }

        }, false);

        this.createHTML5elementSource( this.options.source );
    }                
};

Track.prototype = new Eventful(); // inherit event methods




// // ██╗      ██████╗  █████╗ ██████╗ 
// // ██║     ██╔═══██╗██╔══██╗██╔══██╗
// // ██║     ██║   ██║███████║██║  ██║
// // ██║     ██║   ██║██╔══██║██║  ██║
// // ███████╗╚██████╔╝██║  ██║██████╔╝
// // ╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═════╝ 

// // Create out-of-DOM html5 <audio> element as source
// Track.prototype.createHTML5elementSource = function(){

//     var self = this;
//     if( ! self.options.source || self.dummy ) return;

//     self.mix.log('[Mixer] Track "'+this.name+'" create HTML5 element source: "'+self.options.source + self.mix.options.fileTypes[0] +'"',2);

//     self.status.ready = false

//     self.element.src = self.options.source;

//     // iOS apparently doesn’t handle .load() properly so we do this silly play(), pause() thing
//     self.element.play(); 
//     setTimeout(function(){ self.element.pause() }, 1);

//     self.source = self.element;

//     return self
// }

// // Use existing in-DOM html5 <audio> or <video> element as source
// Track.prototype.useHTML5elementSource = function(){

//     var self = this;
//     if( ! self.options.source || self.dummy ) return;

//     self.mix.log('[Mixer] Track "' + this.name + '" use HTML5 element source: "' + self.options.source + '"', 2)

//     self.element = self.options.source
//     self.options.source = self.element.src

//     self.source = self.mix.context.createMediaElementSource( self.element );

//     self.element.load()

//     self.status.loaded = true

//     self.trigger('load', self);

//     if( self.options.autoplay ) self.play();

//     return self
// }

// Track.prototype.webAudioSource = function(){

//     var self = this;
//     if( ! self.options.source || self.dummy ) return;

//     this.mix.log('[Mixer] Track "' + this.name + '" webAudio source: "' + self.options.source + '"', 2)

//     var request = new XMLHttpRequest();
//     request.open('GET', self.options.source, true);
//     request.responseType = 'arraybuffer';

//     // asynchronous callback
//     request.onload = function() {

//         self.mix.log('[Mixer] "'+self.name+'" loaded "' + self.options.source + '"',2);

//         self.options.audioData = request.response; // cache the audio data

//         self.status.loaded = true;

//         if(self.options.autoplay) self.play();

//         self.trigger('load', self);

//     };

//     request.send();
   
// }









// // ███╗   ██╗ ██████╗ ██████╗ ███████╗
// // ████╗  ██║██╔═══██╗██╔══██╗██╔════╝
// // ██╔██╗ ██║██║   ██║██║  ██║█████╗  
// // ██║╚██╗██║██║   ██║██║  ██║██╔══╝  
// // ██║ ╚████║╚██████╔╝██████╔╝███████╗
// // ╚═╝  ╚═══╝ ╚═════╝ ╚═════╝ ╚══════╝
                                   
// // AudioNode Creation
// // -> this function can be chained

// Track.prototype.addNode = function(nodeType){

//     var self = this;
//     if( self.dummy ) return

//     // if this is the first time we’re calling addNode,
//     // we should connect directly to the source
//     if(!self.nodes.lastnode) self.nodes.lastnode = self.source;

//     // if(!Detect.nodes[nodeType]) return self; // if this node type is not supported


//     // Gain ********************************************************
//     // http://www.w3.org/TR/webaudio/#GainNode 

//     if(nodeType === 'gain') {

//         if( self.mix.context.createGainNode )
//             self.nodes.gain = self.mix.context.createGainNode();
//         else
//             self.nodes.gain = self.mix.context.createGain();

//         // connect last created node to newly created node
//         self.nodes.lastnode.connect(self.nodes.gain);

//         // set newly created node to last node in the chain
//         self.nodes.lastnode = self.nodes.gain;

//     }
    
//     // Panner ********************************************************
//     // http://www.w3.org/TR/webaudio/#PannerNode

//     else if(nodeType === 'panner'){

//         if( window.webkitAudioContext ){

//             self.nodes.panner = self.mix.context.createPanner();
//             // self.nodes.panner.panningModel = webkitAudioPannerNode.EQUALPOWER;
//             // self.nodes.panner.panningModel = self.nodes.panner.EQUALPOWER;

//         } else if( window.AudioContext ){

//             self.nodes.panner = self.mix.context.createPanner();
//             // self.nodes.panner.panningModel = 'equalpower';
//             // self.nodes.panner.panningModel = 'HRTF';

//         } else {
//             return self;
//         }

//         self.nodes.lastnode.connect(self.nodes.panner);
//         self.nodes.lastnode = self.nodes.panner;

//     } 

//     // Convolver (Reverb etc) **********************************************
//     // http://www.w3.org/TR/webaudio/#ConvolverNode

//     else if(nodeType === 'convolver' ){

//         if( ! self.mix.context.createConvolver ) return self;

//         self.nodes.convolver = self.mix.context.createConvolver();

//         // TODO: implement loading impulse response for the convolver node
//         // http://chromium.googlecode.com/svn/trunk/samples/audio/impulse-responses/

//         // self.nodes.convolver.buffer = convolverBuffer;


//     }

//     // Compressor ********************************************************
//     // http://www.w3.org/TR/webaudio/#DynamicsCompressorNode

//     else if(nodeType === 'compressor' ){

//         self.nodes.compressor = self.mix.context.createDynamicsCompressor();

//         // no settings required really…

//         self.nodes.lastnode.connect(self.nodes.compressor);
//         self.nodes.lastnode = self.nodes.compressor;

//     } 

//     // Delay ********************************************************
//     // http://www.w3.org/TR/webaudio/#DelayNode

//     else if(nodeType === 'delay'){

//         if(Detect.nodes.delayNode)
//             self.nodes.delay = self.mix.context.createDelayNode();
//         else
//             self.nodes.delay = self.mix.context.createDelay();

//         self.nodes.delay.delayTime = 0;

//         self.nodes.lastnode.connect(self.nodes.delay);
//         self.nodes.lastnode = self.nodes.delay;

//     }

//     this.mix.log('+ addNode '+nodeType, 2);

//     // it’s chainable
//     return self;
// }








// // ██████╗ ██╗      █████╗ ██╗   ██╗
// // ██╔══██╗██║     ██╔══██╗╚██╗ ██╔╝
// // ██████╔╝██║     ███████║ ╚████╔╝ 
// // ██╔═══╝ ██║     ██╔══██║  ╚██╔╝  
// // ██║     ███████╗██║  ██║   ██║   
// // ╚═╝     ╚══════╝╚═╝  ╚═╝   ╚═╝   
                                 
// Track.prototype.play = function(){

//     var self = this;
//     if( self.dummy ) return

//     if( !self.status.loaded ){
//         this.mix.log('Can’t play track "' + self.name + '", not loaded', 1)
//         return;
//     }

//     if( self.status.playing === true ) return;
//     self.status.playing = true;

//     if( ! Detect.webAudio )
//         play_singleElement( self )

//     else if( Detect.webAudio && self.sourceMode === 'buffer' )
//         play_bufferSource( self )

//     else if( Detect.webAudio && self.sourceMode === 'element' )
//         play_elementSource( self )

//     self.trigger('play',self)

//     return self
// };



// function play_createNodes( self ){

//     self.mix.log('Creating nodes for track "' + self.name + '"', 2)

//     // Create Nodes
//     // ~~~~~~~~~~~~

//     self.nodes = {}

//     // 1. Create standard nodes (gain and pan)
//     self.addNode('panner').addNode('gain');

//     // 2. Create additional nodes
//     for (var i = 0; i < self.options.nodes.length; i++) {
//         self.addNode(self.options.nodes[i]);
//     }

//     // 3. Connect the last node in the chain to the destination
//     self.nodes.lastnode.connect(self.mix.context.destination);

// }

// // ********************************************************

// function play_elementSource( self ){

//     // unlike buffer mode, we only need to construct the nodes once
//     if( ! self.nodes ){

//         play_createNodes( self )

//         // we also only want one event listener
//         self.element.addEventListener('ended', function(){
//             if( !self.options.looping ) self.stop()
//             else { self.stop(); self.play() }
//             self.trigger('ended', self)
//         }, false)
//     }
        

//     // Apply Options
//     // ~~~~~~~~~~~~~~

//     self.status.ready = true;
//     self.trigger('ready', self);

//     if(self.options.looping) self.source.loop = true;
//     else                     self.source.loop = false;

//     if(self.options.muted) self.options.gain = 0;

//     self.gain(self.options.gain);
//     self.options.gainCache = self.gain();

//     self.pan( self.options.pan );

//     // Start Time

//     self.options.startTime = self.element.currentTime - self.options.cachedTime;
//     var startFrom = self.options.cachedTime || 0;

//     self.mix.log('[Mixer] Playing track "'+self.name+'" from '+startFrom+' ('+self.options.startTime+') gain '+self.gain(), 1);

//     // Play!

//     self.element.currentTime = startFrom;
//     self.element.play()

//     // self.trigger('play', self);

// }


// // ********************************************************

// function play_bufferSource( self ){

//     // Construct Audio Buffer
//     // ~~~~~~~~~~~~~~~~~~~~~~

//     // (we have to re-construct the buffer every time we begin play)

//     self.source = null
//     self.options.sourceBuffer = null    

//     // *sigh* async makes for such messy code

//     var finish = function(){

//         play_createNodes( self )

//         // Apply Options
//         // ~~~~~~~~~~~~~~

//         self.status.ready = true;
//         self.trigger('ready', self);

//         if(self.options.looping) self.source.loop = true;
//         else                     self.source.loop = false;

//         if(self.options.muted) self.options.gain = 0;

//         self.gain(self.options.gain);
//         self.options.gainCache = self.gain();

//         self.pan( self.options.pan );


//         // Play
//         // ~~~~

//         self.options.startTime = self.source.context.currentTime - self.options.cachedTime;
//         var startFrom = self.options.cachedTime || 0;

//         self.mix.log('[Mixer] Playing track "'+self.name+'" from '+startFrom+' ('+self.options.startTime+') gain '+self.gain(), 1);

//         // prefer start() but fall back to deprecated noteOn()
//         if( typeof self.source.start === 'function' ) self.source.start( 0, startFrom );
//         else                                          self.source.noteOn( startFrom );

//         // self.trigger('play', self);

//         // fake ended event
//         var timer_duration = ( self.source.buffer.duration - startFrom );

//         self.onendtimer = setTimeout(function() {
//             if(!self.options.looping) self.stop();
//             self.trigger('ended', self);
//         }, timer_duration * 1000);

//     }


//     // Create source
//     // ~~~~~~~~~~~~~

//     // Non-standard Webkit implementation
//     if( typeof self.mix.context.createGainNode === 'function' ){

//         // Web Audio buffer source
//         self.source = self.mix.context.createBufferSource();
//         self.sourceBuffer  = self.mix.context.createBuffer(self.options.audioData, true);
//         self.source.buffer = self.sourceBuffer;

//         finish()
//     }

//     // W3C standard implementation (Firefox)
//     else if( typeof self.mix.context.createGain === 'function' ){

//         self.mix.context.decodeAudioData( self.options.audioData, function onSuccess(decodedBuffer) {
//             self.mix.log('web audio file decoded', 2);

//             self.source        = self.mix.context.createBufferSource();
//             self.sourceBuffer  = decodedBuffer;
//             self.source.buffer = self.sourceBuffer;

//             finish()
//         })
//     }
// }



// // ********************************************************

// function play_singleElement( self ){

//     self.mix.log('[Mixer] Playing track "'+self.name+'" >', 1);

//     if(self.options.muted) self.options.gain = 0;

//     self.gain(self.options.gain);
//     self.options.gainCache = self.gain();

//     self.status.ready  = true;
//     self.element.play();
//     // self.trigger('play', self);
// }






// // ██████╗  █████╗ ██╗   ██╗███████╗███████╗
// // ██╔══██╗██╔══██╗██║   ██║██╔════╝██╔════╝
// // ██████╔╝███████║██║   ██║███████╗█████╗  
// // ██╔═══╝ ██╔══██║██║   ██║╚════██║██╔══╝  
// // ██║     ██║  ██║╚██████╔╝███████║███████╗
// // ╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚══════╝

// Track.prototype.pause = function( at ){

//     if( !this.status.ready || !this.status.playing || this.dummy ) return;

//     var self = this;

//     // cache time to resume from later
//     if( typeof at === 'number' ) self.options.cachedTime = at;
//     else                         self.options.cachedTime = self.currentTime(); 
    
//     self.status.playing = false;

//     if(self.onendtimer) clearTimeout(self.onendtimer);

//     if( Detect.webAudio === true ) {

//         if( self.sourceMode === 'buffer' ){

//             // prefer stop(), fallback to deprecated noteOff()
//             if(typeof self.source.stop === 'function')
//                 self.source.stop(0);
//             else if(typeof self.source.noteOff === 'function')
//                 self.source.noteOff(0);

//         } else if( self.sourceMode === 'element' ){

//             self.element.pause()
//         }

//     } else {

//         self.element.pause();
//     }

//     self.mix.log('[Mixer] Pausing track "'+self.name+'" at '+self.options.cachedTime, 2);
//     self.trigger('pause', self);
    
//     return self
// };






// // ███████╗████████╗ ██████╗ ██████╗ 
// // ██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗
// // ███████╗   ██║   ██║   ██║██████╔╝
// // ╚════██║   ██║   ██║   ██║██╔═══╝ 
// // ███████║   ██║   ╚██████╔╝██║     
// // ╚══════╝   ╚═╝    ╚═════╝ ╚═╝     

// Track.prototype.stop = function(){

//     if( !this.status.ready || !this.status.playing || this.dummy ) return;

//     var self = this;
 
//     var doIt = function(){

//         if(!self.status.playing) return;
//         self.status.playing = false;
//         self.options.cachedTime = self.options.startTime = 0;

//         if( Detect.webAudio === true ) {

//             if( self.sourceMode === 'buffer' ){

//                 // prefer stop(), fallback to deprecated noteOff()
//                 if(typeof self.source.stop === 'function')
//                     self.source.stop(0);
//                 else if(typeof self.source.noteOff === 'function')
//                     self.source.noteOff(0);

//             } else if( self.sourceMode === 'element' ){
                
//                 self.element.pause()
//                 self.element.currentTime = 0;
//             }

//         } else {

//             self.options.autoplay = false;

//             self.element.pause();
//             self.element.currentTime = 0;
//         }

//         self.mix.log('[Mixer] Stopping track "'+self.name, 2);
//         self.trigger('stop', self);

//         self.options.gain = self.options.gainCache;
//     };

//     if(Detect.tween) this.tweenGain(0, 100, function(){ doIt() } );
//     else doIt();

//     return self
    
// }








// // ██████╗  █████╗ ███╗   ██╗
// // ██╔══██╗██╔══██╗████╗  ██║
// // ██████╔╝███████║██╔██╗ ██║
// // ██╔═══╝ ██╔══██║██║╚██╗██║
// // ██║     ██║  ██║██║ ╚████║
// // ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝
                          
// // proper 3d stereo panning
// Track.prototype.pan = function(angle_deg){

//     if( ! Detect.webAudio ||  ! this.status.ready || this.dummy ) return

//     if(typeof angle_deg === 'string') {
//         if     ( angle_deg === 'front' ) angle_deg =   0;
//         else if( angle_deg === 'back'  ) angle_deg = 180;
//         else if( angle_deg === 'left'  ) angle_deg = 270;
//         else if( angle_deg === 'right' ) angle_deg =  90;
//     }
  
//     if(typeof angle_deg === 'number') {

//         this.options.pan = angle_deg % 360;

//         var angle_rad = (-angle_deg+90) * 0.017453292519943295; // * PI/180

//         var x = this.options.panX = Math.cos(angle_rad);
//         var y = this.options.panY = Math.sin(angle_rad);
//         var z = this.options.panZ = -0.5;

//         this.nodes.panner.setPosition( x, y, z );

//         this.trigger( 'pan', this.options.pan, this )

//         return self // all setters should be chainable
//     }

//     return this.options.pan
// }

// Track.prototype.tweenPan = function(angle_deg, tweenDuration, callback){

//     if( ! Detect.tween ||  ! Detect.webAudio || ! this.status.ready || this.dummy ) return;

//     if(typeof angle_deg !== 'number' || typeof tweenDuration !== 'number') return;

//     var self = this;

//     self.mix.log('[Mixer] "'+self.name+'" tweening pan2d',2)

//     if( self.tweens.pan ) self.tweens.pan.stop()

//     self.tweens.pan = new TWEEN.Tween({ currentAngle: self.options.pan })
//         .to( { currentAngle: angle_deg }, tweenDuration )
//         .easing(TWEEN.Easing.Sinusoidal.InOut)
//         .onUpdate(function(){
//             self.pan(this.currentAngle)
//         })
//         .onComplete(function(){
//             if(typeof callback === 'function') callback();
//         })
//         .start();

//     return self
// }





// //  ██████╗  █████╗ ██╗███╗   ██╗ 
// // ██╔════╝ ██╔══██╗██║████╗  ██║ 
// // ██║  ███╗███████║██║██╔██╗ ██║ 
// // ██║   ██║██╔══██║██║██║╚██╗██║ 
// // ╚██████╔╝██║  ██║██║██║ ╚████║ 
// //  ╚═════╝ ╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝ 

// // cache current gain for restoring later   
// Track.prototype.gainCache = function(setTo){
//     if( this.dummy ) return

//     if( typeof setTo === 'number' ){
//         this.options.gainCache = setTo;
//         return this
//     } else {
//         return this.options.gainCache
//     }
// }




// // gain range 0-1
// Track.prototype.gain = function(val){
//     if( this.dummy ) return

//     if(typeof val === 'number') {

//         this.options.gain = constrain(val,0,1);

//         if( this.options.muted ) this.options.gain = 0;

//         if(this.status.playing && this.nodes.gain){

//             if(!Detect.webAudio){
//                 this.element.volume = this.options.gain * this.mix.gain;
//             } else {
//                 this.nodes.gain.gain.value = this.options.gain * this.mix.gain;
//             }       
//         }

//         this.mix.log('[Mixer] "'+this.name+'" setting gain to '+this.options.gain, 2)

//         this.trigger( 'gain',this.options.gain, this );

//         return this // setters should be chainable

//     }

//     return this.options.gain;

// };




// Track.prototype.tweenGain = function(_val, _tweenDuration, _callback){
//     if( typeof _val !== 'number' || typeof _tweenDuration !== 'number' || this.dummy ) return;
//     var self = this;
//     self.mix.log('[Mixer] "'+self.name+'" tweening gain '+self.options.gain+' -> '+_val, 1)

//     if( self.tweens.gain ) self.tweens.gain.stop() // replace existing gain tween

//     self.tweens.gain = new TWEEN.Tween({ currentGain: self.options.gain })
//         .to( { currentGain: _val }, _tweenDuration )
//         .easing(TWEEN.Easing.Sinusoidal.InOut)
//         .onUpdate(function(){
//             self.gain(this.currentGain)
//         })
//         .onComplete(function(){
//             if(_callback)
//                 if(typeof _callback === 'function') 
//                     _callback();
//         })
//         .start();

//     return self
// };


// Track.prototype.mute = function( duration ){
//     if( this.dummy ) return

//     this.gainCache( this.options.gain );

//     if( duration ) {
//         this.tweenGain(0, 500, function(){
//             this.options.muted = true;
//         });    
//     } else {
//         this.gain(0);
//         this.options.muted = true;
//     }

//     return this
// };

// Track.prototype.unmute = function( duration ){
//     if( this.dummy ) return
//     this.options.muted = false;

//     if( duration ){
//         this.tweenGain(this.options.gainCache, 500);
//     } else {
//         this.gain(this.options.gainCache)
//     }

//     return this
// };



// /**************************************************************************
    
//     Setters/Getters

// **************************************************************************/


// Track.prototype.currentTime = function( setTo ){
//     if( !this.status.ready || this.dummy ) return;

//     if( typeof setTo === 'number' ){

//         if( !Detect.webAudio ){

//             this.element.currentTime = setTo;

//         } else {

//             if( this.status.playing ){
//                 this.pause( setTo );
//                 this.play();
//             } else {
//                 this.options.cachedTime = setTo;  
//             }
            
//         }

//         return this
//     }
    
//     if(!this.status.playing) return this.options.cachedTime || 0;

//     if(Detect.webAudio) return this.source.context.currentTime - this.options.startTime || 0;
//     // if(Detect.webAudio) return this.source.context.currentTime;
//     else                return this.element.currentTime || 0;
// }



// /**************************************************************************
    
//     Getters Only

// **************************************************************************/

// // Track.prototype.formattedTime = function( includeDuration){
// //     if( !this.status.ready || this.dummy ) return;

// //     if( includeDuration )
// //         return timeFormat( this.currentTime() ) + '/' + timeFormat( this.duration() );
// //     else
// //         return timeFormat( this.currentTime() );
// // }

// Track.prototype.duration = function(){
//     if( !this.status.ready || this.dummy ) return;

//     if(Detect.webAudio) return this.source.buffer.duration || 0;
//     else                return this.element.duration || 0;
// }






























    window.heliosAudioMixer = Mix;

}(window));
