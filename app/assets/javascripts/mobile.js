//= require mobile/maphub/maphub.js
//= require mobile/ExtDraggableObject.js
//= require mobile/maphub/TileOverlay.js
//= require mobile/maphub/AlphaOverlay.js
//= require mobile/maphub/Map.js
//= require mobile/maphub/ControlPoint.js
$(document).ready(function() {
	google.load('maps', '3', {
		callback: function() {
			//var mapID = getQueryString()['mapid'];
			var mapID = location.pathname.match(/\/maps\/([0-9]+)/)[1];
			var map = new maphub.Map({
				deleteHiddenTiles: true,
				id: mapID
			});
			map.render(document.getElementById('map'));
		},
		other_params: "sensor=true&libraries=drawing"
	});
});
