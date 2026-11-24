/* =====================================
   CAPITAL CONQUEST - 2D RELIEF MAP
   ===================================== */

// GAME VARIABLES

let map;
let countriesLayer;

let countryDataFeatures = [];
let countryNeighbors = {};
let capitalBank = {};

let countryLayersByName = {};

let selectedCountry = null;
let conqueredCountries = new Set();
let currentQuestionCountry = null;
let availableNeighbors = new Set();

let timeLeft = 60;
let timerInterval = null;
let gameStarted = false;
let score = 0;

const timerDisplay = document.getElementById("timer");
const scoreDisplay = document.getElementById("score");
const startButton = document.getElementById("start-btn");

const questionDisplay = document.getElementById("question");
const questionInfo = document.getElementById("question-info");
const answerButtons = document.querySelectorAll(".answer-btn");
const feedback = document.getElementById("feedback");

const mapContainer = document.getElementById("map");


// =====================================
// NEIGHBORS
// =====================================

function getAvailableNeighbors() {

    const available = new Set();

    const territories = gameStarted
        ? conqueredCountries
        : selectedCountry
            ? new Set([selectedCountry])
            : new Set();

    territories.forEach(function(countryName) {

        const neighbors = countryNeighbors[countryName] || [];

        neighbors.forEach(function(neighborName) {

            if (
                capitalBank[neighborName] &&
                !conqueredCountries.has(neighborName) &&
                neighborName !== selectedCountry
            ) {
                available.add(neighborName);
            }

        });

    });

    return available;
}


// =====================================
// COUNTRY COLORS
// =====================================

function getCountryColor(countryName) {

    if (countryName === currentQuestionCountry) {
        return "#D95F68";
    }

    if (conqueredCountries.has(countryName)) {
        return "#E5AD45";
    }

    if (!gameStarted && countryName === selectedCountry) {
        return "#E5AD45";
    }

    if (availableNeighbors.has(countryName)) {
        return "#269C83";
    }

    return "#526579";
}


// =====================================
// COUNTRY STYLE
// =====================================

function countryStyle(feature) {

    const name = feature.properties.name;

    return {
        fillColor: getCountryColor(name),
        fillOpacity: 0.48,
        color: "#263746",
        weight: 0.8,
        opacity: 0.9
    };

}


// =====================================
// CREATE 2D RELIEF MAP
// =====================================


// Haritanın gösterileceği alan: Antarktika çizilmediği için güneyde -60'ta kesilir
const WORLD_BOUNDS = L.latLngBounds([-60, -180], [84, 180]);

// Dünyanın, harita kutusunun genişliğini tam dolduracağı en küçük yakınlaştırma
function getFitZoom() {

    const width = mapContainer.clientWidth;
    const height = mapContainer.clientHeight;

    // 1 numaralı yakınlaştırmada dünya 512 px genişliğindedir
    const zoomForWidth = Math.log2(width / 256);

    // Yükseklik de kesilen alanı (enlem -60..84) doldurmalı
    const zoomForHeight = map.getBoundsZoom(WORLD_BOUNDS, true) || 0;

    return Math.max(zoomForWidth, zoomForHeight) + 0.25;

}

function createMap() {

    map = L.map("map", {
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,

        zoomSnap: 0,
        zoomDelta: 0.5,

        preferCanvas: true,

        // Harita dünyanın dışına kaydırılamaz ve tekrar etmez
        worldCopyJump: false,
        maxBounds: WORLD_BOUNDS,
        maxBoundsViscosity: 1.0
    });

    // Shaded relief background
    L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}",
        {
            attribution: "Tiles &copy; Esri, USGS, NOAA",
            maxNativeZoom: 8,
            maxZoom: 9,
            noWrap: true,
            bounds: WORLD_BOUNDS
        }
    ).addTo(map);

    // Country polygons
    countriesLayer = L.geoJSON(countryDataFeatures, {

        style: countryStyle,

        renderer: L.canvas({ padding: 0.5 }),

        smoothFactor: 1.5,

        onEachFeature: function(feature, layer) {

            const countryName = feature.properties.name;

            countryLayersByName[countryName] = layer;

            layer.bindTooltip(countryName, {
                sticky: true,
                direction: "auto"
            });

            layer.on("click", function() {

                if (!gameStarted) {
                    selectStartingCountry(countryName);
                } else {
                    attackCountry(countryName);
                }

            });

        }

    }).addTo(map);

    fitWorld();

    // Pencere boyutu değişince dünyayı yeniden sığdır
    let resizeTimeout = null;

    window.addEventListener("resize", function() {

        clearTimeout(resizeTimeout);

        resizeTimeout = setTimeout(function() {
            map.invalidateSize();
            fitWorld();
        }, 150);

    });

    updateMapColors();

}

// Dünyayı kutuya boşluksuz sığdırır ve daha fazla uzaklaşmayı engeller
function fitWorld() {

    const zoom = getFitZoom();

    // Dünya kutuyu doldurduktan sonra 1 kademe daha uzaklaştırılabilir
map.setMinZoom(zoom - 1);

    map.setView([25, 0], zoom, { animate: false });

}


// =====================================
// UPDATE MAP COLORS
// =====================================

function updateMapColors() {

    availableNeighbors = getAvailableNeighbors();

    if (!countriesLayer) return;

    countriesLayer.setStyle(countryStyle);

}


// =====================================
// LOAD GAME DATA
// =====================================

document.getElementById("map-message").textContent =
    "Loading world map...";

Promise.all([

    fetch("data/countries.geojson").then(response => {
        if (!response.ok) throw new Error("Could not load countries.geojson");
        return response.json();
    }),

    fetch("data/country-neighbors.json").then(response => {
        if (!response.ok) throw new Error("Could not load country-neighbors.json");
        return response.json();
    }),

    fetch("data/capital-bank.json").then(response => {
        if (!response.ok) throw new Error("Could not load capital-bank.json");
        return response.json();
    })

])

.then(([geoData, neighborData, capitalData]) => {

    countryDataFeatures = geoData.features.filter(function(feature) {
        return feature.properties.name !== "Antarctica";
    });

    countryNeighbors = neighborData;
    capitalBank = capitalData.countries;

    createMap();

    document.getElementById("map-message").textContent =
        "Select your starting country to begin.";

    console.log("Relief map loaded!");
    console.log("Countries:", countryDataFeatures.length);
    console.log("Playable locations:", Object.keys(capitalBank).length);

})

.catch(error => {

    console.error("Game loading error:", error);

    document.getElementById("map-message").textContent =
        "Could not load game data. Check the console.";

});


// =====================================
// SELECT STARTING COUNTRY
// =====================================

function selectStartingCountry(countryName) {

    if (!capitalBank[countryName]) {

        document.getElementById("map-message").textContent =
            "This location cannot be selected. Choose a playable country.";

        return;

    }

    selectedCountry = countryName;

    document.getElementById("territory-name").textContent =
        countryName;

    document.getElementById("territory-info").textContent =
        "Starting country selected.";

    document.getElementById("map-message").textContent =
        countryName + " selected!";

    startButton.textContent = "START GAME";

    updateMapColors();

}


// =====================================
// START GAME
// =====================================

startButton.addEventListener("click", function() {

    if (!selectedCountry) {

        document.getElementById("map-message").textContent =
            "Please select your starting country first!";

        return;

    }

    if (gameStarted) return;

    gameStarted = true;

    conqueredCountries.clear();
    conqueredCountries.add(selectedCountry);

    score = 1;
    scoreDisplay.textContent = score;

    startButton.disabled = true;
    startButton.textContent = "GAME IN PROGRESS";

    document.getElementById("territory-name").textContent =
        selectedCountry;

    document.getElementById("territory-info").textContent =
        "Your starting territory.";

    document.getElementById("map-message").textContent =
        "Choose a neighboring country to attack!";

    updateMapColors();

    timerInterval = setInterval(function() {

        timeLeft--;

        timerInterval = setInterval(function() {

    timeLeft--;

    timerDisplay.textContent = timeLeft;

    // Son 10 saniyede sayaç kırmızı yanıp söner
    timerDisplay.classList.toggle("danger", timeLeft <= 10);

    if (timeLeft <= 0) {
        endGame();
    }

}, 1000);

});


// =====================================
// ATTACK COUNTRY
// =====================================

function attackCountry(countryName) {

    if (!gameStarted || currentQuestionCountry) return;

    if (conqueredCountries.has(countryName)) return;

    if (!availableNeighbors.has(countryName)) {

        document.getElementById("map-message").textContent =
            "You can only attack neighboring countries!";

        return;

    }

    showQuestion(countryName);

}


// =====================================
// SHOW CAPITAL QUESTION
// =====================================

function showQuestion(countryName) {

    const countryData = capitalBank[countryName];

    if (!countryData) return;

    currentQuestionCountry = countryName;

    updateMapColors();

    const correctAnswer = countryData.capital;

    questionDisplay.textContent =
        "What is the capital of " + countryName + "?";

    questionInfo.textContent =
        "Choose the correct answer to conquer this country.";

    feedback.textContent = "";

    const allCapitals = [
        ...new Set(
            Object.values(capitalBank)
                .map(country => country.capital)
                .filter(capital => capital !== correctAnswer)
        )
    ];

    allCapitals.sort(() => Math.random() - 0.5);

    const options = [
        correctAnswer,
        ...allCapitals.slice(0, 3)
    ];

    options.sort(() => Math.random() - 0.5);

    answerButtons.forEach(function(button, index) {

        button.textContent =
            String.fromCharCode(65 + index) + ". " + options[index];

        button.dataset.answer = options[index];

        button.disabled = false;

    });

}


// =====================================
// CHECK ANSWERS
// =====================================

answerButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        if (!gameStarted || !currentQuestionCountry) return;

        const countryName = currentQuestionCountry;

        const correctAnswer = capitalBank[countryName].capital;

        const selectedAnswer = button.dataset.answer;

        if (selectedAnswer === correctAnswer) {

            conqueredCountries.add(countryName);

            score++;

            scoreDisplay.textContent = score;

            feedback.textContent =
                "Correct! " + countryName + " conquered!";

            feedback.style.color = "#269C83";

            document.getElementById("territory-name").textContent =
                countryName;

            document.getElementById("territory-info").textContent =
                "Territory successfully conquered!";

            document.getElementById("map-message").textContent =
                countryName + " has been conquered!";

            currentQuestionCountry = null;

            disableAnswers();

            updateMapColors();

            questionDisplay.textContent =
                "Country conquered!";

            questionInfo.textContent =
                "Choose another neighboring country.";

        } else {

            timeLeft = Math.max(0, timeLeft - 5);

            timerDisplay.classList.toggle("danger", timeLeft <= 10);

            feedback.textContent =
                "Wrong answer! You lost 5 seconds. Try again.";

            feedback.style.color = "#D95F68";

            if (timeLeft <= 0) {
                endGame();
            }

        }

    });

});


// =====================================
// DISABLE ANSWERS
// =====================================

function disableAnswers() {

    answerButtons.forEach(function(button) {
        button.disabled = true;
    });

}


// =====================================
// END GAME
// =====================================

function endGame() {

    clearInterval(timerInterval);

    gameStarted = false;

    currentQuestionCountry = null;

    disableAnswers();

    updateMapColors();

    document.getElementById("final-score").textContent = score;

    document.getElementById("game-over")
        .classList.remove("hidden");

    document.getElementById("map-message").textContent =
        "Time is up! Game over.";

}


// =====================================
// PLAY AGAIN
// =====================================

document.getElementById("play-again-btn")
    .addEventListener("click", function() {

        clearInterval(timerInterval);

        timeLeft = 60;
        score = 0;
        gameStarted = false;

        selectedCountry = null;
        currentQuestionCountry = null;

        conqueredCountries.clear();

        timerDisplay.textContent = "60";
        scoreDisplay.textContent = "0";

        document.getElementById("game-over")
            .classList.add("hidden");

        document.getElementById("territory-name").textContent =
            "Not selected";

        document.getElementById("territory-info").textContent =
            "Choose a country on the map.";

        document.getElementById("map-message").textContent =
            "Select your starting country to begin.";

        questionDisplay.textContent =
            "Ready to conquer the world?";

        questionInfo.textContent =
            "Select a neighboring country to attack.";

        feedback.textContent = "";

        disableAnswers();

        startButton.disabled = false;
        startButton.textContent = "SELECT STARTING COUNTRY";

        updateMapColors();

    });