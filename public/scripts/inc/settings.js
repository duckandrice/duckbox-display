define(function() {
  var audioInput = document.getElementById('audioInput')
    , baseURL = document.getElementById('baseURL')
    , identifier = document.getElementById('identifier')
    , content = document.getElementById('content')
    , display = document.getElementById('display')


  function detectedSources(sourceInfos) {
    chrome.storage.sync.get('audioInput', function(items) {
      var selection = items['audioInput']

      for (var i = 0; i != sourceInfos.length; ++i) {
        var sourceInfo = sourceInfos[i]
        var option = document.createElement('option')

        option.value = sourceInfo.id

        if (selection == sourceInfo.id) {
          option.selected = 'selected'
        }

        if (sourceInfo.kind === 'audio') {
          option.text = sourceInfo.label || 'Microphone ' + (audioInput.length)
          audioInput.appendChild(option)
        }
      }
    })
  }

  function saveHostInfo() {
    chrome.storage.sync.set({
      'baseURL': baseURL.value,
      'identifier': identifier.value
    }, function(items) {
      console.log('Saved host info')
    })
  }

  function saveAudioInput() {
    var selection = audioInput.options[audioInput.selectedIndex].value;

    chrome.storage.sync.set({'audioInput': selection}, function(items) {
      console.log('Saved audio input selection')
    })
  }

  chrome.storage.sync.get(['identifier', 'baseURL'], function(items) {
    baseURL.value = items['baseURL'] ? items['baseURL'] : ""
    identifier.value = items['identifier'] ? items['identifier'] : ""
  })

  navigator.mediaDevices.enumerateDevices().then(detectedSources)

  display.onclick = function() {
	  content.className = (content.className == 'show-settings') ? '' : 'show-settings'
  }

  baseURL.onchange = identifier.onchange = function() {
    saveHostInfo()
  }

  baseURL.onblur = identifier.onblur = function() {
    saveHostInfo()
  }

  audioInput.onchange = function() {
    saveAudioInput()
  }

})
