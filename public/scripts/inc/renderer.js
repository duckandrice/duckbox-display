define([
  'inc/impulse',
  'inc/looping-impulse'
], function(Impulse, LoopingImpulse) {
  /**
   * Manages all impulses on the tiles. All active impulses will be rendered each frame. Once completed, an impulse is removed from the list so it can be removed from memory
   */
  var Renderer

  Renderer = function(groups) {
    var impulses = []
      , strengths = []
      , render
      , running

    this.start = function() {
      running = true
      window.requestAnimationFrame(render)
    }

    this.stop = function() {
      running = false
    }

    this.update = function(s) {
      strengths = s
    }

    this.addImpulse = function(impulse, index) {
      impulses.push({ impulse: impulse, groupIndex: index })
    }

    this.removeImpulsesOfGroup = function(index) {
      for (var i = impulses.length - 1; i >= 0; i--) {
        var value = impulses[i]
        if (value.groupIndex = index) {
          value.impulse.cancel() // will be removed during the next render
        }
      }
    }

    render = function() {
      for (var i = impulses.length - 1; i >= 0; i--) {
        var value = impulses[i]
        var impulse = value.impulse
        var group = groups[value.groupIndex]
        
        impulse.strength = strengths[value.groupIndex]
        impulse.render(group)

        if (impulse.completed) {
          impulses.splice(i, 1)
        }
      }

      if (running) {
        window.requestAnimationFrame(render)
      }
    }
  }

  return Renderer
})