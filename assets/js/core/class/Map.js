define(function(require) {
    
    var Map = function() {
        
        var map = null;
        
        this.initialize = function() {
            var mapCanvas = document.getElementById("map-canvas");
            var mapOptions = { 
                center: new google.maps.LatLng(44.5403, -78.5463),
                zoom: 2,
                mapTypeId: google.maps.MapTypeId.SATELLITE,
                disableDefaultUI: true
            };
            map = new google.maps.Map(mapCanvas, mapOptions);
        }
    
        this.getMap = function() {
            return map;
        }
        
        this.setCenter = function(latitude, longitude) {
            map.setCenter(new google.maps.LatLng(latitude, longitude));                
        }
        
        this.setZoom = function(zoomLevel) {
            map.setZoom(zoomLevel);
        }
        
        this.setCityText = function(text) {
            $("#side_panel #title").html("You are now talking to a user from " + text);
        }
    }
    
    return Map;
});