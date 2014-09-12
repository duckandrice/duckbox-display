chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('public/window.html', {
    'bounds': {
      'width': 1280,
      'height': 540
    },
   'state': 'fullscreen'
  })
})