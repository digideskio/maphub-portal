/**
 * Map represents a map. Go figure. Valid parameters are:
 * 	id: A required integer indicating the ID of the map.
 * 	deleteHiddenTiles: A boolean to indicate if the map should delete tiles
 * 		that are not visible in the viewport. Defaults to false.
 * 	tileSize: The tile size (as google.maps.Size). Defaults to 256x256.
 * 
 * @param parameters
 *           An Object containing key-value pairs of parameters.
 */
maphub.Map = function(parameters) {
	if (parameters) {
		this.id = parameters.id;
		console.log('Map ID: '+this.id);
		
		if (typeof parameters['deleteHiddenTiles'] == 'undefined') {
			this.deleteHiddenTiles = false;
		} else {
			this.deleteHiddenTiles = parameters.deleteHiddenTiles;
		}

		if (typeof parameters['tileSize'] == 'undefined') {
			this.tileSize = new google.maps.Size(256,256);
		} else {
			this.tileSize = parameters['tileSize'];
		}
	}
	
	/*
	 * This is so we can reference "this" in callbacks. JavaScript is awesome!
	 */
	document.map = this;
	
	/*
	 * This indicates whether or not we show a Google viewer or a Zoomify
	 * viewer. We default to a Zoomify viewer in case the map does not have
	 * enough control points stored.
	 */
	this.showGoogleMap = false;

	/*
	 * Retrieve the map metadata from the server.
	 */
	var metadata = {};
	$.ajax({
		async: false,
		cache: false,
		dataType: "json",
		success: function(data, status, xhr) {
			metadata = data;
		},
		url: "/maps/"+this.id+".json"
	});
	this.metadata = metadata;
//		console.log('metadata:');
//		console.log(metadata);
	
	/*
	 * The map's bounds. This should be changed to be retrieved from the map
	 * metadata, once it exists there...
	 */
//		this.metadata.bounds = new google.maps.LatLngBounds(new google.maps.LatLng(41.8128911451, 8.73896538004), new google.maps.LatLng(51.4235907642, 27.8177687755));

	this.controlPoints = [];
	if (this.metadata && this.metadata['controlpoints'] && this.metadata['controlpoints'].length > 2) {
		/*
		 * We have enough control points to show the Google map, retrieve them
		 * from the server and indicate that we can show the Google map.
		 */
		this.showGoogleMap = true;
		var controlPoints = [];
		$.ajax({
			async: false,
			cache: false,
			dataType: "xml",
			success: function(data, status, xhr) {
				$(data).find("control-point").each(function() {
					var lat = $(this).find("lat").text();
					var lng = $(this).find("lng").text();
					var x = $(this).find("x").text();
					var y = $(this).find("y").text();
					var cp = new maphub.ControlPoint(x, y, lat, lng);
					controlPoints.push(cp);
				});
			},
			url: "/maps/"+this.id+"/control_points.xml"
		});
		this.controlPoints = controlPoints;
	}
//		console.log('control points:');
//		console.log(this.controlPoints);
};



/*
 * Render the map visualization to the specified container element.
 */
maphub.Map.prototype.render = function(container) {
	if (this.showGoogleMap) {
		/*
		 * Change the map element's ID to what Google requires. Even though you
		 * can pass in an element to the Google map constructor, it seems that
		 * the "map_canvas" ID is hard-coded in there somewhere...
		 */
		$(container).attr('id', 'map_canvas');
		
		/*
		 * We have enough control points to show the Google Map. Create the
		 * Google map.
		 */
		var mapBounds = new google.maps.LatLngBounds(
			new google.maps.LatLng(this.metadata.sw_lat, this.metadata.sw_lng),
			new google.maps.LatLng(this.metadata.ne_lat, this.metadata.ne_lng)
		);

		var mapOptions = {
			center: mapBounds.getCenter(),
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			streetViewControl: false,
			zoom: 5
		};
		this.googleMap = new google.maps.Map(container, mapOptions);
		
		/*
		 * TODO: Only if logged in?
		 */
//		google.maps.event.addListener(this.googleMap, 'click', function (event) { console.log(event.latLng); });
		this.drawingManager = new google.maps.drawing.DrawingManager();
		this.drawingManager.setMap(this.googleMap);
		google.maps.event.addListener(this.drawingManager, 'overlaycomplete', function (event) {
			/*
			 * TODO: Convert this so the Google parsing results in an x,y Array and
			 * "type tag" (e.g. POLYLINE), then iterate over the Array to assemble
			 * the wkt_data String. Also, figure out when/where to convert Google
			 * lat,lng into MapHub x,y.
			 */
			var wkt_data = "";
			var o = event.overlay;
//			console.log('overlay:');console.log(o);
			if (event.type == google.maps.drawing.OverlayType.MARKER) {
				var ll = o.getPosition();
				wkt_data = "POINT("+ll.lat()+" "+ll.lng()+")";
			} else if (event.type == google.maps.drawing.OverlayType.POLYGON) {
				wkt_data = "POLYGON(";
				wkt_data = wkt_data+maphub.stringifyPath(o.getPath());
				wkt_data = wkt_data+")";
			} else if (event.type == google.maps.drawing.OverlayType.POLYLINE) {
				wkt_data = "LINESTRING(";
				wkt_data = wkt_data+maphub.stringifyPath(o.getPath());
				wkt_data = wkt_data+")"
			} else if (event.type == google.maps.drawing.OverlayType.RECTANGLE) {
				var bounds = o.getBounds();
				var neLL = bounds.getNorthEast();
				var swLL = bounds.getSouthWest();
				var nwLL = new google.maps.LatLng(neLL.lat(), swLL.lng());
				var seLL = new google.maps.LatLng(swLL.lat(), neLL.lng());
				wkt_data = "POLYGON("+nwLL.lat()+" "+nwLL.lng()+","+neLL.lat()+" "+neLL.lng()+","+seLL.lat()+" "+seLL.lng()+","+swLL.lat()+" "+swLL.lng()+")";
			} else if (event.type == google.maps.drawing.OverlayType.CIRCLE) {
				wkt_data = "CIRCLE("+o.getCenter().lat()+" "+o.getCenter().lng()+" "+o.getRadius()+")";
			}
			console.log('wkt_data: '+wkt_data);
			var content = prompt("Annotation:");
			var params = {
				body: content,
				wkt_data: wkt_data
			};
			$.ajax({
				contentType: 'application/json',
				data: JSON.stringify({"annotation": params, "dbpedia_uri": [], "label": [], map_id: document.map.id}),
				type: 'post',
				url: '/maps/'+document.map.id+'/annotations'
			});
		});
		

		/*
		 * Create our alpha-enabled overlay.
		 */		
		var overlay = new maphub.AlphaOverlay({
			map: this,
			tileSize: this.tileSize
		});
//			console.log("Overlay: "+overlay);

		/*
		 * Add our overlay to the map.
		 */
		this.googleMap.overlayMapTypes.push(overlay);
	} else {
		console.log('Showing OpenLayers map.');
		/*
		 * We can't show the Google map, show the Zoomify map instead. First,
		 * change the element's ID to what Zoomify expects. This is actually a
		 * parameter for Zoomify, but AnnotationView has it hard-coded...
		 */
		$(container).attr('id', 'viewer');
		
		console.log(this.metadata.width+", "+this.metadata.height+", "+this.metadata.tileset_uri+", "+this.id);
		window.annotation_view = new MapHub.AnnotationView(
			this.metadata.width,
			this.metadata.height,
			this.metadata.tileset_uri+'/',
			'/maps/'+this.id+'/annotations',
			'/maps/'+this.id+'/control_points',
			true
		);
	}
};

maphub.Map.toString = function() {
	return 'Map<id='+this.id+'>';
}
