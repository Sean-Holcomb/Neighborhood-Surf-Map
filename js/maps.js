
var ViewModel = function () {
	var self = this;
	self.spots = ko.observableArray();
	self.markers = ko.observableArray();
	self.search = ko.observable("");
	self.displayContent = ko.computed(function() {
		return $.grep(self.spots(), function(element, index) {
			var regex = new RegExp(self.search());
			var result = element.spot_name.match(regex)
			if (result){
				self.markers()[index].setMap(self.map);
			} else {
				self.markers()[index].setMap(null);
			}
			return result;
		})
	});


	//Initialize map
	self.initMap = function () {
		self.DOMmap = document.getElementById('map');
		self.DOMmap.style.height = document.getElementById('mapDiv').clientHeight + 'px';
		self.map = new google.maps.Map(self.DOMmap, {
			center: {
				lat: 32.9550,
				lng: -117.2639
			},
			zoom: 12
		});
	}

	self.setMarkers = function (place) {
		for (var i = 0; i < place.length; i++) {
			var mark = new google.maps.Marker({
				position: {lat: place[i].latitude, lng: place[i].longitude},
				map: self.map,
				title: place[i].spot_name
			});
			self.markers.push(mark);
			mark.addListener('click', function () {
				marker = mark;
				if (marker.getAnimation() !== null) {
					marker.setAnimation(null);
				} else {
					marker.setAnimation(google.maps.Animation.BOUNCE);
				}
			});
		}
	};



	self.initMap();
	$.get("http://api.spitcast.com/api/county/spots/san-diego/", function(data, status) {
		if (status == "success"){
			self.setMarkers(data);
			self.spots(data);

		}
	})
	//self.setMarkers(places);

	//list and search bar
	self.searchContent = ko.observable("");

};

ko.applyBindings(new ViewModel());
