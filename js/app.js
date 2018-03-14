// model
model.forEach(function(element) {
    var position = element.latLng;
    var title = element.title;
    var vinueID = element.vinueID;
    // ajax request for foursqaure api
    $.ajax({
        url: 'https://api.foursquare.com/v2/venues/' + vinueID + '?client_id=SIN4JYERCJ4SFB3TQMJJJ1FEMVXAXOJW3DDFJ154WBUD0CEU&client_secret=Z5DT5TQBRIKYBNTMXGBDNRYWU3ETZBV1WOTKB2JJ2BY0L3TZ&v=20170801',
        success: function(data) {
            element.name = data.response.venue.name ? data.response.venue.name : "N/A";
            element.rating = data.response.venue.rating ? data.response.venue.rating : "N/A";
            element.price = data.response.venue.price.message ? data.response.venue.price.message : "N/A";
            element.faddress = data.response.venue.location.formattedAddress ? data.response.venue.location.formattedAddress : "N/A";
            element.isOpen = data.response.venue.popular.isOpen ? data.response.venue.popular.isOpen : "N/A";
            element.url = data.response.venue.shortUrl ? data.response.venue.shortUrl : "N/A";
        },
        // error handling function
        error: function(jqXHR, exception) {
            var msg = '';
            if (jqXHR.status === 0) {
                msg = 'Not connect.\n Verify Network.';
            } else if (jqXHR.status == 404) {
                msg = 'Requested page not found(check your requested URL). [404] ';
            } else if (jqXHR.status == 500) {
                msg = 'Internal Server Error [500].';
            } else if (exception === 'parsererror') {
                msg = 'Requested JSON parse failed.';
            } else if (exception === 'timeout') {
                msg = 'Time out error.';
            } else if (exception === 'abort') {
                msg = 'Ajax request aborted.';
            } else {
                msg = 'Uncaught Error.\n' + jqXHR.responseText;
            }
            alert(msg);
        }
    });
});
// map initialization
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 31.035634, lng: 31.370395},
        zoom: 15,
        mapTypeControl: false
    });
    myViewModel = new ViewModel();
    ko.applyBindings(myViewModel);

}
// Es2015 class style
class ViewModel {
    constructor() {
        var self = this;
        this.filter = ko.observable();
        this.places = ko.observableArray(model);
        self.infowindow = new google.maps.InfoWindow();
        self.marker = [];
        model.forEach(function (element) {
            var icon = 'images/mrkr.png';
            var title = element.title;
            var position = element.latLng;
            var VINUE_ID = element.VINUE_ID;
            element.marker = new google.maps.Marker({
                position: position,
                title: title,
                map: map,
                icon: icon,
                animation: google.maps.Animation.DROP,
            });
            self.marker.push(element.marker);
            element.marker.addListener('click', function () {
                self.populateInfoWindow(this, self.infowindow, element);
            });
        });
        // infoWindow data recieved from foursqaure
        self.populateInfoWindow = (function (marker, infowindow, element, vinueID) {
            var content = '<div id="info-content">' +
                '<h1>' + element.title + '</h2>' +
                '<h4>Data from Foursquare</h4>' +
                '<p> Rating : ' + element.rating + '/10' + '</p>' +
                '<p> Price: ' + element.price + '</p>' +
                '<p> Address: ' + element.faddress + '</p>' +
                '<p> Open: ' + element.isOpen + '</p>' +
                '<p> Check on foursquare: <a href="' + element.url + '">' + element.name + '</a></p>';
            '</div>';
            self.infowindow.setContent(content);
            self.infowindow.open(map, marker);
            self.animateMarker(marker);
            // add class to infoWindow via jQuery - for styling
            $('.gm-style-iw').parent().addClass("iwclass");
        });
        // marker animation
        self.animateMarker = (function (marker) {
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function () {
                marker.setAnimation(null);
            }, 1000);
        });
        self.listItemsClick = (function (location) {
            google.maps.event.trigger(location.marker, 'click');
        });
        // get visible locations via knockout computed
        this.visibleLocations = ko.computed(function () {
            var filter = self.filter();
            if (!filter) {
                ko.utils.arrayForEach(self.places(), function (item) {
                    item.marker.setVisible(true);
                });
                return self.places();
            }
            else {
                return ko.utils.arrayFilter(self.places(), function (item) {
                    var result = (item.title.toLowerCase().search(filter) >= 0);
                    self.infowindow.close();
                    item.marker.setVisible(result);
                    return result;
                });
            }
        });
    }
}

// map error handling
function gErr() {
    alert("Ops! Something went wrong, please try again!");
}