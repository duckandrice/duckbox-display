require([
  "inc/audio-listener",
  "inc/duckbox-client",
  "inc/impulse",
  "inc/looping-impulse",
  "inc/renderer",
  "inc/settings"
  ], function(AudioListener, DuckboxClient, Impulse, LoopingImpulse, Renderer) {
 
    var audioListener = new AudioListener()
      , apiClient
      , renderer
      , groupRanges
      , lastDate
      , refreshTrackInterval
      , refreshTimeInterval
      , info = document.getElementById('info')
      , track = document.getElementById('track')
    
    
    /**
      Access the microphone. If a source identifier is specified it will try to access 
      the corresponding device. Otherwise it will just get the system default.
     */
    function requestAudio(sourceIdentifier) {
      navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
      console.log('Requesting access to audio device:', sourceIdentifier)
      
      if (navigator.getUserMedia) {
        audioListener.reset()
        
        var options = { 
          audio: (sourceIdentifier ? { optional: [{sourceId: sourceIdentifier}] } : true),
          video: false
        }
  
        navigator.getUserMedia(options, audioListener.init.bind(audioListener),
          function(error) {
            console.log('Something went wrong. (error code ' + error.code + ')')
            return
          }
        );
      }
      else {
        console.log('Sorry, the browser you are using doesn\'t support getUserMedia')
        return
      }
    }

    /**
      Initialises the API client and triggers the continious update of the track info
     */
    function initDuckboxAPI(baseURL, identifier) {
      if (apiClient) {
        apiClient.destroy()
      }
      
      apiClient = new DuckboxClient(baseURL, identifier)
      apiClient.getCurrentTrack(updateTrackInfo)
      
      clearInterval(refreshTrackInterval)
      refreshTrackInterval = setInterval(function() { apiClient.getCurrentTrack(updateTrackInfo) }, 3 * 1000)
    }
    
    /**
      Load SVG pattern and add it to the display hierarchy
     */
    function loadPattern() {
      var request = new XMLHttpRequest()
    
      request.onload = function() {
        var container = document.getElementById('background')
        container.innerHTML = this.responseText
        
        var groups = [
          container.querySelector('g#BirdSmall').getElementsByTagName('polygon'),
          container.querySelector('g#BirdMedium').getElementsByTagName('polygon'),
          container.querySelector('g#BirdLarge').getElementsByTagName('polygon'),
        ]

        groups = groups.concat(groupsForTimeElement(container.querySelector('g#Time')))

        groupRanges = {
          sound: {
            start: 0, 
            end: 2
          },
          time: {
            start: 3, 
            end: groups.length - 1
          }
        }
        
        renderer = window.renderer = new Renderer(groups)
        renderer.start()

        // Add initial impulses. We use different types for the sound reactive and the time shapes.
        for (var i = groups.length - 1; i >= 0; i--) {
          var impulse = (i <= groupRanges.sound.end) ? new LoopingImpulse() : new Impulse()
          renderer.addImpulse(impulse, i)
        }

        refreshTimeInterval = setInterval(updateTime, 1000)
      }
      
      request.open('GET', 'img/pattern.svg', true)
      request.send()
    }

    /**
      Returns array of groups for each digit. The SVG is organised as a tree with nodes for 
      each character in the HH:MM time format. Hours and minutes have digits with ranges of 
      0-2 (ten-digit), 0-9 (one-digit) and 0-5 (ten-digit), 0-9 (one-digit). The separator
      ':' has its own group. As a consequence the array has the following distribution:

        0-2     hours (ten-digit)
        3-12    hours (one-digit)
        13      separator ':'
        14-19   minutes (ten-digit)
        20-29   minutes (one-digit)
    */
    function groupsForTimeElement(element) {
      var keys = ['g#HH', 'g#H', 'g#Separator', 'g#MM', 'g#M']
      var groups = []

      for (var i = 0; i < keys.length; i++) {
        var digits = element.querySelector(keys[i]).getElementsByTagName('g')
        for (var j = 0; j < digits.length; j++) {
          groups.push(digits[j].getElementsByTagName('polygon'))
        }
      }

      return groups
    }

    /**
      Triggers an impulse on all time shapes every minute.
     */
    function updateTime() {
      var date = new Date()

      if (lastDate && date.getMinutes() == lastDate.getMinutes()) {
        return
      }

      // see groupsForTimeElement(element) for details about the offset value
      var components = [
        { value: Math.floor(date.getHours() / 10), offset: 0 },
        { value: date.getHours() % 10, offset: 3 },
        { value: ':', offset: 13 },
        { value: Math.floor(date.getMinutes() / 10), offset: 14 },
        { value: date.getMinutes() % 10, offset: 20 }
      ]

      for (var i = components.length - 1; i >= 0; i--) {
        var value = (isNaN(components[i].value) ? 0 : components[i].value) + components[i].offset
        var index = value + groupRanges.time.start
        renderer.addImpulse(new Impulse(), index)
      }

      lastDate = date
    }
    
    
    function updateTrackInfo(value) {
      if (value) {
        var s = value.title || 'Untitled'
        s += ' <em>by</em> ' + (value.artist || 'Unknown Artist')
        
        track.innerHTML = s
        info.className = ''
      }
      else {
        info.className = 'hidden'
      }
    }
    

    // Event listeners

    audioListener.onchange = function(values) {
      var date = Date.now()

      // Gate the incoming frequencies to ignore all empty values (values of less than 10)
      var activeRange = { start:0, end: values.length - 1 }

      for (var i = 0; i < values.length; i++) {
        var j = values.length - i - 1

        if (i >= j - 1) {
          break
        }

        if (values[i] / 100 < 0.1 && activeRange.start >= (i - 1)) {
          activeRange.start++
        }

        if (values[j] / 100 < 0.1 && activeRange.end <= (j + 1)) {
          activeRange.end--
        }
      }

      // Calculate the average strenghts of different frequency ranges. Ranges are roughly a third of the active range, however they do overlap slightly to make it more natural.
      var strengths = []
      var length = Math.floor((activeRange.end - activeRange.start) / 3)
      var overlap = Math.floor(length / 4)
      var ranges = [
        { start: activeRange.start, end: activeRange.start + length + overlap },
        { start: activeRange.start + length - overlap, end: activeRange.start + length * 2 + overlap },
        { start: activeRange.start + length * 2 - overlap, end: activeRange.end }
      ]

      for (var i = 0; i < ranges.length; i++) {
        var r = ranges[i]
        var rangeValues = values.subarray(r.start, r.end + 1)
        var avg = averageValue(rangeValues)

        var amp = document.querySelector('#bar-' + (i + 1) + ' .amplitude')
        amp.style.height = Math.min(avg, 100) + '%'
        
        strengths.push(Math.min(1.0, avg / 100))
      }

      renderer.update(strengths)
    }

    chrome.storage.sync.get(['audioInput', 'baseURL', 'identifier'], function(items) {
      requestAudio(items.audioInput)
      initDuckboxAPI(items.baseURL, items.identifier)
    })

    chrome.storage.onChanged.addListener(function(changes, areaName) {
      if (changes.audioInput) {
        chrome.storage.sync.get('audioInput', function(items) {
          requestAudio(items.audioInput)
        })
      }
      
      if (changes.identifier || changes.baseURL) {
        chrome.storage.sync.get(['baseURL', 'identifier'], function(items) {
          initDuckboxAPI(items.baseURL, items.identifier)
        })
      }
    })
    

    // Main initialisation

    loadPattern()
    
    
    // Helpers
    
    function averageValue(values) {
      var sum = 0
      for (var i = 0; i < values.length; i++) {
        sum += values[i]
      }
      return sum / values.length
    }

})();