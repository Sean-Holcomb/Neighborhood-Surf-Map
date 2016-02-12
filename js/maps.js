/*
 * View model for the application.
 * Uses KnockoutJs to bind data to view
 */
var ViewModel = function() {
    "use strict";
    var self = this;
    //Initialize Knockout observables
    self.spots = ko.observableArray();
    self.search = ko.observable("");
    self.menuToggle = ko.observable(false);
    //Knockout computed for dispayed view items
    self.displayContent = ko.computed(function() {
        //filter all spots using using grep and the search term
        return $.grep(self.spots(), function(element, index) {
            var regex = new RegExp(self.search(), "i");
            var result = element.spot_name.match(regex);
            //if element passes filter then the corresponding marker is shown
            if (result) {
                self.spots()[index].marker.setMap(self.map);
            } else {
                self.spots()[index].marker.setMap(null);
            }
            return result;
        });
    });


    //Initialize map
    self.initMap = function() {
        //Map object centered on San Diego County
        self.map = new google.maps.Map(document.getElementById('map'), {
            center: {
                lat: 32.9550,
                lng: -117.2639
            }
        });
        self.infowindow = new google.maps.InfoWindow({
            content: ""
        });
        self.setMarkers();
    };
    //Create an Array of marker objects
    self.setMarkers = function() {
        $.get("http://api.spitcast.com/api/county/spots/san-diego/", function(data, status) {
                if (status == "success") {
                    self.bounds = new google.maps.LatLngBounds();
                    for (var i = 0; i < data.length; i++) {
                        //Place the marker objects at each surf spot returned from api call
                        var latLng = new google.maps.LatLng(data[i].latitude, data[i].longitude);
                        var mark = new google.maps.Marker({
                            position: latLng,
                            map: self.map,
                            title: data[i].spot_name
                        });
                        //add spots coordinates to bounds of map
                        self.bounds.extend(latLng);
                        //add marker to array
                        mark.id = data[i].spot_id;
                        mark.addListener('click', function() {
                            self.markerClick(this);
                        });
                        data[i].marker = mark;
                    }
                    //apply bounds to map
                    self.map.fitBounds(self.bounds);
                    self.spots(data);
                }
            })
            .fail(function() {
                alert("Could not load spot locations");
            });
    };


    //Marker click to load spot info
    self.markerClick = function(marker) {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(
            function() {
                marker.setAnimation(null);
            },
            738 //Time for one bounce
        );
        //Send API call for details on spot
        //return function sets inforwindow on
        var apiString = "http://api.spitcast.com/api/spot/forecast/" + marker.id + "/";
        $.get(apiString, function(data, status) {
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
            .fail(function() {
                alert("Could not load surf spot data");
            });
    };


    //List item click trigger corresponding marker click
    self.listClick = function(spot) {
        self.markerClick(spot.marker);
    };


    self.toggleMenu = function() {
        if (self.menuToggle()) {
            self.menuToggle(false);
        } else {
            self.menuToggle(true);
        }
    };
};


//Make and bind ViewModel
var viewModel = new ViewModel();
ko.applyBindings(viewModel);

function googleError() {
    alert("Could not load Google Map.");
}
