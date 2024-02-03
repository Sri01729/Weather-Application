'use strict';

(() => {
  window.addEventListener('load', (event) => {

    const temp = document.getElementById("temp");
    let latitude;
    let longitude;

    // initialize Leaflet
    var map = L.map('map').setView({ lon: 0, lat: 0 }, 2);

    // add the OpenStreetMap tiles
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    // show the scale bar on the lower left corner
    L.control.scale({ imperial: true, metric: true }).addTo(map);

    document.getElementById("weatherForm").addEventListener("submit", function (e) {
      e.preventDefault(); // Prevent the default form submission.

      // Get the location value from the form input
      const location = document.getElementById("location").value;

      geocodeLocation(location);

    });



    async function fetchData(apiEndPoint) {
      try {
        const response = await fetch(apiEndPoint);

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const responseData = await response.text(); // Read the response as text

        // Check if the response data is empty or doesn't start with '{' (indicating valid JSON).
        if (!responseData || responseData.trim().charAt(0) !== '{') {
          throw new Error('Invalid or empty JSON data received');
        }

        return JSON.parse(responseData);
      } catch (error) {
        console.error('Please check your network connection and try again.', error);
        throw error; // Re-throw the error to let the calling code handle it
      }
    }

    // API endpoint 1. Fetching the temperature for the input latitude and longitude
    async function fetchWeather(latitude, longitude) {
      try {
        const apiEndPoint = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m`;
        const data = await fetchData(apiEndPoint);

        console.log(data);
        const tempDiv = document.getElementById("temp");
        tempDiv.innerHTML = `<h2>
                        The temperature for the selected location is: <span style="font-weight:normal"> ${data.hourly.temperature_2m[0]}°C </span>
                        </h2>`;

      } catch (error) {
        throw new Error("Failed to fetch data. Please check your network connection and try again.");
      }
    }

    // API endpoint 2. Fetching the geo-location i.e., latitude and longitude based on the entered location
    async function geocodeLocation(location) {
      try {
        const apiEndPoint = `https://geocoding-api.open-meteo.com/v1/search?name=${location}`;
        const geocodingData = await fetchData(apiEndPoint);

        console.log(geocodingData);
        // Access the first result in the 'results' array
        const firstResult = geocodingData.results[0];

        // Extract latitude and longitude
        const latitude = firstResult.latitude;
        const longitude = firstResult.longitude;

        console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);

        // Call the fetchWeather function with the entered latitude and longitude.
        fetchWeather(latitude, longitude);
        // Call the marker function to mark the place of entered latitude and longitude.
        marker(latitude, longitude, location);
        // Call the forecast funtion to fetch 3 day forecast
        forecast(latitude, longitude);
        // Call the elevation function to fetch the elevaton of the location
        elevation(latitude, longitude);

      } catch (error) {
        throw new Error("Failed to fetch data. Please check your network connection and try again.");
      }
    }
    // API endpoint 3. Fetching the forecast data
    async function forecast(latitude, longitude) {
      try {
        const apiEndPoint = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m&forecast_days`;
        const forecastData = await fetchData(apiEndPoint);

        console.log(forecastData);

        // Extract the hourly temperature data
        const hourlyTemperature = forecastData.hourly.temperature_2m;

        // Assuming each day has 24 hours, you can split the array into days
        const hoursPerDay = 24;
        const numberOfDays = 4;
        const temperatureFor3Days = hourlyTemperature.slice(0, hoursPerDay * numberOfDays);

        console.log('Temperature for the next 3 days', temperatureFor3Days);

        const temperatureInfoDiv = document.getElementById("forecast");
        const temperatureAt0 = temperatureFor3Days[24];
        const temperatureAt24 = temperatureFor3Days[47];
        const temperatureAt71 = temperatureFor3Days[71];

        // Update the UI with temperature data
        temperatureInfoDiv.innerHTML = `
        <h2>Temperature for the next 3 days at 12:00 a.m. :</h2>
        <ul>
            <li>Temperature for day 1: ${temperatureAt0}°C</li>
            <li>Temperature for day 2: ${temperatureAt24}°C</li>
            <li>Temperature for day 3: ${temperatureAt71}°C</li>
        </ul>
    `;

      } catch (error) {
        throw new Error("Failed to fetch data. Please check your network connection and try again.");
      }
    }


    // Fetching the elevation of the location
    async function elevation(latitude, longitude) {
      try {
        const apiEndPoint = `https://api.open-meteo.com/v1/elevation?latitude=${latitude}&longitude=${longitude}`;
        const elevationData = await fetchData(apiEndPoint);

        console.log(elevationData);
        const elevationDiv = document.getElementById("elevation");
        elevationDiv.innerHTML = `<h2>Location Elevation: <span style="font-weight:normal">${elevationData['elevation']} </span></h2>`;

      } catch (error) {
        throw new Error("Failed to fetch data. Please check your network connection and try again.");
      }
    }

    //Makring the location on the map with a marker
    function marker(latitude, longitude, location) {
      // show a marker on the map
      L.marker([latitude, longitude]).bindPopup(location).addTo(map);
      map.setView([latitude, longitude], 10);

    }

  });
})();
