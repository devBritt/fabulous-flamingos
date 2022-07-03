// global variables
// API keys/urls
const weatherApiKey = "57bb6de1daa898857366ae01e5539fb5";
// where the iss at? does not require a key
// base url is to get information about iss at a given time
const issApiBaseUrl = "https://api.wheretheiss.at/v1/satellites/25544/positions?timestamps=";
// element references
// dark mode toggle element
var darkModeEl = document.querySelector("#dark-mode-toggle");
// location button element
var locationBtnEl = document.querySelector("#set-location");
// date button element
var dateBtnEl = document.querySelector("#set-date-time");
// location input element
var locationInputEl = document.querySelector("#location-input");
// date input element
var dateInputEl = document.querySelector("#date-time-input");

// functions
// function to retrieve location
function getLocation() {
    return locationInputEl.value;
}

// function to format location as latitude/longitude
function formatLocation(input) {
    // extract city and state from location text
    var location;
    var apiUrl;
    // format location string
    if (input && input.includes(",")) {
        // if input is city, state code format
        location = input.split(",");
        // create call string
        apiUrl = "http://api.openweathermap.org/geo/1.0/direct?q=" + location[0] + "," + location[1].trim() + ",US&limit=1&appid=" + weatherApiKey;
    } else if (Number.isInteger(Number(input))) {
        // create call string
        apiUrl = "http://api.openweathermap.org/geo/1.0/zip?zip=" + input.trim() + ",US&appid=" + weatherApiKey;
    } else {
        // return to calling function in any other case
        return;
    }

    // lat/lon object
    var locationObj = {
        latitude: "",
        longitude: ""
    };
    // request location formatting
    fetch(apiUrl)
    .then(function(response) {
        response.json()
        .then(function(data) {
            // check for array
            if (Array.isArray(data)) {
                locationObj.latitude = data[0].lat;
                locationObj.longitude = data[0].lon;
            } else {
                locationObj.latitude = data.lat;
                locationObj.longitude = data.lon;
            };
            saveToLocal("location", locationObj);
        });
    });
}

// function to retrieve date/time
function getDateTime() {
    var dateTime = dateInputEl.value;
    // check for empty input
    if (!dateTime) {
        // TODO: add modal to display error message for empty input
    } else {
        return dateTime;
    }
}

// function to save to local storage
function saveToLocal(type, obj) {
    localStorage.setItem(type, JSON.stringify(obj));
}

// event listeners
//Function to toggle dark mode
darkModeEl.addEventListener("click", function() {
    document.body.classList.toggle("dark-theme");
});
locationBtnEl.addEventListener("click", function() {
    // retrieve location from location input
    var location = getLocation();
    // format location as latitude/longitude
    formatLocation(location)
    .then(function(response) {
        console.log(response);
    })
    // save location to local storage
    // clear input value
    locationInputEl.value = "";
});
dateBtnEl.addEventListener("click", function() {
    // retrieve date/time from date/time input
    var dateTime = getDateTime();
    // clear input value
    dateInputEl.value = "";
});

// on load function calls