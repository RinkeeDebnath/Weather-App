const searchBtn = document.querySelector("#search-btn");

const global = {
    apiUrl: "https://api.openweathermap.org/data/2.5/forecast?q=",
    apiKey: "e8b63d169df335860310926e3539f43c",
};

const map = L.map('map').setView([0, 0], 2);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

const marker = L.marker([0, 0]).addTo(map);

navigator.geolocation.getCurrentPosition(function (pos) {
  var lat = pos.coords.latitude;
  var lng = pos.coords.longitude;

  marker.setLatLng([lat, lng]).update();
  map.setView([lat, lng], 13);

  marker.bindPopup('<strong>Hello World</strong> <br> This is my location');
});

// Fetch Weather data by city Name
async function fetchData(cityName) {
  const response = await fetch(
    `${global.apiUrl}${cityName}&appid=${global.apiKey}&units=metric`
  );

  if (response.status === 404) {
    alert("City Not found. Kindly, spell correctly.");
  } else {
  const data = await response.json();
    clearUI();
    displayCityTempDetails(data);
    displaySpecialInfo(data);
    displayMapdata(data);
    forecastWeather(data);
    animatetomorrowsForeCast();
  }
}

// Animation for tomorrows weather
function animatetomorrowsForeCast(){
  let boxes =  document.querySelectorAll(`#tomorrows-forecast .report`);

  const style = document.createElement('style');
    style.innerHTML = `
        @keyframes slidetomorrowUp {
            0% {
                transform: translateY(0);
            }
            100% {
                transform: translateY(calc(-143px * ${boxes.length - 1})); /* Adjust the number of divs */
            }
        }
    `;
  document.head.appendChild(style);

  boxes.forEach((box, index) => {
      box.style.animation = `slidetomorrowUp 20s alternate infinite`;
});
}

// Display City Temperature details
async function displayCityTempDetails(data) {
  const sunrise = new Date(data.city.sunrise * 1000);
  const sunset = new Date(data.city.sunset * 1000);

  document.querySelector("#city-name").textContent = `${data.city.name}`;
  document.querySelector("#tempInC").textContent = `${data.list[0].main.temp}° C`;
  document.querySelector(".sunrise strong").textContent = `${sunrise.getHours()} : ${sunrise.getMinutes()} AM`;
  document.querySelector(".sunset strong").textContent = `${sunset.getHours()} : ${sunset.getMinutes()} PM`;
  document.querySelector(".humidity strong").textContent = `${sunrise.getHours()} : ${data.list[0].main.humidity} %`;
  document.querySelector(".wind strong").textContent = `${data.list[0].wind.speed} Km/h`;
  document.querySelector(".pressure strong").textContent = `${data.list[0].main.pressure} mb`;
  document.querySelector(".visibility strong").textContent = `${data.list[0].visibility / 1000} Km`;

}

// Display Special Info
async function displaySpecialInfo(data) {
  const weatherDesc = data.list[0].weather[0].main;
    document.querySelector("#weather-desc").textContent = `${data.list[0].weather[0].description}`;
    document.querySelector("#temp-summary").textContent = `${Math.round(data.list[0].main.temp_max)}° / ${Math.round(
        data.list[0].main.temp_min
      )}° Feels like ${Math.round(data.list[0].main.feels_like)}° C`;

    switch(weatherDesc){
      case "Clear":
        document.getElementById("weatherIcon").innerHTML = `<i class="ri-sun-line"></i>`;
        break;
      case "Clouds":
        document.getElementById("weatherIcon").innerHTML = `<i class="ri-cloud-line"></i>`;
        break;

      case "Rain":
        document.getElementById("weatherIcon").innerHTML = `<i class="ri-rainy-line"></i>`;
        break;
      default:
        document.getElementById("weatherIcon").innerHTML = `<i class="ri-thunderstorms-line"></i>`;
    }
}

// Display geological data
async function displayMapdata(data) {
    lat = data.city.coord.lat;
    lng = data.city.coord.lon;
  
    marker.setLatLng([lat, lng]).update();
    map.setView([lat, lng], 13);
  
    marker.bindPopup(`<strong>${lat}, ${lng}</strong>`);

    document.getElementById("latLong").innerHTML = `${data.city.name} - Lat: ${lat}, Long: ${lng}`;
  };


  // Display Upcoming Weather Reports
  function forecastWeather(data){
    const details = data.list;

    // Todays date
    let todaysDate = new Date();
    todaysDate = formatDate(todaysDate);
  
    // Tomorrows date
    let tomorrowsDate = new Date();
    tomorrowsDate.setDate(tomorrowsDate.getDate() + 1);
    tomorrowsDate = formatDate(tomorrowsDate);

    // Log Today's and tomorrow's weather details
    logDetails(details,todaysDate,"todays-forecast","forecast-reports");
    logDetails(details,tomorrowsDate,"tomorrows-forecast","forecast-reports");
  }

// Format Date
function formatDate(value){
  
  const year = value.toLocaleString("default",{year:"numeric"});
  const month = value.toLocaleString("default",{month:"2-digit"});
  const date = value.toLocaleString("default",{day:"2-digit"});

  const formattedDate = `${year}-${month}-${date}`;
  return formattedDate;
}

// Log Weather Details
function logDetails(array,date,divID,divClass){
  // Filter data based on dates
  const details = array.filter((item)=>{
  return item.dt_txt.includes(date);
  });

  // Looping through each data
  details.forEach((det)=>{
    const time = det.dt_txt.slice(11,16);
    const minTemp = det.main.temp_max;
    const maxTemp = det.main.temp_min;
    const weatherCondition = det.weather[0].main;

    const div = document.createElement("div");
    div.classList.add("report");

    div.innerHTML = `<h4>${time}</h4>
    <div class="details">
      <p>${minTemp}° C / ${maxTemp} ° C</p>
      <p> ${weatherCondition}</p>`;
    
    document.querySelector(`#${divID} .${divClass}`).appendChild(div);
  })
}

function clearUI(){
  document.querySelector("#todays-forecast .forecast-reports").innerHTML = "";
  document.querySelector("#tomorrows-forecast .forecast-reports").innerHTML = "";

  document.getElementById("cityWeatherDetails").style.display = "flex";
  document.getElementById("upcoming-forecast").style.display = "flex";
  document.getElementById("input-text").value = "";
}


// App Init
document.addEventListener("DOMContentLoaded",function(){
  document.getElementById("cityWeatherDetails").style.display = "none";
  document.getElementById("upcoming-forecast").style.display = "none";

})

searchBtn.addEventListener("click", () => {
  const city = document.getElementById("input-text").value;
  if (city === "") {
    alert("Please type city");
  } else {
    fetchData(city);
  }
});



