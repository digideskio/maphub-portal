# Databaseification

To make this work straight from the database, I think this is what would need to be done:

1. In public/javascripts/maphub/Map.js, line 48, set the metadata parameter to the data returned from a /maps/<id>.json request.
2. In public/javascripts/maphub/Map.js, line 68, set the controlPoints parameter to an Array of maphub.ControlPoints objects corresponding to the control points for the specified map.
3. In public/javascripts/maphub/Map.js, line 148, generate URLs and set true/false to whether the user is logged in or not.
4. In public/javascripts/maphub/maphub.js, line 34, set the mapID parameter.

# Design

The Google Maps overlay is implemented as one primary JavaScript "class": maphub.Map. This Map class handles retrieving the control points and metadata for a specified map ID and handles rendering the map to a specified container element. One should only need to create an instance of the Map class and call its render method.

Internally, the Map class creates an instance of a Google Maps map, to which it applies an instance of the maphub.AlphaOverlay class. The AlphaOverlay class "extends" the maphub.TileOverlay class, adding a transparency slider to allow the user to fade the overlay in and out.

All parameters are passed to class constructors as JavaScript objects acting as key-value pair dictionaries, e.g.:

new maphub.Map({
	"key1": "value1",
	"key2": "value2"
});

Map

The Map class is the primary point of interaction. It fetches the map data and sets up the map visualization.

TileOverlay

The TileOverlay class does all of the real work, e.g. loading map tiles. The TileOverlay class is also somewhat mobile-device-optimized in two ways:

1. It keeps track of which tiles are being displayed so if it needs to display a tile that is already displayed (such as when the map is dragged around), it loads the information from an Array instead of re-fetching it from the server.
2. If the deleteHiddenTiles Map parameter is set to true, it deletes tile information for tiles that are not displayed, lowering the memory footprint of the system.

# Usage

Create a maphub.Map object, give it a map ID, call render.

# RequireJS

In order to make loading the many class-based JavaScript files easier, the script uses the RequireJS dependency framework to load files in the correct order. RequireJS allows a developer to define modules and module dependencies and handles loading those files. The first encounter with RequireJS is this tag in the main HTML file:

<script data-main="/javascripts/maphub/maphub" type="text/javascript" src="/javascripts/require.js"></script>

This line serves two purposes:

1. It loads the RequireJS library.
2. It defines a "data-main" attribute, which tells RequireJS from where to start the initial loading process.

The data-main attribute defines the "root" of the JavaScript tree in which all of the JavaScript files can be found as well as defining the initial JavaScript file to process. In this case, the root is /javascripts/maphub and the maphub.js file in that directory is the initial file to be processed.

The maphub.js file contains a line that requires the "Map" module and a function that is called after the required module is finished loading:

require(['Map'], function() {
	// ...
});

This tells RequireJS to load the <root>/Map.js file. The Map.js file contains this line:

define(['AlphaOverlay'], function() {
	// ...
});

This line performs two functions:

1. The define() call defines, in RequireJS, a module named after the file in which it exists (i.e., "Map").
2. Defines an Array of dependencies for this module. In this case, the AlphaOverlay module is the only dependency of the Map module. This makes RequireJS load the AlphaOverlay.js file before processing the defined callback function.

Currently, all of the "class code" (or module code) is written within these callback functions, ensuring that all the dependencies of a given class are loaded before that class's code is executed.
