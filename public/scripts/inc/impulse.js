define(function() {
  /**
   * Shows and fades out tiles over time. Impulse keeps track of its progress which increases everytime render(tiles) is called
   */
  var Impulse

  Impulse = function() {
    var currentTileIndex = -1

    this.completed = false
    this.strength = 1.0

    this.render = function(tiles) {
      if (tiles.length == 0 || this.completed == true) {
        this.completed = true
        return
      }
      
      if (currentTileIndex == (tiles.length -1)) {
        tiles[currentTileIndex].setAttribute('style', '')
        tiles[currentTileIndex].setAttribute('class', 'inactive animated')
        this.completed = true
        return
      }

      currentTileIndex = currentTileIndex < tiles.length - 1 ? currentTileIndex + 1 : currentTileIndex
      tiles[currentTileIndex].impulse = this
      
      for (var i = currentTileIndex; i >= 0; i--) {
        var t = tiles[i]

        if (t.impulse != this) {
          return
        }

        if (i == currentTileIndex) {
          t.setAttribute('class', '')
          t.setAttribute('style', 'opacity: ' + this.strength)
        }
        else {
          t.setAttribute('class', 'inactive animated')
          t.setAttribute('style', '')
        }
      }
    }.bind(this)

    this.cancel = function(tiles) {
      for (var i = currentTileIndex; i >= 0; i--) {
        var t = tiles[i]

        if (t.impulse != this) {
          return
        }

        t.setAttribute('class', 'inactive animated')
        t.setAttribute('style', '')
      }

      this.completed = true
    }.bind(this)
  }

  return Impulse
})