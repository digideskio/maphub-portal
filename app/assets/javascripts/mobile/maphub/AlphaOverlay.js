/**
 * A TileOverlay that includes support for changing the transparency/opacity
 * of the overlay.
 */
maphub.AlphaOverlay = function(parameters) {
	if (parameters) {
		/*
		 * Call super().
		 */
		maphub.TileOverlay.prototype.constructor.apply(this, [parameters]);
	}
	
	/*
	 * The overlay's opacity, as a percentage.
	 */
	this.opacity = maphub.AlphaOverlay.InitialOpacity;

	/*
	 * Create the control slider on this overlay's map.
	 */
	this.createOpacityControl(this.map.googleMap, this.opacity);
};

/*
 * Inherit from TileOverlay.
 */
maphub.AlphaOverlay.prototype = new maphub.TileOverlay();
maphub.AlphaOverlay.constructor = maphub.AlphaOverlay;

/*
 * Set up some static "constants".
 */
maphub.AlphaOverlay.SliderWidth = 57;
maphub.AlphaOverlay.InitialOpacity = 75;
maphub.AlphaOverlay.SliderImageURL = '/images/opacity-slider.png';

maphub.AlphaOverlay.prototype.getTile = function(point, zoomLevel, container) {
	/*
	 * Call super().
	 */
	var tile = maphub.TileOverlay.prototype.getTile.apply(this, [point, zoomLevel, container]);
	this.setObjectOpacity(tile, this.opacity);
	return tile;
}

maphub.AlphaOverlay.prototype.createOpacityControl = function(map, opacity) {
	// Create main div to hold the control.
	var opacityDiv = document.createElement('DIV');
	opacityDiv.setAttribute("style", "margin:5px;overflow-x:hidden;overflow-y:hidden;background:url(" + maphub.AlphaOverlay.SliderImageURL + ") no-repeat;width:71px;height:21px;cursor:pointer;");

	// Create knob
	var opacityKnobDiv = document.createElement('DIV');
	opacityKnobDiv.setAttribute("style", "padding:0;margin:0;overflow-x:hidden;overflow-y:hidden;background:url(" + maphub.AlphaOverlay.SliderImageURL + ") no-repeat -71px 0;width:14px;height:21px;");
	opacityDiv.appendChild(opacityKnobDiv);

	var opacityCtrlKnob = new ExtDraggableObject(opacityKnobDiv, {
		restrictY: true,
		container: opacityDiv
	});

	/*
	 * Create a variable pointing to this overlay so we can reference it from the event
	 * handlers (in which "this" is set to the object triggering the event).
	 */
	var self = this;
	
	google.maps.event.addListener(opacityCtrlKnob, "dragend", function () {
		self.setOpacity(opacityCtrlKnob.valueX());
	});

	google.maps.event.addDomListener(opacityDiv, "click", function (e) {
		var left = self.findPosLeft(this);
		var x = e.pageX - left - 5; // - 5 as we're using a margin of 5px on the div
		opacityCtrlKnob.setValueX(x);
		self.setOpacity(x);
	});

	this.map.googleMap.controls[google.maps.ControlPosition.TOP_RIGHT].push(opacityDiv);

	// Set initial value
	var initialValue = maphub.AlphaOverlay.SliderWidth / (100 / this.opacity);
	opacityCtrlKnob.setValueX(initialValue);
	this.setOpacity(initialValue);
}

maphub.AlphaOverlay.prototype.setOpacity = function(pixelX) {
//		console.log('maphub.AlphaOverlay.prototype.setOpacity');
	// Range = 0 to maphub.AlphaOverlay.SliderWidth
	/*
	 * Calculate and record the new opacity (as a percentage).
	 */
	var value = (100 / maphub.AlphaOverlay.SliderWidth) * pixelX;
	if (value < 0) value = 0;
	this.opacity = value;
//		console.log('New opacity: '+value);
	
	/*
	 * Set the opacity of the actual tiles.
	 */
//		console.log('Tiles:');
//		console.log(maphub.TileOverlay.prototype.getTiles.apply(this));
	for (var tileID in this.tiles) {
		console.log('Changing tile '+tileID);
		this.setObjectOpacity(this.tiles[tileID], value);
	}
}

/**
 * Set the CSS opacity of the specified object to the specified value. This is implemented as
 * a separate function because it is used both in the overlay's setOpacity function and when
 * the overlay creates new tiles.
 * 
 * @param obj The object for which the CSS opacity value will be set.
 * @param value The opacity value (as a percentage) to set. E.g.: 50 for 50% opacity.
 */
maphub.AlphaOverlay.prototype.setObjectOpacity = function(obj, opacity) {
	if (typeof (obj.style.filter) == 'string') { obj.style.filter = 'alpha(opacity:' + opacity + ')'; }
	if (typeof (obj.style.KHTMLOpacity) == 'string') { obj.style.KHTMLOpacity = opacity / 100; }
	if (typeof (obj.style.MozOpacity) == 'string') { obj.style.MozOpacity = opacity / 100; }
	if (typeof (obj.style.opacity) == 'string') { obj.style.opacity = opacity / 100; }
}

maphub.AlphaOverlay.prototype.findPosLeft = function(obj) {
	var curleft = 0;
	if (obj.offsetParent) {
		do {
			curleft += obj.offsetLeft;
		} while (obj = obj.offsetParent);
		return curleft;
	}
	return undefined;
}

maphub.AlphaOverlay.prototype.toString = function() {
	return 'AlphaOverlay<map='+this.map.id+', opacity='+this.opacity+', tileSize='+this.tileSize+'>';
}
