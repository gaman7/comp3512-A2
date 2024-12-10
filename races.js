const API_DOMAIN = "https://www.randyconnolly.com/funwebdev/3rd/api/f1";  
  
async function loadRaces() {  
  const selectedSeason = sessionStorage.getItem("selectedSeason");  
  if (!selectedSeason) {  
   window.location.href = "index.html";  
   return;  
  }  
  
  const racesList = document.getElementById("racesList");  
  const racesTitle = document.getElementById("race_title");  
  const cachedRaces = localStorage.getItem(races_${selectedSeason});  
  racesTitle.innerHTML = ${selectedSeason} Races;  
  
  let races;  
  if (cachedRaces) {  
   races = JSON.parse(cachedRaces);  
  } else {  
   const response = await fetch(${API_DOMAIN}/races.php?season=${selectedSeason});  
   races = await response.json();  
   localStorage.setItem(races_${selectedSeason}, JSON.stringify(races));  
  }  
  
  racesList.innerHTML = "";  
  races.forEach((race) => {  
   const li = document.createElement("li");  
   li.textContent = ${race.round}. ${race.name};  
   li.setAttribute("data-race-id", race.id);  
   const li1 = document.createElement("li");  
  
   const button = document.createElement("button");  
   button.className = "btn-small";  
   button.textContent = "Results";  
   button.onclick = () => loadRaceDetails(race.id, race.name, race.date);  
  
   li1.appendChild(button);  
   racesList.appendChild(li);  
   racesList.appendChild(li1);  
  });  
}  
  
async function loadRaceDetails(raceId, raceName, raceDate) {  
  const qualifyingContainer = document.getElementById("qualifyingContainer");  
  const resultsContainer = document.getElementById("resultsContainer");  
  
  const [qualifying, results, race] = await Promise.all([  
   fetch(${API_DOMAIN}/qualifying.php?race=${raceId}).then((res) => res.json()),  
   fetch(${API_DOMAIN}/results.php?race=${raceId}).then((res) => res.json()),  
   fetch(${API_DOMAIN}/races.php?id=${raceId}).then((res) => res.json()),  
  ]);  
  
  const circuitName = race[0].circuit.name;  
  
  // Store data in sessionStorage  
  sessionStorage.setItem(qualifying_${raceId}, JSON.stringify(qualifying));  
  sessionStorage.setItem(results_${raceId}, JSON.stringify(results));  
  sessionStorage.setItem(circuitName_${raceId}, circuitName);  
  
  sessionStorage.setItem("raceId", raceId);  
  
  // Extract and store the fixed podium (top 3 results)  
  const podiumFixed = results.slice(0, 3);  
  sessionStorage.setItem(results_${raceId}_podium, JSON.stringify(podiumFixed));  
  
  // Render the tables  
  renderQualifyingTable(raceId, qualifying, circuitName);  
  renderResultsTable(raceId, results, podiumFixed, circuitName);  
}

  
// Utility functions for favorites  
function toggleFavorite(type, id) {  
  const storageKey = favorite${capitalizeFirstLetter(type)}s;  
  let favorites = JSON.parse(localStorage.getItem(storageKey)) || [];  
  const index = favorites.indexOf(id);  
  if (index === -1) {  
   favorites.push(id);  
  } else {  
   favorites.splice(index, 1);  
  }  
  localStorage.setItem(storageKey, JSON.stringify(favorites));  
  
  // Update the tables to reflect the change  
  updateTables();  
}  
  
function isFavorite(type, id) {  
  const storageKey = favorite${capitalizeFirstLetter(type)}s;  
  let favorites = JSON.parse(localStorage.getItem(storageKey)) || [];  
  return favorites.includes(id);  
}  
  
function capitalizeFirstLetter(string) {  
  return string.charAt(0).toUpperCase() + string.slice(1);  
}  
  
function updateTables() {  
  const raceId = sessionStorage.getItem("raceId");  
  if (raceId) {  
   const qualifying = JSON.parse(sessionStorage.getItem(qualifying_${raceId})) || [];  
   const results = JSON.parse(sessionStorage.getItem(results_${raceId})) || [];  
   const podiumFixed = JSON.parse(sessionStorage.getItem(results_${raceId}_podium)) || [];  
   const circuitName = sessionStorage.getItem(circuitName_${raceId});  
  
   renderQualifyingTable(raceId, qualifying, circuitName);  
   renderResultsTable(raceId, results, podiumFixed, circuitName);  
  }  
}  
  
function renderQualifyingTable(raceId, qualifying, circuitName) {  
  const qualifyingContainer = document.getElementById("qualifyingContainer");  
  qualifyingContainer.innerHTML = `  
   <h2>Qualifying Results</h2>  
   <table>  
    <thead>  
      <tr>  
       <th onclick="sortTable('qualifying_${raceId}', 'position')">Pos</th>  
       <th onclick="sortTable('qualifying_${raceId}', 'driverName')">Name</th>  
       <th onclick="sortTable('qualifying_${raceId}', 'constructorName')">Constructor</th>  
       <th>Circuit</th>  
       <th onclick="sortTable('qualifying_${raceId}', 'q1')">Q1</th>  
       <th onclick="sortTable('qualifying_${raceId}', 'q2')">Q2</th>  
       <th onclick="sortTable('qualifying_${raceId}', 'q3')">Q3</th>  
      </tr>  
    </thead>  
    <tbody>  
      ${qualifying  
       .map((q) => {  
        const isFavDriver = isFavorite('driver', q.driver.id);  
        const driverStar = isFavDriver ? '★' : '☆';  
  
        const isFavConstructor = isFavorite('constructor', q.constructor.id);  
        const constructorStar = isFavConstructor ? '★' : '☆';  
  
        const isFavCircuit = isFavorite('circuit', raceId);  
        const circuitStar = isFavCircuit ? '★' : '☆';  
  
        return `  
          <tr>  
           <td>${q.position}</td>  
           <td>  
            <span onclick="toggleFavorite('driver', ${q.driver.id})" style="cursor:pointer;">${driverStar}</span>  
            <a onclick="showDriverModal('${q.driver.id}','${q.driver.ref}','${q.race.year}','${q.q2}')">${q.driver.forename} ${q.driver.surname}</a>  
           </td>  
           <td>  
            <span onclick="toggleFavorite('constructor', ${q.constructor.id})" style="cursor:pointer;">${constructorStar}</span>  
            <a onclick="showConstructorModal('${q.constructor.id}','${q.constructor.ref}','${q.race.year}')">${q.constructor.name}</a>  
           </td>  
           <td>  
            <span onclick="toggleFavorite('circuit', ${raceId})" style="cursor:pointer;">${circuitStar}</span>  
            ${circuitName}  
           </td>  
           <td>${q.q1}</td>  
           <td>${q.q2}</td>  
           <td>${q.q3}</td>  
          </tr>  
        `;  
       })  
       .join('')}  
    </tbody>  
   </table>  
  `;  
}  
  
function renderResultsTable(raceId, results, podiumFixed, circuitName) {  
  const resultsContainer = document.getElementById("other-results");  
  const podium = document.querySelector('.podium');  
  podium.innerHTML = '';  
  podiumFixed.forEach((result) => {  
   const isFavDriver = isFavorite('driver', result.driver.id);  
   const driverStar = isFavDriver ? '★' : '☆';  
   const box = document.createElement('div');  
   box.classList.add('race-card', result.position === 1 ? 'first' : result.position === 2 ? 'second' : 'third');  
   box.innerHTML = `  
    <span onclick="toggleFavorite('driver', ${result.driver.id});" style="cursor:pointer;">${driverStar}</span>  
    ${result.driver.forename} ${result.driver.surname} <br><br/> ${result.position} ${result.position === 1 ? 'ST' : result.position === 2 ? 'ND' : 'RD'}  
   `;  
   podium.appendChild(box);  
  });  
  resultsContainer.innerHTML = `  
   <h2>Race Results</h2>  
   <table>  
    <thead>  
      <tr>  
       <th onclick="sortTable('results_${raceId}', 'position')">Pos</th>  
       <th onclick="sortTable('results_${raceId}', 'driverName')">Name</th>  
       <th onclick="sortTable('results_${raceId}', 'constructorName')">Constructor</th>  
       <th>Circuit</th>  
       <th onclick="sortTable('results_${raceId}', 'laps')">Laps</th>  
       <th onclick="sortTable('results_${raceId}', 'points')">Points</th>  
      </tr>  
    </thead>  
    <tbody>  
      ${results  
       .map((r) => {  
        const isFavDriver = isFavorite('driver', r.driver.id);  
        const driverStar = isFavDriver ? '★' : '☆';  
  
        const isFavConstructor = isFavorite('constructor', r.constructor.id);  
        const constructorStar = isFavConstructor ? '★' : '☆';  
  
        const isFavCircuit = isFavorite('circuit', raceId);  
        const circuitStar = isFavCircuit ? '★' : '☆';  
  
        return `  
          <tr>  
           <td>${r.position}</td>  
           <td>  
            <span onclick="toggleFavorite('driver', ${r.driver.id})" style="cursor:pointer;">${driverStar}</span>  
            <a onclick="showDriverModal('${r.driver.id}','${r.driver.ref}','${r.race.year}','${r.points}')">${r.driver.forename} ${r.driver.surname}</a>  
           </td>  
           <td>  
            <span onclick="toggleFavorite('constructor', ${r.constructor.id})" style="cursor:pointer;">${constructorStar}</span>  
            <a onclick="showConstructorModal('${r.constructor.id}','${r.constructor.ref}','${r.race.year}')">${r.constructor.name}</a>  
           </td>  
           <td>  
            <span onclick="toggleFavorite('circuit', ${raceId})" style="cursor:pointer;">${circuitStar}</span>  
            ${circuitName}  
           </td>  
           <td>${r.laps}</td>  
           <td>${r.points}</td>  
          </tr>  
        `;  
       })  
       .join('')}  
    </tbody>  
   </table>  
  `;  
}

  
function sortTable(storageKey, columnKey) {  
  // Retrieve the data from sessionStorage  
  const data = JSON.parse(sessionStorage.getItem(storageKey));  
  
  // Determine the sort order (ascending/descending)  
  const currentOrder = sessionStorage.getItem(${storageKey}_sortOrder);  
  const newOrder = currentOrder === "asc" ? "desc" : "asc";  
  sessionStorage.setItem(${storageKey}_sortOrder, newOrder);  
  
  // Sort the data based on the column key  
  const sortedData = data.sort((a, b) => {  
   const valueA = getSortableValue(a, columnKey);  
   const valueB = getSortableValue(b, columnKey);  
  
   if (newOrder === "asc") {  
    return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;  
   } else {  
    return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;  
   }  
  });  
  
  // Load fixed podium  
  const raceId = sessionStorage.getItem("raceId");  
  const fixedPodium = JSON.parse(sessionStorage.getItem(results_${raceId}_podium));  
  const circuitName = sessionStorage.getItem(circuitName_${raceId});  
  
  // Re-render the table  
  if (storageKey.startsWith("qualifying")) {  
   renderQualifyingTable(storageKey.split("_")[1], sortedData, circuitName);  
  } else if (storageKey.startsWith("results")) {  
   renderResultsTable(storageKey.split("_")[1], sortedData, fixedPodium, circuitName);  
  }  
  
  updateSortIcons(storageKey, columnKey, newOrder);  
}  
  
function updateSortIcons(storageKey, columnKey, newOrder) {  
  // Get all table header elements  
  const headers = document.querySelectorAll(th[onclick="sortTable('${storageKey}', '${columnKey}')"]);  
  
  // Clear all previous icons  
  headers.forEach((header) => {  
   header.innerHTML = header.innerHTML.replace(/↑|↓/, ""); // Remove any previous sort icons  
  });  
  
  // Add the new icon based on the sort order  
  const icon = newOrder === "asc" ? "↑" : "↓";  
  headers.forEach((header) => {  
   if (header.getAttribute("onclick").includes(columnKey)) {  
    header.innerHTML += ` ${icon}`;  
   }  
  });  
}  
  
function getSortableValue(item, key) {  
  // Handle custom keys for driverName and constructorName  
  if (key === "driverName") {  
   return ${item.driver.forename} ${item.driver.surname};  
  }  
  if (key === "constructorName") {  
   return item.constructor.name;  
  }  
  return item[key];  
}  
  
function showDriverModal(driverId, driverRef, seasonYear, points) {  
  const driverDetailsUrl = https://www.randyconnolly.com/funwebdev/3rd/api/f1/drivers.php?id=${driverId};  
  const driverResultsUrl = https://www.randyconnolly.com/funwebdev/3rd/api/f1/driverResults.php?driver=${driverRef}&season=${seasonYear};  
  const resultsApiUrl = https://www.randyconnolly.com/funwebdev/3rd/api/f1/results.php?id=${driverId};  
  
  // Set placeholders while data loads  
  document.getElementById('driverName').innerText = 'Loading...';  
  document.getElementById('driverDOB').innerText = 'Loading...';  
  document.getElementById('driverAge').innerText = 'Loading...';  
  document.getElementById('driverNationality').innerText = 'Loading...';  
  document.getElementById('driverResults').innerHTML = '<tr><td colspan="4">Loading results...</td></tr>';  
  const driverURLAnchor = document.getElementById('driverURL');  
  driverURLAnchor.href = '#';  
  driverURLAnchor.innerText = 'Loading...';  
  
  // Fetch driver details  
  fetch(driverDetailsUrl)  
   .then((response) => {  
    if (!response.ok) throw new Error(Failed to fetch driver details: ${response.status});  
    return response.json();  
   })  
   .then((driver) => {  
    const driverName = ${driver.forename} ${driver.surname};  
    document.getElementById('driverName').innerText = driverName;  
  
    document.getElementById('driverDOB').innerText = driver.dob || 'N/A';  
    document.getElementById('driverAge').innerText = calculateAge(driver.dob) || 'N/A';  
    document.getElementById('driverNationality').innerText = driver.nationality || 'N/A';  
  
    if (driver.url) {  
      driverURLAnchor.href = driver.url;  
      driverURLAnchor.innerText = "Wikipedia";  
    } else {  
      driverURLAnchor.innerText = "No URL Available";  
    }  
  
    const imageUrl = https://placehold.co/600x400?text=${encodeURIComponent(driverName)};  
    document.getElementById('driverImage').src = imageUrl;  
   })  
   .catch((error) => {  
    console.error('Error fetching driver details:', error);  
    document.getElementById('driverName').innerText = 'Error loading driver details';  
   });  
  
  // Fetch race results to extract points  
  fetch(resultsApiUrl)  
   .then((response) => {  
    if (!response.ok) throw new Error(Failed to fetch race results: ${response.status});  
    return response.json();  
   })  
   .then((results) => {  
    if (results.length > 0) {  
      const resultsHtml = results  
       .sort((a, b) => a.round - b.round)  
       .map(  
        (result) => `  
          <tr>  
           <td>${result.round}</td>  
           <td>${result.name}</td>  
           <td>${result.positionOrder || 'N/A'}</td>  
           <td>${result.points || 'N/A'}</td>  
          </tr>`  
       )  
       .join('');  
      document.getElementById('driverResults').innerHTML = resultsHtml;  
    } else {  
      document.getElementById('driverResults').innerHTML = '<tr><td colspan="4">No results found.</td></tr>';  
    }  
   })  
   .catch((error) => {  
    console.error('Error fetching race results:', error);  
    document.getElementById('driverResults').innerHTML = '<tr><td colspan="4">Error loading results.</td></tr>';  
   });  
  
  // Display the modal  
  document.getElementById('driverModal').style.display = 'block';  
}  
  
function renderQualifyingTable(raceId, qualifying, circuitName) {  
  const qualifyingContainer = document.getElementById("qualifyingContainer");  
  qualifyingContainer.innerHTML = `  
   <h2>Qualifying Results</h2>  
   <table>  
    <thead>  
      <tr>  
       <th onclick="sortTable('qualifying_${raceId}', 'position')">Pos</th>  
       <th onclick="sortTable('qualifying_${raceId}', 'driverName')">Name</th>  
       <th onclick="sortTable('qualifying_${raceId}', 'constructorName')">Constructor</th>  
       <th>Circuit</th>  
       <th onclick="sortTable('qualifying_${raceId}', 'q1')">Q1</th>  
       <th onclick="sortTable('qualifying_${raceId}', 'q2')">Q2</th>  
       <th onclick="sortTable('qualifying_${raceId}', 'q3')">Q3</th>  
      </tr>  
    </thead>  
    <tbody>  
      ${qualifying  
       .map((q) => {  
        const isFavDriver = isFavorite('driver', q.driver.id);  
        const driverStar = isFavDriver ? '★' : '☆';  
  
        const isFavConstructor = isFavorite('constructor', q.constructor.id);  
        const constructorStar = isFavConstructor ? '★' : '☆';  
  
        const isFavCircuit = isFavorite('circuit', raceId);  
        const circuitStar = isFavCircuit ? '★' : '☆';  
  
        return `  
          <tr>  
           <td>${q.position}</td>  
           <td>  
            <span onclick="toggleFavorite('driver', ${q.driver.id})" style="cursor:pointer;">${driverStar}</span>  
            <a onclick="showDriverModal('${q.driver.id}','${q.driver.ref}','${q.race.year}','${q.q2}')">${q.driver.forename} ${q.driver.surname}</a>  
           </td>  
           <td>  
            <span onclick="toggleFavorite('constructor', ${q.constructor.id})" style="cursor:pointer;">${constructorStar}</span>  
            <a onclick="showConstructorModal('${q.constructor.id}','${q.constructor.ref}','${q.race.year}')">${q.constructor.name}</a>  
           </td>  
           <td>  
            <span onclick="toggleFavorite('circuit', ${raceId})" style="cursor:pointer;">${circuitStar}</span>  
            <a onclick="showCircuitModalFromAPI('${raceId}')">${circuitName}</a>  
           </td>  
           <td>${q.q1}</td>  
           <td>${q.q2}</td>  
           <td>${q.q3}</td>  
          </tr>  
        `;  
       })  
       .join('')}  
    </tbody>  
   </table>  
  `;  
}  
  
function renderResultsTable(raceId, results, fixedPodium, circuitName) {  
  const resultsContainer = document.getElementById("other-results");  
  const podium = document.querySelector('.podium');  
  podium.innerHTML = '';  
  fixedPodium.forEach((result) => {  
   const isFavDriver = isFavorite('driver', result.driver.id);  
   const driverStar = isFavDriver ? '★' : '☆';  
   const box = document.createElement('div');  
   box.classList.add('race-card', result.position === 1 ? 'first' : result.position === 2 ? 'second' : 'third');  
   box.innerHTML = `  
    <span onclick="toggleFavorite('driver', ${result.driver.id});" style="cursor:pointer;">${driverStar}</span>  
    ${result.driver.forename} ${result.driver.surname} <br><br/> ${result.position} ${result.position === 1 ? 'ST' : result.position === 2 ? 'ND' : 'RD'}  
   `;  
   podium.appendChild(box);  
  });  
  resultsContainer.innerHTML = `  
   <h2>Race Results</h2>  
   <table>  
    <thead>  
      <tr>  
       <th onclick="sortTable('results_${raceId}', 'position')">Pos</th>  
       <th onclick="sortTable('results_${raceId}', 'driverName')">Name</th>  
       <th onclick="sortTable('results_${raceId}', 'constructorName')">Constructor</th>  
       <th>Circuit</th>  
       <th onclick="sortTable('results_${raceId}', 'laps')">Laps</th>  
       <th onclick="sortTable('results_${raceId}', 'points')">Points</th>  
      </tr>  
    </thead>  
    <tbody>  
      ${results  
       .map((r) => {  
        const isFavDriver = isFavorite('driver', r.driver.id);  
        const driverStar = isFavDriver ? '★' : '☆';  
  
        const isFavConstructor = isFavorite('constructor', r.constructor.id);  
        const constructorStar = isFavConstructor ? '★' : '☆';  
  
        const isFavCircuit = isFavorite('circuit', raceId);  
        const circuitStar = isFavCircuit ? '★' : '☆';  
  
        return `  
          <tr>  
           <td>${r.position}</td>  
           <td>  
            <span onclick="toggleFavorite('driver', ${r.driver.id})" style="cursor:pointer;">${driverStar}</span>  
            <a onclick="showDriverModal('${r.driver.id}','${r.driver.ref}','${r.race.year}','${r.points}')">${r.driver.forename} ${r.driver.surname}</a>  
           </td>  
           <td>  
            <span onclick="toggleFavorite('constructor', ${r.constructor.id})" style="cursor:pointer;">${constructorStar}</span>  
            <a onclick="showConstructorModal('${r.constructor.id}','${r.constructor.ref}','${r.race.year}')">${r.constructor.name}</a>  
           </td>  
           <td>  
            <span onclick="toggleFavorite('circuit', ${raceId})" style="cursor:pointer;">${circuitStar}</span>  
            <a onclick="showCircuitModalFromAPI('${raceId}')">${circuitName}</a>  
           </td>  
           <td>${r.laps}</td>  
           <td>${r.points}</td>  
          </tr>  
        `;  
       })  
       .join('')}  
    </tbody>  
   </table>  
  `;  
}  
  
function calculateAge(dob) {  
  if (!dob) return 'N/A';  
  const birthDate = new Date(dob);  
  const today = new Date();  
  let age = today.getFullYear() - birthDate.getFullYear();  
  const m = today.getMonth() - birthDate.getMonth();  
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {  
   age--;  
  }  
  return age;  
}  
  
function closeModal(modalId) {  
  document.getElementById(modalId).style.display = 'none';  
}  
  
function showConstructorModal(constructorId, constructorRef, seasonYear) {  
  const constructorDetailsUrl = https://www.randyconnolly.com/funwebdev/3rd/api/f1/constructors.php?id=${constructorId};  
  const constructorResultsUrl = https://www.randyconnolly.com/funwebdev/3rd/api/f1/constructorResults.php?constructor=${constructorRef}&season=${seasonYear};  
  
  // Set placeholders while data loads  
  document.getElementById('constructorName').innerText = 'Loading...';  
  document.getElementById('constructorNationality').innerText = 'Loading...';  
  document.getElementById('constructorURL').innerText = 'Loading...';  
  document.getElementById('constructorResults').innerHTML = '<tr><td colspan="4">Loading results...</td></tr>';  
  
  // Fetch constructor details  
  fetch(constructorDetailsUrl)  
   .then((response) => response.json())  
   .then((constructor) => {  
    document.getElementById('constructorName').innerHTML = constructor.name;  
  
    // Add favorite star logic  
    const isFavConstructor = isFavorite('constructor', constructorId);  
    const constructorStar = isFavConstructor ? '★' : '☆';  
    const favoriteStar = document.createElement('span');  
    favoriteStar.innerHTML = constructorStar;  
    favoriteStar.style.cursor = 'pointer';  
    favoriteStar.style.marginLeft = '10px';  
    favoriteStar.onclick = () => {  
      toggleFavorite('constructor', constructorId);  
      favoriteStar.innerHTML = isFavorite('constructor', constructorId) ? '★' : '☆';  
    };  
    document.getElementById('constructorName').appendChild(favoriteStar);  
  
    document.getElementById('constructorNationality').innerText = constructor.nationality || 'N/A';  
    document.getElementById('constructorURL').href = constructor.url;  
    document.getElementById('constructorURL').innerText = 'Wikipedia';  
   })  
   .catch((error) => {  
    console.error('Error fetching constructor details:', error);  
    document.getElementById('constructorName').innerText = 'Error loading constructor details';  
   });  
  
  // Fetch constructor race results  
  fetch(constructorResultsUrl)  
   .then((response) => response.json())  
   .then((results) => {  
    if (results.length > 0) {  
      const groupedResults = groupByRound(results);  
      const resultsHtml = Object.entries(groupedResults)  
       .map(  
        ([round, entries]) => `  
          <tr>  
           <td rowspan="${entries.length}">${round}</td>  
           <td rowspan="${entries.length}">${entries[0].name}</td>  
           ${entries  
            .map(  
              (entry, index) => `  
            ${index > 0 ? '<tr>' : ''}  
              <td>${entry.forename} ${entry.surname}</td>  
              <td>${entry.positionOrder || 'N/A'}</td>  
            </tr>  
           `  
            )  
            .join('')}  
          </tr>  
        `  
       )  
       .join('');  
      document.getElementById('constructorResults').innerHTML = resultsHtml;  
    } else {  
      document.getElementById('constructorResults').innerHTML = '<tr><td colspan="4">No results found.</td></tr>';  
    }  
   })  
   .catch((error) => {  
    console.error('Error fetching constructor results:', error);  
    document.getElementById('constructorResults').innerHTML = '<tr><td colspan="4">Error loading results.</td></tr>';  
   });  
  
  // Show the modal  
  document.getElementById('constructorModal').style.display = 'block';  
}  
  
function groupByRound(results) {  
  return results.reduce((grouped, result) => {  
   const { round } = result;  
   if (!grouped[round]) {  
    grouped[round] = [];  
   }  
   grouped[round].push(result);  
   return grouped;  
  }, {});  
}  
  
function showCircuitModalFromAPI(raceId) {  
  const apiUrl = https://www.randyconnolly.com/funwebdev/3rd/api/f1/races.php?id=${raceId};  
  
  // Fetch data from the API  
  fetch(apiUrl)  
   .then((response) => {  
    if (!response.ok) {  
      throw new Error(API call failed with status ${response.status});  
    }  
    return response.json();  
   })  
   .then((data) => {  
    if (data && data.length > 0) {  
      const circuit = data[0].circuit;  
  
      // Populate the modal with circuit details  
      const circuitModal = document.getElementById("circuit-modal");  
  
      document.getElementById("circuit-name").innerHTML = circuit.name || "N/A";  
  
      // Add favorite star logic  
      const isFavCircuit = isFavorite('circuit', raceId);  
      const circuitStar = isFavCircuit ? '★' : '☆';  
      const favoriteStar = document.createElement('span');  
      favoriteStar.innerHTML = circuitStar;  
      favoriteStar.style.cursor = 'pointer';  
      favoriteStar.style.marginLeft = '10px';  
      favoriteStar.onclick = () => {  
       toggleFavorite('circuit', raceId);  
       favoriteStar.innerHTML = isFavorite('circuit', raceId) ? '★' : '☆';  
      };  
      document.getElementById('circuit-name').appendChild(favoriteStar);  
  
      document.getElementById("circuit-location").textContent = circuit.location || "N/A";  
      document.getElementById("circuit-country").textContent = circuit.country || "N/A";  
  
      const circuitUrl = document.getElementById("circuit-url");  
      circuitUrl.href = circuit.url || "#";  
      circuitUrl.textContent = circuit.url ? "Wikipedia" : "No URL available";  
  
      // Set circuit image (use a placeholder if no image URL is provided)  
      const circuitImage = document.querySelector("#circuit-image img");  
      circuitImage.src = https://placehold.co/600x400?text=${encodeURIComponent(circuit.name || "Circuit")};  
      circuitImage.alt = circuit.name ? ${circuit.name} Image : "Placeholder Image";  
  
      // Display the modal  
      circuitModal.style.display = "block";  
  
      // Add close functionality  
      const closeModal = document.getElementById("circuit-modal-close");  
      closeModal.onclick = () => (circuitModal.style.display = "none");  
  
      // Close modal when clicking outside the modal content  
      window.onclick = (event) => {  
       if (event.target === circuitModal) {  
        circuitModal.style.display = "none";  
       }  
      };  
    } else {  
      console.error("No data returned from the API");  
    }  
   })  
   .catch((error) => {  
    console.error("Error fetching circuit data:", error);  
   });  
}  
  
function closeModal(modalId) {  
  const modal = document.getElementById(modalId);  
  modal.style.display = "none";  
}  
  
function goHome() {  
  window.location.href = "index.html";  
}  
  
// Initialize  
document.addEventListener("DOMContentLoaded", loadRaces);