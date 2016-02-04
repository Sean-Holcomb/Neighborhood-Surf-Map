var places = [{
	position: {
		lat: 33.012194,
		lng: -117.279283
	},
	title: 'Ki\'s Restaurant'
}, {
	position: {
		lat: 32.972551,
		lng: -117.262616
	},
	title: 'Del Mar Fairgrounds'
}, {
	position: {
		lat: 32.919034,
		lng: -117.254548
	},
	title: 'Torrey Pines State Natural Reserve'
}, {
	position: {
		lat: 32.975575,
		lng: -117.270083
	},
	title: 'Dog Beach'
}, {
	position: {
		lat: 32.888696,
		lng: -117.253518
	},
	title: 'Blacks Beach'
}];

var ViewModel = function () {
	var self = this;
	self.places = ko.observableArray(places);
	self.spots = ko.observableArray();
	self.markers = ko.observableArray();
	self.search = ko.observable("");
	self.displayContent = ko.computed(function() {
		return $.grep(self.spots(), function(element) {
			var regex = new RegExp(self.search());
			return element.spot_name.match(regex);
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
			self.spots(data);
			self.setMarkers(data)
			console.log(self.displayContent())
		}
	})
	//self.setMarkers(places);

	//list and search bar
	self.searchContent = ko.observable("");

};

ko.applyBindings(new ViewModel());
