define(function() {
  /**
   * Shows and fades out tiles over time. Impulse keeps track of its progress which increases everytime render(tiles) is called
   */
  var LoopingImpulse

  LoopingImpulse = function() {
    var currentIndexes = []

    this.completed = false
    this.strength = 1.0

    this.render = function(tiles) {
      if (tiles.length == 0 || this.completed == true) {
        this.completed = true
        return
      }
      
      var lastIndex = currentIndexes.length > 0 ? currentIndexes[currentIndexes.length - 1] : -1
      var steps = 1 + Math.floor(this.strength / (1/2))
      var processed = 0

      while (processed < steps) {
        var i = (lastIndex + ++processed) % tiles.length
        var t = tiles[i]

        t.setAttribute('style', 'opacity: ' + this.strength)
        t.setAttribute('class', '')
        t.impulse = this

        currentIndexes.push(i)
      }

      for (var i = currentIndexes.length - processed - 1; i >= 0; i--) {
        var t = tiles[currentIndexes[i]]

        if (t.impulse != this) {
          continue
        }

        t.setAttribute('style', '')
        t.setAttribute('class', 'inactive animated')

      }

      currentIndexes = currentIndexes.splice(currentIndexes.length - processed)

    }.bind(this)
  }

  this.cancel = function(tiles) {
    var lastIndex = currentIndexes.length > 0 ? currentIndexes[currentIndexes.length - 1] : -1

    for (var i = lastIndex; i >= 0; i--) {
      var t = tiles[i]

      if (t.impulse != this) {
        return
      }

      t.setAttribute('class', 'inactive animated')
      t.setAttribute('style', '')
    }

    currentIndexes = []
    this.completed = true
  }.bind(this)

  return LoopingImpulse
})