const API_BASE = "https://www.randyconnolly.com/funwebdev/3rd/api/f1";

const startYear = 2020;
const endYear = 2023;
const seasonSelect = document.getElementById("seasonSelect");

// Populate the season dropdown
for (let year = endYear; year >= startYear; year--) {
  const option = document.createElement("option");
  option.value = year;
  option.textContent = year;
  seasonSelect.appendChild(option);
}

// Function to show the Races view
function showRacesView() {
  const selectedSeason = sessionStorage.getItem("selectedSeason");
  if (selectedSeason) {
    document.getElementById("homeView").classList.remove("active");
    document.getElementById("racesView").classList.add("active");
  } else {
    alert("Please select a season and click 'Go' before proceeding.");
  }
}

async function handleGoButtonClick() {
  const season = seasonSelect.value;

  if (!season) {
    alert("Please select a season first.");
    return;
  }

  sessionStorage.setItem("selectedSeason", season);

  try {
    // Fetch and cache races for the season
    const response = await fetch(`${API_BASE}/races.php?season=${season}`);
    const races = await response.json();
    localStorage.setItem(`races_${season}`, JSON.stringify(races));

    // Fetch qualifying and results data for all races in the season
    for (const race of races) {
      // Fetch qualifying data
      const qualifyingResponse = await fetch(`${API_BASE}/qualifying.php?race=${race.id}`);
      const qualifying = await qualifyingResponse.json();
      localStorage.setItem(`qualifying_${race.id}`, JSON.stringify(qualifying));

      // Fetch results data
      const resultsResponse = await fetch(`${API_BASE}/results.php?race=${race.id}`);
      const results = await resultsResponse.json();
      localStorage.setItem(`results_${race.id}`, JSON.stringify(results));
    }

    // Navigate to the Races view
    showRacesView();
  } catch (error) {
    alert("Failed to fetch and cache season data. Please try again.");
    console.error(error);
  }
}



  
  
  // Function to switch to the Races View
  function switchToRacesView() {
    const season = localStorage.getItem("selectedSeason");
    if (season) {
      // Redirect or load the Races View
      showRacesView();
    } else {
      alert("Please select a season first.");
    }
  }
  