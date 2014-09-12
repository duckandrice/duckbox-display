define(function() {
  /*
   * Analyses the audio input and passes the processed values to the onchange handler
   */
  var AudioListener

  AudioListener = function() {
    var ctx = new AudioContext() || new webkitAudioContext()
      , analyser = ctx.createAnalyser()
      , processor = null
      , microphone = null
      , onchange = function(value) {}

    this.init = function(stream) {
      microphone = ctx.createMediaStreamSource(stream)
      processor = ctx.createScriptProcessor(2048, 1, 1)
      
      analyser.smoothingTimeConstant = 0.3
      analyser.fftSize = 1024
      
      microphone.connect(analyser)
      analyser.connect(processor)
      processor.connect(ctx.destination)
      
      processor.onaudioprocess = function() {
        var array =  new Uint8Array(analyser.frequencyBinCount)
        analyser.getByteFrequencyData(array)
        
        this.onchange(array)
      }.bind(this)
    }

    this.reset = function() {
      if (processor) { processor.disconnect() }
      if (microphone) { microphone.disconnect() }

      analyser.disconnect()

      processor = null
      microphone = null
    }
  }

  return AudioListener
})