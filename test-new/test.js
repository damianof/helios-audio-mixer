describe('Audio Mixer',function(){

	window.mixer = new heliosAudioMixer()
	// var frameRunner = new heliosFrameRunner()
	// frameRunner.add('tween','everyFrame',)

	describe('Setup',function(){

		it('constructor',function(){
			expect( mixer ).to.exist
		})

		it('feature detection',function(){
			expect( mixer.detect ).to.exist
		})

	})


	describe('Creating Tracks',function(){

		it('dummy track',function(){
			var track = mixer.createTrack( 'test', false )
			expect( track.type ).to.equal('dummy')
		})

		it('html5 track',function(){
			var track = mixer.createTrack( 'test', 'html5', {}  )
			expect( track.type ).to.equal('html5')
		})

		it('web audio buffer source track',function(){
			var track = mixer.createTrack( 'test', 'elementSrc', {} )
			expect( track.type ).to.equal('elementSrc')
		})

		it('web audio element source track',function(){
			var track = mixer.createTrack( 'test', 'bufferSrc' )
			expect( track.type ).to.equal('bufferSrc')
		})

		afterEach(function(){
			mixer.removeTrack('test')
		})

	})

	describe('Tracks should meet spec', function() {
		
		it('html5 track should have element property', function(done) {
			
			var track = mixer.createTrack('test', 'html5', {
				element: 'audio',
				src: '../_media/drone'
			})

			track.one('canplaythrough', function(event) {

				done()
			});
		});

		afterEach(function(){
			mixer.removeTrack('test')
		})
	});
	
	// describe('Fail Gracefully',function(){
		
	// 	it('shouldn’t allow a track with no name',function(){
	// 		expect( mixer.createTrack.bind() ).to.throw( Error )
	// 	})

	// 	it('shouldn’t allow duplicate tracks',function(){
	// 		mixer.createTrack('test')
	// 		expect( mixer.createTrack.bind('test') ).to.throw( Error )
	// 	})

	// 	after(function(){
	// 		mixer.removeTrack('test')
	// 	})
	// })

	// describe('Track Management', function(){

	// 	it('should create a track',function(){
	// 		var track = mixer.createTrack('test')
	// 		expect( track ).to.exist
	// 	})

	// 	it('should create a track with a valid source',function(){
	// 		console.log('hi')
	// 		var track = mixer.createTrack( 'test', {source: 'audio/Drone_1_norm'} )
	// 	})

	// 	// it('should be playing',function(){
	// 	// 	mixer.
	// 	// })

	// 	afterEach(function(){
	// 		mixer.removeTrack('test')
	// 	})



	// })

	// describe('TWEEN.js',function(){

	// })

})