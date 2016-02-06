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
	//Knockout computed for dispayed view items
	self.displayContent = ko.computed(function () {
		//filter all spots using using grep and the search term
		return $.grep(self.spots(), function (element, index) {
			var regex = new RegExp(self.search());
			var result = element.spot_name.match(regex)
			//if element passes filter then the corresponding marker is shown
			if (result) {
				self.markers()[index].setMap(self.map);
			} else {
				self.markers()[index].setMap(null);
			}
			return result;
		})
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
			zoom: 12
		});
	}
	//Create an Array of marker objects
	self.setMarkers = function (place) {
		for (var i = 0; i < place.length; i++) {
			//Place the marker objects at each surf spot returned from api call
			var mark = new google.maps.Marker({
				position: {
					lat: place[i].latitude,
					lng: place[i].longitude
				},
				map: self.map,
				title: place[i].spot_name
			});
			//add marker to array
			self.markers.push(mark);
			//function to animate marker and give details about spot
			(function (marker, id) {
				mark.addListener('click', function () {
					//Animate and stop animation
					marker.setAnimation(google.maps.Animation.BOUNCE);
					setTimeout(
						function () {
							marker.setAnimation(null);
						},
						738  //Time for one bounce
					);
					//Send API call for details on spot
					//return function sets inforwindow on
					var apiString = "http://api.spitcast.com/api/spot/forecast/" + id + "/";
					$.get(apiString, function (data, status){
						if (status == "success") {
							self.infowindow = new google.maps.InfoWindow({
								content: '<div id="content">'+
								'<div id="siteNotice">'+
								'</div>'+
								'<h1 id="firstHeading" class="firstHeading">' +
								data[0].spot_name +
								'</h1>'+
								'<div id="bodyContent">'+
								'<p>Date: ' +
								data[0].date +
								'</p>'+
								'<p>Size: ' +
								data[0].size +
								'ft</p>'+
								'<p>Conditions: ' +
								data[0].shape_full +
								'</p>'+
								'</div>'+
								'</div>'
							});
							self.infowindow.open(self.map, marker);
						}
					});

				});
			//call method with current marker and spot id
			}(mark, place[i].spot_id));
		}
	};

	//List item click trigger corresponding marker click
	self.listClick = function(name) {
		console.log("clicking")
		var len = self.markers().length;
		for (var i = 0; i < len; i++) {
			if (self.markers()[i].title == name){
				$(self.markers()[i]).trigger("click");
				break;
			}
		}
	}

	//Initialize map and make API call for location data
	self.initMap();
	$.get("http://api.spitcast.com/api/county/spots/san-diego/", function (data, status) {
			if (status == "success") {
				self.setMarkers(data);
				self.spots(data);

			}
		})
};

//Make and bind ViewModel
ko.applyBindings(new ViewModel());
