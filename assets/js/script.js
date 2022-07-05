// global variables
// unix seconds per day
const unixSecPerDay = 86400;
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
// function to get sun/moon cycle
function getSunMoonCycle(location, date) {
    // html elements to be updated
    var sunriseEl = document.querySelector("#sunrise-time");
    var sunsetEl = document.querySelector("#sunset-time");
    var moonriseEl = document.querySelector("#moonrise-time");
    var moonsetEl = document.querySelector("#moonset-time");
    // create call string
    var apiUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + location.latitude + "&lon=" + location.longitude + "&exclude=current,minutely,hourly,alerts&appid=" + weatherApiKey;
    // create date
    var currentDate = new Date();
    // date from input
    var inputDate = new Date(date);
    // calculate number of days from current date
    var numDays = Math.abs(Math.ceil((inputDate.getTime() - currentDate.getTime())/unixSecPerDay/1000));
    // request weather data from open weather api
    fetch(apiUrl)
    .then(function(response) {
        response.json()
        .then(function(data) {
            // update html elements value
            sunriseEl.textContent = getTimeString(data.daily[numDays].sunrise);
            sunsetEl.textContent = getTimeString(data.daily[numDays].sunset);
            moonriseEl.textContent = getTimeString(data.daily[numDays].moonrise);
            moonsetEl.textContent = getTimeString(data.daily[numDays+1].moonset);
        });
    });
}

// function to format sun/moon cycle times and return as object
function getTimeString(time) {
    // format time as UTC string
    var utcTime = new Date();
    // convert from seconds to milliseconds
    utcTime.setTime(time*1000);
    // get string of date
    var dateString = utcTime.toLocaleString();
    // extract time from dateString
    dateString = dateString.split(" ");
    // format time string
    var timeString = dateString[1].split(":");
    timeString = timeString[0] + ":" + timeString[1] + " " + dateString[2];
    
    return timeString;
}

// function to retrieve location
function getLocation() {
    return locationInputEl.value;
}

// function to format location as latitude/longitude
function formatLocation(input) {
    // extract city and state from location text
    var location;
    var apiUrl = "http://api.openweathermap.org/geo/1.0/";
    // lat/lon object
    var locationObj = {
        latitude: "",
        longitude: ""
    };

    // format location string
    if (input && input.includes(",")) {
        // if input is city, state code format
        location = input.split(",");
        // create call string
        apiUrl = apiUrl + "direct?q=" + location[0] + "," + location[1].trim() + ",US&limit=1&appid=" + weatherApiKey;
    } else if (Number.isInteger(Number(input))) {
        // create call string
        apiUrl = apiUrl + "zip?zip=" + input.trim() + ",US&appid=" + weatherApiKey;
    } else {
        // return to calling function in any other case
        return;
    }

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
            // save input to local storage
            saveToLocal("location", locationObj);
        });
    });
}

// function to retrieve date/time
function getDateTime() {
    var dateTime = new Date (dateInputEl.value);
    // check for empty input
    if (!dateTime) {
        // TODO: add modal to display error message for empty input
    } else {
        return dateTime;
    }
}

// function to set the default value of datetime input
function setDateInputDefault() {
    var currentDateTime = new Date();
    var dateTime = getDateTimeString(currentDateTime);
    
    // set date picker to current date/time as default
    dateInputEl.setAttribute("value", dateTime);
}

// function to set the min/max dates that can be picked via datetime input
function setMinMaxDates() {
    // datetime input reference
    var currentDateTime = new Date();
    var currentDateTimeString = getDateTimeString(currentDateTime);
    // add 4 days to current time for max date (5 days of data)
    var maxDateTime = new Date(currentDateTime.getTime() + (4*unixSecPerDay*1000));
    var maxDateTimeString = getDateTimeString(maxDateTime);
    
    // set datetime input min and max attributes
    dateInputEl.setAttribute("min", currentDateTimeString);
    dateInputEl.setAttribute("max", maxDateTimeString);   
}

// function to format date/time string for datetime input attributes
function getDateTimeString(date) {
    // format date as ISO string
    var formattedString = date.toISOString().split(".");
    // extract ISO date (yyyy-mm-dd)
    formattedString = formattedString[0].split("T")[0];
    // add time to string
    formattedString = formattedString + "T" + date.toTimeString().slice(0, 5);
    
    return formattedString;
}

// function to save to local storage
function saveToLocal(type, obj) {
    localStorage.setItem(type, JSON.stringify(obj));
}

// function to load from local storage
function loadFromLocal(type) {
    // local storage contents
    var loadObj = JSON.parse(localStorage.getItem(type));
    
    // check for loadObj contents
    if (loadObj) {
        return loadObj;
    }
    // if loadObj is empty, check for type request and provide default data
    else if (type === "location") {
        // default location Cherry Springs State Park, Pennsylvania
        loadObj = {
            latitude: 41.665646,
            longitude: -77.828094
        };
        saveToLocal(type, loadObj);
        return loadObj;
    };
};

// event listeners
//Function to toggle dark mode
darkModeEl.addEventListener("click", function() {
    document.body.classList.toggle("dark-theme");
});
locationBtnEl.addEventListener("click", function() {
    // retrieve location from location input
    var location = getLocation();
    // verify location isn't empty
    if (location) {
        // format location as latitude/longitude
        formatLocation(location);
        getSunMoonCycle(loadFromLocal("location"), Date());
        // clear input value
        locationInputEl.value = "";
    }
});
dateBtnEl.addEventListener("click", function() {
    // retrieve date/time from date/time input
    var dateTime = getDateTime();
    // verify dateTime isn't empty
    if (dateTime) {
        // update sun/moon cycle times
        getSunMoonCycle(loadFromLocal("location"), dateTime);
        // clear input value
        dateInputEl.value = "";
    };
});

// on load function calls
// get sunrise, sunset, moonrise, and moonset times for current day and display
getSunMoonCycle(loadFromLocal("location"), Date());
// set datetime input default value as current date and time
setDateInputDefault();
// set datetime input min and max dates that can be selected
setMinMaxDates();
