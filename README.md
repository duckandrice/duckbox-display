Duckbox Display
===============

A Chrome App featuring a sound reactive animation based on the picture of three ducks often found in pubs. Besides the animation it also displays current track information as well as the time in regular intervals. The data for the track information comes from the Duckbox API.


# How to Install

You can install the Duckbox Display directly [from the Chrome Web Store](https://chrome.google.com/webstore/detail/duckbox-display/knebcgbbflnhakhhlpbmlkbjgcbfipgh). If you want to run the app from the repository follow the steps on the [Google developer documentation](https://developer.chrome.com/apps/first_app)


## Settings

A click anywhere in the app reveals the settings interface for:

* Audio source to be used for the sound reactive animation
* API base URL for the Duckbox API, e.g. http://duckbox-api.herokuapp.com/ (must end with a trailing slash)
* Duckbox host identifier, e.g. 1ab (find out more on the Duckbox documentation)


# Create you own Visualisation

Duckbox Display is using the Web Audio API. The `AudioListener` defined in `public/scripts/inc/audio-listener.js` automatically analyses the incoming audio signal and provides FFT data to its `onchange` callback. For more information on the data please see the [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API).