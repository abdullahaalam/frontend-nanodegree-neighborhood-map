// Google Maps API initMap function
function initMap() {
    // Turn on Strict Mode
    'use strict';
    /* View Model */
    var ViewModel = function() {
        var self = this;
        self.infoMarker = null;
        self.location = ko.observableArray();

        // Google map to display Kansas, USA
        // Location: 39.011902,-98.484246 (Kansas, USA)
        self.map = new google.maps.Map(document.getElementById('map'), {
            center: {
                lat: 39.011902,
                lng: -98.484246
            },
            zoom: 3
        });

        self.updateList = function(placeID) {
            self.yelpAPI(placeID, null);
        };

        self.yelpAPI = function(placeID, marker) {

            // My Yelp API
            var authentication = {
                consumerKey: "EIE7fbhrfbsRuyo0MDdJaQ",
                consumerSecret: "mPj5XceVuKXt-iMJk5tzK85OuTE",
                accessToken: "7H950bHI-F2C5pNMxN-0TanotNDF-P02",
                accessTokenSecret: "C3R-mLkyCzFFGWBw1MnD2WjP8aE",
                serviceProvider: {
                    signatureMethod: "HMAC-SHA1"
                }
            };

            var yelpUrl = 'https://api.yelp.com/v2/business/' + placeID;

            var parameters = {
                oauth_consumer_key: authentication.consumerKey,
                oauth_token: authentication.accessToken,
                oauth_nonce: nonceGenerate(),
                oauth_timestamp: Math.floor(Date.now() / 1000),
                oauth_signature_method: 'HMAC-SHA1',
                oauth_version: '1.0',
                callback: 'cb'
            };

            var encodedSignature = oauthSignature.generate('GET', yelpUrl, parameters, authentication.consumerSecret, authentication.accessTokenSecret);
            parameters.oauth_signature = encodedSignature;

            var selectedMarker = null;

            self.markers().forEach(function(currentMarker) {
                if (currentMarker.yelp_id === placeID) {
                    selectedMarker = currentMarker;
                    currentMarker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
                } else {
                    currentMarker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
                }
            });

            var errorTimeout = setTimeout(function() {
                alert("Oops! Something went terribly wrong.");
            }, 8000);

            $.ajax({
                url: yelpUrl,
                data: parameters,
                cache: true,
                dataType: 'jsonp',
                success: function(results) {
                    clearTimeout(errorTimeout);
                    self.business(results);
                    self.location(results.location.display_address);

                    var displayString = '<div id="content">' +
                        '<h1 id="firstHeading" class="firstHeading">' + results.name + '</h1>' +
                        '<div id="bodyContent">' +
                        '<p><img src="' + results.image_url  + '">'  + '</p>' +
                        '<p>' + results.location.display_address + '</p>' +
                        '<p><img src="' + results.rating_img_url_large  + '">'  + '</p>' +
                        '</div>' +
                        '</div>';

                    if (self.InfoMarker != null) {
                        self.InfoMarker.close();
                    }

                    self.InfoMarker = new google.maps.InfoWindow({
                        content: displayString
                    });

                    self.InfoMarker.open(mapView.map, selectedMarker);
                }
            });
        };

        self.markers = new ko.observableArray();
        self.filterLocations = ko.observable('');
        self.business = ko.observable('');

        self.addLocation = function(title, latitude, longitude, place_id) {
            var location = {
                position: new google.maps.LatLng(latitude, longitude),
                title: title,
                visible: true,
                map: self.map,
                yelp_id: place_id
            };

            // Add marker to array of markers
            self.markers.push(new google.maps.Marker(location));
            self.markers()[self.markers().length - 1].setAnimation(null);

            // Add click function to the new marker
            self.markers()[self.markers().length - 1].addListener('click', function() {
                var marker = this;
                if (marker.getAnimation() !== null) {
                    marker.setAnimation(null);
                } else {
                    marker.setAnimation(google.maps.Animation.BOUNCE);
                    setTimeout(function() {
                        marker.setAnimation(null);
                    }, 1400);
                }
                self.yelpAPI(this.yelp_id, this);
            });

            // Return the object
            return location;
        };

        self.coordinates = [
            // California
            new self.addLocation('Hack Reactor', 37.784008,-122.408092, 'hack-reactor-san-francisco'),
            new self.addLocation('App Academy San Francisco', 37.791305,-122.393735, 'app-academy-san-francisco'),
            new self.addLocation('Dev Bootcamp', 37.784517,-122.397194, 'dev-bootcamp-san-francisco'),
            new self.addLocation('General Assembly San Francisco', 37.790841,-122.40128, 'general-assembly-san-francisco-san-francisco-2'),
            new self.addLocation('Hackbright Academy', 37.788668,-122.411499, 'hackbright-academy-san-francisco'),
            new self.addLocation('Coder Camps', 37.808544,-122.253681, 'coder-camps-oakland-2'),
            new self.addLocation('Coding Dojo San Francisco', 37.377241,-121.911981, 'coding-dojo-san-jose'),
            new self.addLocation('General Assembly Santa Monica', 34.012982,-118.495196, 'general-assembly-santa-monica-santa-monica'),
            new self.addLocation('General Assembly Downtown Los Angeles', 34.031245,-118.266532, 'general-assembly-downtown-los-angeles-los-angeles'),
            // Washington
            new self.addLocation('Code Fellows Seattle', 47.618217,-122.351832, 'code-fellows-seattle-seattle-2'),
            new self.addLocation('Coding Dojo Seattle', 47.609819,-122.196547, 'coding-dojo-bellevue-2'),
            new self.addLocation('General Assembly Seattle', 47.608492,-122.336407, 'general-assembly-seattle-seattle-3'),
            // Washington DC
            new self.addLocation('General Assembly Washington DC', 38.904864,-77.033996, 'general-assembly-washington-dc'),
            // North Carolina
            new self.addLocation('Coder Foundry', 36.09681,-80.072171, 'coder-foundry-kernersville'),
            // New York
            new self.addLocation('The Flatiron School', 40.705253,-74.01407, 'the-flatiron-school-new-york'),
            new self.addLocation('Fullstack Academy of Code',  40.705076,-74.00916, 'fullstack-academy-of-code-new-york'),
            new self.addLocation('General Assembly',  40.73939,-73.989285, 'general-assembly-new-york-broadway'),
            new self.addLocation('General Assembly New York',  40.739885,-73.990082, 'general-assembly-new-york'),
            new self.addLocation('App Academy NYC',  40.725024,-73.996792, 'app-academy-nyc-new-york-2'),
            // Oregon
            new self.addLocation('Epicodus',  45.521838,-122.675646, 'epicodus-portland'),
            // Massachusetts
            new self.addLocation('General Assembly Boston',  42.349202,-71.050098, 'general-assembly-boston'),
            // Georgia
            new self.addLocation('General Assembly Atlanta',  33.772264,-84.36619, 'general-assembly-atlanta'),
            new self.addLocation('The Iron Yard Atlanta',  33.752082,-84.392135, 'the-iron-yard-atlanta-2'),
            // Texas
            new self.addLocation('General Assembly Austin',  30.268603,-97.743202, 'general-assembly-austin-austin'),
            // Indiana
            new self.addLocation('The Iron Yard Indianapolis',  39.768289,-86.149422, 'the-iron-yard-indianapolis'),
            // Illonois
            new self.addLocation('General Assembly Chicago', 41.890651,-87.626968, 'general-assembly-chicago')
        ];

        // Search filter to find a location of the coding bootcamp
        self.filterLocations.subscribe(function(filterValue) {
            filterValue = filterValue.toLowerCase();
            var change = false;
            ko.utils.arrayForEach(self.markers(), function(marker) {
                var text = marker.title.toLowerCase();

                if (text.search(filterValue) === -1) {
                    if (marker.getVisible() === true) {
                        change = true;
                    }
                    marker.setVisible(false);
                } else {
                    if (marker.getVisible() === false) {
                        change = true;
                    }
                    marker.setVisible(true);
                }
            });

            if (change === true) {
                var data = self.markers().slice(0);
                self.markers([]);
                self.markers(data);
            }
        });
    };

    // Activate knockout
    var mapView = new ViewModel();
    ko.applyBindings(mapView);
}

function nonceGenerate(length) {
    var text = '';
    var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++) {
        text += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    return text;
}