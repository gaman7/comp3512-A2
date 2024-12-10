const API_BASE = "https://www.randyconnolly.com/funwebdev/3rd/api/f1";

const startYear = 2020;
const endYear = 2023;
const seasonSelect = document.getElementById('seasonSelect');

// Populate the season select dropdown
for (let year = startYear; year <= endYear; year++) {
   const option = document.createElement('option');
   option.value = year;
   option.textContent = year;
   seasonSelect.appendChild(option);
}

document.addEventListener("DOMContentLoaded", () => {
   const goButton = document.querySelector(".btn-cta");
   const logo = document.querySelector(".logo");

   goButton.addEventListener("click", async () => {
       console.log("Go button clicked.");
       const selectedSeason = seasonSelect.value;
       if (!selectedSeason) {
           alert("Please select a season before proceeding.");
           return;
       }
       console.log(`Selected season: ${selectedSeason}`);
       sessionStorage.setItem("selectedSeason", selectedSeason);

       // Fetch and store all data for the season
       await fetchAllSeasonData(selectedSeason);

       showRacesView();
   });

   logo.addEventListener("click", () => {
       showHomeView();
   });
});

// Switch to Races View
function showRacesView() {
   console.log("Switching to Races View.");
   document.getElementById("homeView").classList.remove("active");
   document.getElementById("racesView").classList.add("active");
}

// Switch to Home View
function showHomeView() {
   console.log("Switching to Home View.");
   document.getElementById("racesView").classList.remove("active");
   document.getElementById("homeView").classList.add("active");
}

// Fetch all season data and store in localStorage
async function fetchAllSeasonData(season) {
   try {
       console.log(`Fetching data for season ${season}...`);

       // Fetch races
       const racesResponse = await fetch(`${API_BASE}/races.php?season=${season}`);
       const races = await racesResponse.json();
       localStorage.setItem(`season_${season}_races`, JSON.stringify(races));

       // Fetch results
       const resultsResponse = await fetch(`${API_BASE}/results.php?season=${season}`);
       const results = await resultsResponse.json();
       localStorage.setItem(`season_${season}_results`, JSON.stringify(results));

       // Fetch qualifying results
       const qualifyingResponse = await fetch(`${API_BASE}/qualifying.php?season=${season}`);
       const qualifying = await qualifyingResponse.json();
       localStorage.setItem(`season_${season}_qualifying`, JSON.stringify(qualifying));

       console.log("All data fetched and stored in localStorage.");
   } catch (error) {
       console.error("Error fetching season data:", error);
   }
}
