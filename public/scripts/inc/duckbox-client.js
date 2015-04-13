define(function() {
  var DuckboxClient

  DuckboxClient = function(baseURL, identifier) {
    var requests = {}
    
    this.getCurrentTrack = function(oncomplete) {
      var url = baseURL + 'playing/' + identifier
      var req = new XMLHttpRequest()
      
      if (requests.currentTrack) {
        requests.currentTrack.abort()
      }
  
      req.open('get', url, true)
      req.responseType = 'json'
      req.onload = function() {
        requests.currentTrack = null

        var status = req.status

        if (status >= 200 && status < 300) {
          var response = req.response
          oncomplete(response)
        }
        else {
          oncomplete(null)
        }
      }
      req.onreadystatechange = function(e) {
        if (req.readyState === 4) {  
          if (req.status !== 200) {  
            oncomplete(null)
          }  
        }
      }
      
      requests.currentTrack = req
      req.send()
    }
    
    this.destroy = function() {
      for (var key in requests) {
        var req = requests[key]
        req.abort()
      }
      
      requests = null
    }
  }

  return DuckboxClient
})