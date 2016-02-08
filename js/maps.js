/*
 * View model for the application.
 * Uses KnockoutJs to bind data to view
 */
var ViewModel = function () {
	"use strict";
	var self = this;
	//Initialize Knockout observables
	self.spots = ko.observableArray();
	self.markers = ko.observableArray();
	self.search = ko.observable("");
	self.infowindow = new google.maps.InfoWindow({
		content: ""
	});
	//Knockout computed for dispayed view items
	self.displayContent = ko.computed(function () {
		//filter all spots using using grep and the search term
		return $.grep(self.spots(), function (element, index) {
			var regex = new RegExp(self.search(), "i");
			var result = element.spot_name.match(regex);
			//if element passes filter then the corresponding marker is shown
			if (result) {
				self.markers()[index].setMap(self.map);
			} else {
				self.markers()[index].setMap(null);
			}
			return result;
		});
	});


	//Initialize map
	self.initMap = function () {
		//Letting the google map know the size of its window so it displays properly
		self.DOMmap = document.getElementById('map');
		self.DOMmap.style.height = document.getElementById('mapDiv')
			.clientHeight + 'px';
		//Map object centered on San Diego County
		self.map = new google.maps.Map(self.DOMmap, {
			center: {
				lat: 32.9550,
				lng: -117.2639
			},
			zoom: 10
		});
		self.setMarkers();
	};
	//Create an Array of marker objects
	self.setMarkers = function () {
		$.get("http://api.spitcast.com/api/county/spots/san-diego/", function (data, status) {
				if (status == "success") {
					for (var i = 0; i < data.length; i++) {
						//Place the marker objects at each surf spot returned from api call
						var mark = new google.maps.Marker({
							position: {
								lat: data[i].latitude,
								lng: data[i].longitude
							},
							map: self.map,
							title: data[i].spot_name
						});
						//add marker to array
						self.markers.push(mark);
						mark.id = data[i].spot_id;
						mark.addListener('click', function () {
							self.markerClick(this);
						});
					}
					self.spots(data);
				}
			})
			.fail(function () {
				alert("Could not load spot locations");
			});
	};


	//Marker click to load spot info
	self.markerClick = function (marker) {
		marker.setAnimation(google.maps.Animation.BOUNCE);
		setTimeout(
			function () {
				marker.setAnimation(null);
			},
			738 //Time for one bounce
		);
		//Send API call for details on spot
		//return function sets inforwindow on
		var apiString = "http://api.spitcast.com/api/spot/forecast/" + marker.id + "/";
		$.get(apiString, function (data, status) {
				if (status == "success") {
					self.infowindow.close();
					self.infowindow = new google.maps.InfoWindow({
						content: '<div id="content">' +
							'<div id="siteNotice">' +
							'</div>' +
							'<h1 id="firstHeading" class="firstHeading">' +
							data[0].spot_name +
							'</h1>' +
							'<div id="bodyContent">' +
							'<p>Date: ' +
							data[0].date +
							'</p>' +
							'<p>Size: ' +
							data[0].size +
							'ft</p>' +
							'<p>Conditions: ' +
							data[0].shape_full +
							'</p>' +
							'</div>' +
							'</div>'
					});
					self.infowindow.open(self.map, marker);
				}
			})
			.fail(function () {
				alert("Could not load surf spot data");
			});
	};


	//List item click trigger corresponding marker click
	self.listClick = function (name) {
		var len = self.markers()
			.length;
		for (var i = 0; i < len; i++) {
			if (self.markers()[i].title == name) {
				self.markerClick(self.markers()[i]);
				break;
			}
		}
	};

	//Initialize map and make API call for location data
	self.initMap();

}

//Make and bind ViewModel
ko.applyBindings(new ViewModel());
