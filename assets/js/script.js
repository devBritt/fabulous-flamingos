// global variables
// unix seconds per day
const unixSecPerDay = 86400;
// API keys/urls
const weatherApiKey = "57bb6de1daa898857366ae01e5539fb5";
// AstronomyAPI auth info GITHUB
const astroAppId = "312a5dc5-d6c5-47d7-820d-3855916e3241";
const astroSecret = "537ee7cdfcfd302a1b2ee5f1a21d78cd7503095d5feb8b3d419cc98f575a6ae9e666a8f4729692effeec9d9017bbd19a22d7478f57bf627cedf92d958b5fe198bb4887463ceea29bb7e446f11b78fc4d5b193ff4888f517593402f0d690bc962d9f783d6cab375755ed5808d01f45379";
const authKey = btoa(astroAppId + ":" + astroSecret);
// AstronomyAPI all bodies endpoint
const astroUrl = "https://api.astronomyapi.com/api/v2/bodies/positions?";
// element references
// dark mode toggle element
var darkModeEl = document.querySelector("#dark-mode-toggle");
// location button element
var locationBtnEl = document.querySelector("#set-location");
// date button element
var dateBtnEl = document.querySelector("#set-date-time");
// location input elements
var cityInputEl = document.querySelector("#city-input");
var stateInputEl = document.querySelector("#state-input");
// date input element
var dateInputEl = document.querySelector("#date-time-input");

// functions
// Open Weather API call function
function requestWeatherData(isUpdate) {
    // get where and when
    var location = loadFromLocal("location");
    var inputDate = new Date(loadFromLocal("datetime"));
    // create call string
    var apiUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + location.latitude + "&lon=" + location.longitude + "&units=imperial&exclude=minutely,hourly,alerts&appid=" + weatherApiKey;
    
    // current date
    var currentDate = new Date();
    // calculate number of days from current date
    var numDays = Math.abs(Math.ceil((inputDate.getTime() - currentDate.getTime()) / unixSecPerDay / 1000));

    // request weather data from open weather api
    fetch(apiUrl)
    .then(function (response) {
        response.json()
        .then(function (data) {
            // update sun cycle
            setSunMoonCycles(data.daily[numDays], data.daily[numDays+1].moonset);
            // determine moon phase name/icon needed
            setMoonPhaseInfo(data.daily[numDays].moon_phase);
            // check for initial call
            if (!isUpdate) {
                // update forecast
                updateForecast(data);
            }
        });
    });
}

// get weather function
function updateForecast(data) {
    var weatherEl = document.querySelectorAll(".forecast-card");
    // update card contents using weather data
    for(var i = 0; i < 6; i++) {
        var date = new Date(data.daily[i].dt*1000);
        // create img tag for weather icon
        var iconEl = document.createElement("img");
        // update date
        weatherEl.item(i).querySelector(".weather-date").textContent = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
        // update temp
        weatherEl.item(i).querySelector(".temperature").textContent = Math.round((data.daily[i].temp.min + data.daily[i].temp.max)/2) + "\u00b0";
        // update icon
        iconEl.src = getWeatherIcon(data.daily[i].weather[0].id, date);
        iconEl.setAttribute("class", "weather-icon");
        weatherEl.item(i).querySelector(".weather-icon").appendChild(iconEl);
        // update visibility for current day only
        weatherEl.item(i).querySelector(".sky-visibility").textContent = data.daily[i].clouds + "\u0025";
    };
}

// get weather icon
function getWeatherIcon(weather, date) {
    // thunderstorm
    if (weather > 199 && weather < 233) {
        return "assets/images/standard-icons/svg/thunderstorm.svg";
    }
    // rain
    else if (weather > 299 && weather < 532) {
        return "assets/images/standard-icons/svg/rain.svg";
    }
    // snow
    else if (weather > 599 && weather < 623) {
        // sleet
        if (weather === 611 || weather === 612 || weather === 613) {
          return "assets/images/standard-icons/svg/sleet.svg";
        }
        return "assets/images/standard-icons/svg/snow.svg";
    }
    // mist, smoke, haze
    else if (weather === 701 || weather === 711 || weather === 721) {
        return "assets/images/standard-icons/svg/fog.svg";
    }
    // clouds
    else if (weather > 799 && weather < 805) {
        // check for am/pm
        if (date.getHours() <= 10) {
            return "assets/images/standard-icons/svg/cloudy.svg";
        } else if (date.getHours() > 10) {
            return "assets/images/standard-icons/svg/cloudy-night.svg";
        };
    }
    // else if weather=800 (clear)
    else if (weather === 800) {
        // check for am/pm
        if (date.getHours() <= 10) {
            return "assets/images/standard-icons/svg/sun.svg";
        } else if (date.getHours() > 10) {
            return "assets/images/standard-icons/svg/moon.svg";
        };
    }
    // else (alien)
    else {
        return "assets/images/standard-icons/svg/alien.svg";
    }
}

// function to get sun/moon cycle
function setSunMoonCycles(data, moonset) {
    // html elements to be updated
    var sunriseEl = document.querySelector("#sunrise-time");
    var sunsetEl = document.querySelector("#sunset-time");
    var moonriseEl = document.querySelector("#moonrise-time");
    var moonsetEl = document.querySelector("#moonset-time");
    
    // update html elements value
    sunriseEl.textContent = getTimeString(data.sunrise);
    sunsetEl.textContent = getTimeString(data.sunset);
    moonriseEl.textContent = getTimeString(data.moonrise);
    moonsetEl.textContent = getTimeString(moonset);
}

// function to determine moon phase name/icon needed
function setMoonPhaseInfo(phaseNum) {
    // moon phase elemenets
    var moonphaseiconEl = document.querySelector("#phase-icon");
    var moonphasenameEl = document.querySelector("#phase-name");

    // create img tag
    var iconEl = document.createElement("img");
    iconEl.setAttribute("class", "col s6");

    // clear previous images
    moonphaseiconEl.innerHTML = "";

    // determine moon phase based on phase number
    if (phaseNum === 0 || phaseNum === 1) {
        // set icon images
        iconEl.src = "assets/images/standard-icons/svg/new-moon.svg";
        // append icon element to span
        moonphaseiconEl.appendChild(iconEl);
        // update moon phase name text
        moonphasenameEl.textContent = "New Moon";
    } else if (phaseNum > 0 && phaseNum < 0.25) {
        iconEl.src = "assets/images/standard-icons/svg/wax-c-wan-g.svg";
        // append icon element to span
        moonphaseiconEl.appendChild(iconEl);
        // update moon phase name text
        moonphasenameEl.textContent = "Waxing Cresent";
    } else if (phaseNum === 0.25) {
        iconEl.src = "assets/images/standard-icons/svg/first-quarter.svg";
        // append icon element to span
        moonphaseiconEl.appendChild(iconEl);
        // update moon phase name text
        moonphasenameEl.textContent = "First Quarter";
    } else if (phaseNum > 0.25 && phaseNum < 0.5) {
        iconEl.src = "assets/images/standard-icons/svg/wax-g-wan-c.svg";
        // append icon element to span
        moonphaseiconEl.appendChild(iconEl);
        // update moon phase name text
        moonphasenameEl.textContent = "Waxing Gibous";
    } else if (phaseNum === 0.5) {
        iconEl.src = "assets/images/standard-icons/svg/full-moon.svg";
        // append icon element to span
        moonphaseiconEl.appendChild(iconEl);
        // update moon phase name text
        moonphasenameEl.textContent = "Full Moon";
    } else if (phaseNum > 0.5 && phaseNum < 0.75) {
        iconEl.src = "assets/images/standard-icons/svg/wax-c-wan-g.svg";
        // append icon element to span
        moonphaseiconEl.appendChild(iconEl);
        // update moon phase name text
        moonphasenameEl.textContent = "Waning Gibous";
    } else if (phaseNum === 0.75) {
        iconEl.src = "assets/images/standard-icons/svg/last-quarter.svg";
        // append icon element to span
        moonphaseiconEl.appendChild(iconEl);
        // update moon phase name text
        moonphasenameEl.textContent = "Last Quarter";
    } else if (phaseNum > 0.75 && phaseNum < 1) {
        iconEl.src = "assets/images/standard-icons/svg/wax-g-wan-c.svg";
        // append icon element to span
        moonphaseiconEl.appendChild(iconEl);
        // update moon phase name text
        moonphasenameEl.textContent = "Waning Cresent";
    };
}

// function to format sun/moon cycle times and return as object
function getTimeString(time) {
    // format time as UTC string
    var utcTime = new Date();
    // convert from seconds to milliseconds
    utcTime.setTime(time * 1000);
    // get string of date
    var dateString = utcTime.toLocaleString();
    // extract time from dateString
    dateString = dateString.split(" ");
    // format time string
    var timeString = dateString[1].split(":");
    timeString = timeString[0] + ":" + timeString[1] + " " + dateString[2];

    return timeString;
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
        .then(function (response) {
            response.json()
                .then(function (data) {
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
    var maxDateTime = new Date(currentDateTime.getTime() + (5 * unixSecPerDay * 1000));
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


// function to calculate if a planet is visible
function requestPlanetData() {
    // get saved date
    var fromDate = new Date(loadFromLocal("datetime")) || new Date();
    var toDate = new Date(fromDate.valueOf()+(unixSecPerDay*1000));
    const params = [
        "latitude=" + loadFromLocal("location").latitude,
        "longitude=" + loadFromLocal("location").longitude,
        "elevation=0",
        "from_date=" + fromDate.toJSON().slice(0, 10),
        "to_date=" + toDate.toJSON().slice(0, 10),
        "time=" + fromDate.toJSON().slice(11, 19)
    ];
    
    const urlQuery = params.join('&');
    
    fetch(astroUrl + urlQuery, {
        method: "GET",
        headers: {
            "Authorization": "Basic " + authKey
        }
    })
    .then(function (response) {
        response.json()
        .then(function (data) {
            for (var i = 0; i < data.data.table.rows.length; i++) {
                var planetName = data.data.table.rows[i].entry.id;
                if (planetName === "mercury" || planetName === "venus" || planetName === "mars" || planetName === "jupiter" || planetName === "saturn" || planetName === "uranus" || planetName === "neptune") {
                    calcPlanetVisible(data.data.table.rows[i]);
                }
            };
        })
    });
}

// function to calculate if planet is visible
function calcPlanetVisible(planetData) {
    // planet element to update
    var planetEl = document.querySelector("#" + planetData.cells[0].id);
    // planet horizonal altitude
    var altitude = planetData.cells[0].position.horizonal.altitude.degrees;
    
    // update planet element text to say yes or no
    if (altitude > 0 && altitude < 90) {
        planetEl.querySelector(".is-it-visible").textContent = "Yes";
    } else {
        planetEl.querySelector(".is-it-visible").textContent = "No";
    }
}

// function to update where and when location text
function updateLocationText(city, state) {
    // update city placeholder
    cityInputEl.setAttribute("placeholder", city);
    // update state placeholder
    stateInputEl.setAttribute("placeholder", state);
}

// function to update where and when date text
function updateDateText() {
    // get date from local
    var date = new Date(loadFromLocal("datetime"));
    // datetime element to update
    var datetimeEl = document.querySelector("#view-date-time");
    // date string array
    var dateStrings = [
        date.getMonth() + 1,
        date.getDate(),
        date.getFullYear()
    ];
    var timeStrings = [];
    // time string array
    if (date.getHours() > 11) {
        timeStrings.push(date.getHours() - 12);
        timeStrings.push(date.getMinutes());
        timeStrings.push("PM");
    } else {
        timeStrings.push(date.getHours());
        timeStrings.push(date.getMinutes());
        timeStrings.push("AM");
    };

    // construct date time string
    var dateTimeString = dateStrings.join("/") + " " + timeStrings[0] + ":" + timeStrings[1] + " " + timeStrings[2];
    
    datetimeEl.textContent = dateTimeString;
}

// function to save to local storage
function saveToLocal(type, obj) {
    if (type === "location") {
        localStorage.setItem(type, JSON.stringify(obj));
    } else if (type === "datetime") {
        localStorage.setItem(type, JSON.stringify(obj.getTime()));
    };
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
    } else if (type === "datetime") {
        // default to today's date
        saveToLocal(type, Date.now());
    }
};

// event listeners
//Function to toggle dark mode
darkModeEl.addEventListener("click", function () {
    document.body.classList.toggle("dark-theme");
});
locationBtnEl.addEventListener("click", function () {
    var location = "";
    // verify text inputs are not empty and contain no numbers
    if (cityInputEl.value && !cityInputEl.value.match(/\d/) && stateInputEl.value && !stateInputEl.value.match(/\d/)) {
        location = cityInputEl.value.trim() + ", " + stateInputEl.value.trim().toUpperCase();
        // format location as latitude/longitude
        formatLocation(location);
        // calculate and display if planets are above horizon
        requestPlanetData(loadFromLocal("location"));
        // update weather, sun/moon cycles
        requestWeatherData(true);
        // update where and when location text
        updateLocationText(cityInputEl.value, stateInputEl.value);
        // clear input value
        cityInputEl.value = "";
        stateInputEl.value = "";
    };
});
dateBtnEl.addEventListener("click", function () {
    // verify dateTime isn't empty
    if (dateInputEl.value) {
        saveToLocal("datetime", new Date(dateInputEl.value));
        // calculate and display if planets are above horizon
        requestPlanetData(loadFromLocal("location"));
        // update weather, sun/moon cycles
        requestWeatherData(true);
        // update view time in where and when
        updateDateText();
        // clear input value
        dateInputEl.value = "";
    };
});

// on load function calls
// calculate and display if planets are above horizon
requestPlanetData(loadFromLocal("location"));
// update weather, sun/moon cycles
requestWeatherData(false);
// set datetime input default value as current date and time
setDateInputDefault();
// set datetime input min and max dates that can be selected
setMinMaxDates();
// update view time in where and when
updateDateText();
