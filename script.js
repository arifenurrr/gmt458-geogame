/* CAPITAL CONQUEST - TACTICAL WAR-ROOM */

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
const TOTAL_TIME = 60;
let timerInterval = null;
let gameStarted = false;
let score = 0;

// GAME SUMMARY STATISTICS
let startingCountry = null;
let gameRoute = [];
let totalAttempts = 0;
let correctAnswers = 0;
let currentStreak = 0;
let bestStreak = 0;
let timeLost = 0;
let gameEnded = false;

let finalGameStats = null;

// BONUS ROUND: FIND THE CAPITAL ON THE MAP
const BONUS_ATTEMPTS = 3;      // guesses per bonus round
const BONUS_FOUND_KM = 75;     // a guess this close finds the capital
const BONUS_TIME_REWARD = 5;   // seconds added when the capital is found

let capitalCoords = {};
let activeBonus = null;
let bonusFoundCount = 0;
let skipBonusButton = null;
let bonusRestoreTimeout = null;
let bonusMarkers = null;

const timerDisplay = document.getElementById("timer");
const timerProgress = document.getElementById("timer-progress");
const scoreDisplay = document.getElementById("score");
const startButton = document.getElementById("start-btn");

const questionDisplay = document.getElementById("question");
const questionInfo = document.getElementById("question-info");
const answerButtons = document.querySelectorAll(".answer-btn");
const feedback = document.getElementById("feedback");
const mapContainer = document.getElementById("map");
const territoryCapital = document.getElementById("territory-capital");
const territoryNeighbors = document.getElementById("territory-neighbors");
const territoryStatus = document.getElementById("territory-status");

const CIRCLE_CIRCUMFERENCE = 226.2;

// LANGUAGE SYSTEM

let currentLanguage = "en";
let currentMapMessageKey = "initialMap";
let currentMapMessageValues = {};
let currentTerritoryInfoKey = "initialTerritory";
let currentFeedbackKey = "";
let currentFeedbackValues = {};

const translations = {
    en: {
        tagline: "CONQUER THE WORLD, ONE CAPITAL AT A TIME.",
        time: "TIME",
        conquered: "CONQUERED",
        worldMap: "WORLD MAP",
        territory: "YOUR TERRITORY",
        capitalQuestion: "CAPITAL QUESTION",
        howToPlay: "HOW TO PLAY",
        capital: "CAPITAL",
        neighbors: "NEIGHBORS",
        status: "STATUS",
        initialMap: "Select your starting country to begin.",
        initialTerritory: "Choose a country on the map.",
        territoryNotSelected: "Not selected",
        loading: "Loading world map...",
        loadError: "Could not load game data. Check the console.",
        invalidCountry: "This location cannot be selected. Choose a playable country.",
        selected: "{country} selected!",
        startingInfo: "Starting country selected.",
        yourTerritory: "Your starting territory.",
        chooseNeighbor: "Choose a neighboring country to attack!",
        selectFirst: "Please select your starting country first!",
        attackOnlyNeighbors: "You can only attack neighboring countries!",
        questionReady: "Ready to conquer the world?",
        questionInfo: "Select a neighboring country to attack.",
        askCapital: "What is the capital of <span class='target-country'>{country}</span>?",
        questionHint: "Choose the correct answer to conquer this country.",
        correct: "Correct! {country} conquered!",
        wrong: "Wrong answer! You lost 5 seconds. Try again.",
        conqueredInfo: "Territory successfully conquered!",
        conqueredMap: "{country} has been conquered!",
        countryConquered: "Country conquered!",
        chooseAnother: "Choose another neighboring country.",
        gameOver: "Time is up! Game over.",
        startingStatus: "STARTING COUNTRY",
        territoryStatus: "YOUR TERRITORY",
        conqueredStatus: "CONQUERED",
        waitingStatus: "WAITING FOR SELECTION",
        startSelect: "SELECT STARTING COUNTRY",
        startGame: "START CONQUEST",
        operation: "OPERATION IN PROGRESS",
        saveScore: "SAVE SCORE",
        playAgain: "PLAY AGAIN",
        finalScore: "Countries conquered:",
        countriesConquered: "countries conquered",
        enterName: "Enter your name",
        leaderboardTitle: "HALL OF COMMANDERS",
        leaderboardSubtitle: "TOP 5 PLAYERS",
        noScores: "No scores yet.",
        countriesLabel: "countries",
        bonusLabel: "BONUS ROUND",
        bonusTitle: "Find <span class='target-country'>{capital}</span> on the map!",
        bonusInfo: "{left} guesses left · within {km} km = +{sec} s",
        bonusMap: "Bonus: click where you think {capital} is.",
        bonusCold: "Cold · {km} km away",
        bonusWarm: "Warm · {km} km away",
        bonusHot: "Hot · {km} km away",
        bonusVeryHot: "Very hot! {km} km away",
        bonusFound: "Capital found! +{sec} seconds",
        bonusMissed: "Bonus missed. {capital} is marked on the map.",
        bonusSkip: "SKIP BONUS",
        bonusSummary: "Capitals found in bonus rounds: {count}",
        instructions: [
    "Select your starting country.",
    "Click on a neighboring country to attack.",
    "Answer the country's capital question correctly.",
    "Find the capital on the map during the bonus round. You have 3 guesses. Get within 75 km to earn +5 seconds, or skip the bonus.",
    "Conquer as many countries as possible before time runs out!"
]
    },

    tr: {
        tagline: "BAŞKENTLERLE DÜNYAYI FETHET.",
        time: "SÜRE",
        conquered: "FETİH",
        worldMap: "DÜNYA HARİTASI",
        territory: "TOPRAKLARIN",
        capitalQuestion: "BAŞKENT SORUSU",
        howToPlay: "NASIL OYNANIR",
        capital: "BAŞKENT",
        neighbors: "KOMŞULAR",
        status: "DURUM",
        initialMap: "Başlamak için başlangıç ülkene tıkla.",
        initialTerritory: "Haritadan bir ülke seç.",
        territoryNotSelected: "Seçilmedi",
        loading: "Dünya haritası yükleniyor...",
        loadError: "Oyun verileri yüklenemedi. Konsolu kontrol et.",
        invalidCountry: "Bu konum seçilemiyor. Oynanabilir bir ülke seç.",
        selected: "{country} seçildi!",
        startingInfo: "Başlangıç ülkesi seçildi.",
        yourTerritory: "Başlangıç toprağın.",
        chooseNeighbor: "Saldırmak için komşu bir ülke seç!",
        selectFirst: "Önce başlangıç ülkene tıklamalısın!",
        attackOnlyNeighbors: "Yalnızca komşu ülkelerine saldırabilirsin!",
        questionReady: "Dünyayı fethetmeye hazır mısın?",
        questionInfo: "Saldırmak için komşu bir ülke seç.",
        askCapital: "<span class='target-country'>{country}</span> ülkesinin başkenti neresidir?",
        questionHint: "Bu ülkeyi fethetmek için doğru cevabı seç.",
        correct: "Doğru! {country} fethedildi!",
        wrong: "Yanlış cevap! 5 saniye kaybettin. Tekrar dene.",
        conqueredInfo: "Ülke başarıyla fethedildi!",
        conqueredMap: "{country} fethedildi!",
        countryConquered: "Ülke fethedildi!",
        chooseAnother: "Başka bir komşu ülke seç.",
        gameOver: "Süre doldu! Oyun bitti.",
        startingStatus: "BAŞLANGIÇ ÜLKESİ",
        territoryStatus: "TOPRAĞIN",
        conqueredStatus: "FETİH EDİLDİ",
        waitingStatus: "ÜLKE SEÇİLMESİ BEKLENİYOR",
        startSelect: "BAŞLANGIÇ ÜLKESİ SEÇ",
        startGame: "FETHE BAŞLA",
        operation: "OPERASYON DEVAM EDİYOR",
        saveScore: "SKORU KAYDET",
        playAgain: "TEKRAR OYNA",
        finalScore: "Fethedilen ülke sayısı:",
        countriesConquered: "ülke fethedildi",
        enterName: "İsmini gir",
        leaderboardTitle: "KOMUTANLAR LİSTESİ",
        leaderboardSubtitle: "İLK 5 OYUNCU",
        noScores: "Henüz skor yok.",
        countriesLabel: "ülke",
        bonusLabel: "BONUS TUR",
        bonusTitle: "<span class='target-country'>{capital}</span> haritada nerede?",
        bonusInfo: "{left} tahmin hakkı kaldı · {km} km içinde = +{sec} sn",
        bonusMap: "Bonus: {capital} sence nerede? Haritaya tıkla.",
        bonusCold: "Soğuk · {km} km uzakta",
        bonusWarm: "Ilık · {km} km uzakta",
        bonusHot: "Sıcak · {km} km uzakta",
        bonusVeryHot: "Çok sıcak! {km} km uzakta",
        bonusFound: "Başkent bulundu! +{sec} saniye",
        bonusMissed: "Bonus kaçtı. {capital} haritada işaretlendi.",
        bonusSkip: "BONUSU ATLA",
        bonusSummary: "Bonus turlarda bulunan başkent: {count}",
        instructions: [
    "Başlangıç ülkene tıkla.",
    "Saldırmak için komşu bir ülkeye tıkla.",
    "Ülkenin başkent sorusunu doğru cevapla.",
    "Bonus turunda başkenti haritada bul. 3 tahmin hakkın var. 75 km yakınına ulaşırsan +5 saniye kazanırsın veya bonusu atlayabilirsin.",
    "Süre dolmadan olabildiğince çok ülke fethet!"
]
    }
};

// TRANSLATION FUNCTIONS

function t(key, values = {}) {
    let result =
        translations[currentLanguage][key] ||
        translations.en[key] ||
        key;

    Object.keys(values).forEach(function(name) {
        result = result.replaceAll(
            "{" + name + "}",
            values[name]
        );
    });

    return result;
}

function setMapMessage(key, values = {}) {
    currentMapMessageKey = key;
    currentMapMessageValues = values;

    document.getElementById("map-message").textContent =
        t(key, values);
}

function setTerritoryInfo(key) {
    currentTerritoryInfoKey = key;

    document.getElementById("territory-info").textContent =
        t(key);
}

function setFeedback(key, values = {}) {
    currentFeedbackKey = key;
    currentFeedbackValues = values;

    feedback.textContent = key ? t(key, values) : "";
}

// APPLY LANGUAGE

function applyLanguage() {
    document.documentElement.lang = currentLanguage;

    document.querySelector(".logo p").textContent = t("tagline");
    document.querySelector(".timer-content span").textContent = t("time");
    document.querySelector(".score-stat span").textContent = t("conquered");
    document.querySelector(".section-heading h2").textContent = t("worldMap");

    const labels = document.querySelectorAll(".card-label");

    if (labels[0]) labels[0].textContent = t("territory");
    if (labels[1]) labels[1].textContent = t("capitalQuestion");

    document.querySelector(".instructions h3").textContent =
        t("howToPlay");

    const steps = document.querySelectorAll(
    ".instructions .instruction-item p"
);

translations[currentLanguage].instructions.forEach(
    function(instruction, index) {
        if (steps[index]) {
            steps[index].textContent = instruction;
        }
    }
);

    const detailLabels = document.querySelectorAll(
        ".territory-detail span"
    );

    if (detailLabels[0]) detailLabels[0].textContent = t("capital");
    if (detailLabels[1]) detailLabels[1].textContent = t("neighbors");
    if (detailLabels[2]) detailLabels[2].textContent = t("status");

    const legendLabels = document.querySelectorAll(
        ".legend-item span:last-child"
    );

    const legendTranslations = currentLanguage === "tr"
        ? ["Fethedildi", "Saldırılabilir", "Soru sorulan ülke", "Ulaşılamaz"]
        : ["Conquered", "Available to attack", "Current question", "Not available"];

    legendLabels.forEach(function(label, index) {
        if (legendTranslations[index]) {
            label.textContent = legendTranslations[index];
        }
    });

    document.getElementById("lang-en").classList.toggle(
        "active", currentLanguage === "en"
    );

    document.getElementById("lang-tr").classList.toggle(
        "active", currentLanguage === "tr"
    );

    if (!gameStarted) {
        startButton.textContent =
            selectedCountry ? t("startGame") : t("startSelect");
    } else {
        startButton.textContent = t("operation");
    }

    if (currentQuestionCountry) {
        questionDisplay.innerHTML = t("askCapital", {
            country: currentQuestionCountry.toUpperCase()
        });

        questionInfo.textContent = t("questionHint");

    } else if (gameStarted) {
        questionDisplay.textContent = t("countryConquered");
        questionInfo.textContent = t("chooseAnother");

    } else {
        questionDisplay.textContent = t("questionReady");
        questionInfo.textContent = t("questionInfo");
    }

    const territoryStatusKey =
        territoryStatus.dataset.translationKey || "waitingStatus";

    territoryStatus.textContent = t(territoryStatusKey);

    setMapMessage(currentMapMessageKey, currentMapMessageValues);

    document.getElementById("territory-name").textContent =
        selectedCountry || t("territoryNotSelected");

    document.getElementById("territory-info").textContent =
        t(currentTerritoryInfoKey);

    setFeedback(currentFeedbackKey, currentFeedbackValues);

    document.getElementById("save-score-btn").textContent = t("saveScore");
    document.getElementById("play-again-btn").textContent = t("playAgain");
    document.getElementById("player-name").placeholder = t("enterName");

    const gameOverCard = document.querySelector(".game-over-card");

    if (gameOverCard) {
        const title = gameOverCard.querySelector("h2");
        const paragraphs = gameOverCard.querySelectorAll("p");

        if (title) {
            title.textContent =
                currentLanguage === "tr" ? "OYUN BİTTİ" : "GAME OVER";
        }

        if (paragraphs[0]) {
            paragraphs[0].textContent = t("finalScore");
        }

        if (paragraphs[1]) {
            paragraphs[1].textContent = t("countriesConquered");
        }
    }

    if (skipBonusButton) {
        skipBonusButton.textContent = t("bonusSkip");
    }

    if (activeBonus) {
        activeBonus.render();
    }

    renderLeaderboard();
}

// LANGUAGE BUTTON EVENTS

document.getElementById("lang-en").addEventListener("click", function() {
    currentLanguage = "en";
    applyLanguage();
});

document.getElementById("lang-tr").addEventListener("click", function() {
    currentLanguage = "tr";
    applyLanguage();
});

// TIMER RING VISUAL UPDATE

function updateTimerVisual() {
    timerDisplay.textContent = timeLeft;

    timerDisplay.classList.toggle("danger", timeLeft <= 10);

    if (timerProgress) {
        const ratio = Math.min(1, Math.max(0, timeLeft / TOTAL_TIME));
        const offset = CIRCLE_CIRCUMFERENCE * (1 - ratio);

        timerProgress.style.strokeDashoffset = offset;
        timerProgress.style.stroke =
            timeLeft <= 10 ? "#ff4769" : "#00f0ff";
    }
}

// NEIGHBORS

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

// UPDATE TERRITORY INTELLIGENCE

function updateTerritoryDetails(countryName, status) {
    const country = capitalBank[countryName];
    if (!country) return;

    const neighbors = countryNeighbors[countryName] || [];

    const playableNeighbors = neighbors.filter(function(name) {
        return Boolean(capitalBank[name]);
    });

    // Hide capital until the game starts
    territoryCapital.textContent = gameStarted
        ? country.capital
        : "---";

    territoryNeighbors.textContent = playableNeighbors.length;

    territoryStatus.dataset.translationKey = status;
    territoryStatus.textContent = t(status);
}

// TACTICAL COUNTRY COLORS & BORDERS

function getCountryStyleValues(countryName) {
    if (countryName === currentQuestionCountry) {
        return {
            fillColor: "#ff3358",
            fillOpacity: 0.55,
            color: "#ff758f",
            weight: 2
        };
    }

    if (
        conqueredCountries.has(countryName) ||
        (!gameStarted && countryName === selectedCountry)
    ) {
        return {
            fillColor: "#FFC247",
            fillOpacity: 0.65,
            color: "#FFE08A",
            weight: 2
        };
    }

    if (availableNeighbors.has(countryName)) {
        return {
            fillColor: "#00C98B",
            fillOpacity: 0.22,
            color: "#42DDB0",
            weight: 1.3
        };
    }

    return {
        fillColor: "#243647",
        fillOpacity: 0.55,
        color: "#4a6680",
        weight: 0.8
    };
}

function countryStyle(feature) {
    const name = feature.properties.name;
    const styleVals = getCountryStyleValues(name);

    return {
        fillColor: styleVals.fillColor,
        fillOpacity: styleVals.fillOpacity,
        color: styleVals.color,
        weight: styleVals.weight,
        opacity: 0.95
    };
}

// CREATE DARK TACTICAL MAP

const WORLD_BOUNDS = L.latLngBounds(
    [-60, -180],
    [84, 180]
);

function getFitZoom() {
    const width = mapContainer.clientWidth;
    const zoomForWidth = Math.log2(width / 256);
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
        worldCopyJump: false,
        maxBounds: WORLD_BOUNDS,
        maxBoundsViscosity: 1.0
    });
    

    countriesLayer = L.geoJSON(countryDataFeatures, {
        style: countryStyle,
        renderer: L.canvas({ padding: 0.5 }),
        smoothFactor: 1.5,

        onEachFeature: function(feature, layer) {
            const countryName = feature.properties.name;
            countryLayersByName[countryName] = layer;

           
        }
    }).addTo(map);

    fitWorld();

    // Bonus round guesses: every click on the map is a guess while a
    // bonus round is running (country clicks bubble up to the map too)
    // One physical click can reach the map more than once (the country
    // layer passes it on to the map), so clicks closer than 400 ms
    // together count as a single guess
    let lastBonusClickTime = 0;

   map.on("click", function(event) {

    // BONUS MODE
    if (activeBonus) {
        const now = Date.now();

        if (now - lastBonusClickTime < 400) return;

        lastBonusClickTime = now;
        activeBonus.guess(event.latlng);
        return;
    }

    // NORMAL GAME
    if (gameEnded || currentQuestionCountry) return;

    const clickPoint = map.latLngToLayerPoint(event.latlng);
    let clickedCountry = null;

    countriesLayer.eachLayer(function(layer) {
        if (
            !clickedCountry &&
            layer._containsPoint &&
            layer._containsPoint(clickPoint)
        ) {
            clickedCountry = layer.feature.properties.name;
        }
    });

    if (!clickedCountry) return;

    if (!gameStarted) {
        selectStartingCountry(clickedCountry);
    } else {
        attackCountry(clickedCountry);
    }

});

    createSkipBonusButton();

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

function fitWorld() {
    const zoom = getFitZoom() + 0.35;
    map.setMinZoom(zoom - 1);

    map.setView([25, 0], zoom, { animate: false });
}

// UPDATE MAP COLORS

function updateMapColors() {
    availableNeighbors = getAvailableNeighbors();

    if (!countriesLayer) return;

    countriesLayer.setStyle(countryStyle);
}

// LOAD GAME DATA

setMapMessage("loading");

Promise.all([
    fetch("data/countries.geojson").then(r => {
        if (!r.ok) throw new Error("Could not load countries.geojson");
        return r.json();
    }),

    fetch("data/country-neighbors.json").then(r => {
        if (!r.ok) throw new Error("Could not load country-neighbors.json");
        return r.json();
    }),

    fetch("data/capital-bank.json").then(r => {
        if (!r.ok) throw new Error("Could not load capital-bank.json");
        return r.json();
    }),

    // Optional: without this file the game runs without bonus rounds
    fetch("data/capital-coords.json")
        .then(r => (r.ok ? r.json() : {}))
        .catch(() => ({}))
])
.then(([geoData, neighborData, capitalData, coordsData]) => {
    capitalCoords = coordsData;

    countryDataFeatures = geoData.features.filter(
        feature => feature.properties.name !== "Antarctica"
    );

    countryNeighbors = neighborData;
    capitalBank = capitalData.countries;

    createMap();
    setMapMessage("initialMap");
})
.catch(error => {
    console.error("Game loading error:", error);
    setMapMessage("loadError");
});

// SELECT STARTING COUNTRY

function selectStartingCountry(countryName) {
    if (!capitalBank[countryName]) {
        setMapMessage("invalidCountry");
        return;
    }

    selectedCountry = countryName;

    document.getElementById("territory-name").textContent = countryName;

    setTerritoryInfo("startingInfo");

    updateTerritoryDetails(countryName, "startingStatus");

    setMapMessage("selected", { country: countryName });

    startButton.textContent = t("startGame");

    updateMapColors();
}

// START GAME

startButton.addEventListener("click", function() {
    if (!selectedCountry) {
        setMapMessage("selectFirst");
        return;
    }

    if (gameStarted) return;

    gameStarted = true;
    document.getElementById("map").classList.add("radar-off");
    updateTerritoryDetails(selectedCountry, "territoryStatus");
    gameEnded = false;
    document.querySelector(".radar-scan-line").style.display = "none";

    startingCountry = selectedCountry;
    gameRoute = [selectedCountry];
    totalAttempts = 0;
    correctAnswers = 0;
    currentStreak = 0;
    bestStreak = 0;
    timeLost = 0;
    finalGameStats = null;

    timeLeft = TOTAL_TIME;
    updateTimerVisual();

    conqueredCountries.clear();
    conqueredCountries.add(selectedCountry);

    score = 1;
    scoreDisplay.textContent = score;

    startButton.disabled = true;
    startButton.textContent = t("operation");

    document.getElementById("territory-name").textContent = selectedCountry;

    setTerritoryInfo("yourTerritory");
    updateTerritoryDetails(selectedCountry, "territoryStatus");
    setMapMessage("chooseNeighbor");

    updateMapColors();

    timerInterval = setInterval(function() {
        timeLeft--;
        updateTimerVisual();

        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
});

// ATTACK COUNTRY

function attackCountry(countryName) {
    if (!gameStarted || currentQuestionCountry || activeBonus) return;
    if (conqueredCountries.has(countryName)) return;

    if (!availableNeighbors.has(countryName)) {
        setMapMessage("attackOnlyNeighbors");
        return;
    }

    showQuestion(countryName);
}

// SHOW CAPITAL QUESTION

function showQuestion(countryName) {
    const countryData = capitalBank[countryName];
    if (!countryData) return;

    currentQuestionCountry = countryName;
    updateMapColors();

    const correctAnswer = countryData.capital;

    questionDisplay.innerHTML = t("askCapital", {
        country: countryName.toUpperCase()
    });

    questionInfo.textContent = t("questionHint");
    setFeedback("");

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
        button.classList.remove("correct", "wrong");

        button.textContent =
            String.fromCharCode(65 + index) + ". " + options[index];

        button.dataset.answer = options[index];
        button.disabled = false;
    });
}

// CHECK ANSWERS

answerButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        if (!gameStarted || !currentQuestionCountry) return;

        const countryName = currentQuestionCountry;
        const correctAnswer = capitalBank[countryName].capital;
        const selectedAnswer = button.dataset.answer;

        totalAttempts++;

        if (selectedAnswer === correctAnswer) {
            correctAnswers++;
            currentStreak++;
            bestStreak = Math.max(bestStreak, currentStreak);
            gameRoute.push(countryName);

            answerButtons.forEach(btn => {
                btn.classList.remove("correct", "wrong");
            });

            button.classList.add("correct");

            conqueredCountries.add(countryName);
            score++;
            scoreDisplay.textContent = score;

            setFeedback("correct", { country: countryName });
            feedback.style.color = "#00ff88";

            document.getElementById("territory-name").textContent =
                countryName;

            setTerritoryInfo("conqueredInfo");
            updateTerritoryDetails(countryName, "conqueredStatus");

            setMapMessage("conqueredMap", { country: countryName });

            currentQuestionCountry = null;
            disableAnswers();
            updateMapColors();

            questionDisplay.textContent = t("countryConquered");
            questionInfo.textContent = t("chooseAnother");

            startBonusRound(countryName);

        } else {
            currentStreak = 0;
            timeLost += Math.min(5, timeLeft);
            timeLeft = Math.max(0, timeLeft - 5);

            const penalty = document.createElement("span");
            penalty.className = "time-penalty";
            penalty.textContent = "-5";

            timerDisplay.closest(".timer-stat").appendChild(penalty);

            penalty.addEventListener(
                "animationend",
                () => penalty.remove(),
                { once: true }
            );

            updateTimerVisual();

            setFeedback("wrong");
            feedback.style.color = "#ff4769";

            answerButtons.forEach(btn => {
                btn.classList.remove("correct", "wrong");
            });

            button.classList.add("wrong");

            if (timeLeft <= 0) {
                endGame();
            }
        }
    });
});

// DISABLE ANSWERS

function disableAnswers() {
    answerButtons.forEach(button => {
        button.disabled = true;
    });
}


// =====================================
// BONUS ROUND: HOT AND COLD
// =====================================

// Distance from a click to the nearest capital point, in km
function distanceToCapital(latlng, points) {
    return Math.min(...points.map(function(point) {
        return map.distance(latlng, L.latLng(point[0], point[1])) / 1000;
    }));
}

function getHeat(km) {
    if (km <= BONUS_FOUND_KM) {
        return { key: "bonusFound", color: "#00ff88" };
    }

    if (km <= 150) {
        return { key: "bonusVeryHot", color: "#ff3358" };
    }

    if (km <= 300) {
        return { key: "bonusHot", color: "#ff7a18" };
    }

    if (km <= 600) {
        return { key: "bonusWarm", color: "#ffd000" };
    }

    return { key: "bonusCold", color: "#168cff" };
}

// Shows a floating "+5" / "-5" next to the timer
function showTimerPopup(text, color) {
    const popup = document.createElement("span");
    popup.className = "time-penalty";
    popup.textContent = text;
    popup.style.color = color;
    popup.style.textShadow = "0 0 15px " + color;

    timerDisplay.closest(".timer-stat").appendChild(popup);

    popup.addEventListener("animationend", () => popup.remove(), { once: true });
}

function createSkipBonusButton() {
    skipBonusButton = document.createElement("button");
    skipBonusButton.type = "button";
    skipBonusButton.id = "skip-bonus-btn";
    skipBonusButton.className = "skip-bonus-btn hidden";
    skipBonusButton.textContent = t("bonusSkip");

    skipBonusButton.addEventListener("click", function() {
        if (activeBonus) {
            activeBonus.finish(false);
        }
    });

    feedback.insertAdjacentElement("afterend", skipBonusButton);
}

// CLOSURE: each bonus round keeps its own private state
// (guesses left, markers, saved map view). Only the returned
// functions can read or change it.
function createBonusRound(countryName, capitalName, points) {
    let attemptsLeft = BONUS_ATTEMPTS;
    let finished = false;
    let lastFeedback = null;
    let ready = false;

    const markers = L.layerGroup().addTo(map);
    bonusMarkers = markers;
    const savedCenter = map.getCenter();
    const savedZoom = map.getZoom();

    function render() {
        const labels = document.querySelectorAll(".card-label");
        if (labels[1]) labels[1].textContent = t("bonusLabel");

        questionDisplay.innerHTML = t("bonusTitle", {
            capital: capitalName
        });

        questionInfo.textContent = t("bonusInfo", {
            left: attemptsLeft,
            km: BONUS_FOUND_KM,
            sec: BONUS_TIME_REWARD
        });

        setMapMessage("bonusMap", {
            capital: capitalName
        });

        if (lastFeedback) {
            setFeedback(lastFeedback.key, lastFeedback.values);
        }
    }

    function revealCapital() {
        points.forEach(function(point) {
            L.circleMarker(point, {
                radius: 9,
                color: "#ffffff",
                weight: 2,
                fillColor: "#00ff88",
                fillOpacity: 0.9,
                interactive: false
            })
            .bindTooltip(capitalName, {
                permanent: true,
                direction: "top"
            })
            .addTo(markers);
        });
    }

    function setReady() {
        if (!finished) ready = true;
    }

    function guess(latlng) {
        if (finished || !ready || !activeBonus) return;

        attemptsLeft--;

        const km = Math.round(distanceToCapital(latlng, points));
        const heat = getHeat(km);

        // Outer glow
L.circleMarker(latlng, {
    radius: 16,
    stroke: false,
    fillColor: heat.color,
    fillOpacity: 0.25,
    interactive: false
}).addTo(markers);

// Main guess marker
L.circleMarker(latlng, {
    radius: 8,
    color: "#ffffff",
    weight: 2,
    fillColor: heat.color,
    fillOpacity: 1,
    interactive: false
}).addTo(markers);

        if (heat.key === "bonusFound") {
            finish(true);
            return;
        }

        lastFeedback = {
            key: heat.key,
            values: { km: km }
        };

        feedback.style.color = heat.color;
feedback.style.fontWeight = "900";
feedback.style.fontSize = "17px";
feedback.style.padding = "12px";
feedback.style.border = "1px solid " + heat.color;
feedback.style.borderRadius = "6px";
feedback.style.background = heat.color + "18";
feedback.style.textShadow = "0 0 12px " + heat.color;
feedback.style.boxShadow = "0 0 15px " + heat.color + "30";

render();
        if (attemptsLeft <= 0) {
            finish(false);
        }
    }

    function finish(found) {
        if (finished) return;

        // Reveal the capital before returning to normal game mode.
        revealCapital();

        if (found) {
            bonusFoundCount++;
            timeLeft += BONUS_TIME_REWARD;
            updateTimerVisual();
            showTimerPopup("+" + BONUS_TIME_REWARD, "#00ff88");
        }

        endRound();

        if (found) {
            setFeedback("bonusFound", {
                sec: BONUS_TIME_REWARD
            });
            feedback.style.color = "#00ff88";
        } else {
            setFeedback("bonusMissed", {
                capital: capitalName
            });
            feedback.style.color = "#ffc247";
        }

        // Clear any previous delayed map restoration.
        if (bonusRestoreTimeout) {
            clearTimeout(bonusRestoreTimeout);
        }

        // Keep the capital visible briefly, then restore the previous view.
        // Quickly restore the previous map view after the bonus round.
// Keep the capital visible briefly, then restore the previous view.
bonusRestoreTimeout = setTimeout(function() {
    markers.remove();

    if (bonusMarkers === markers) {
        bonusMarkers = null;
    }

    if (
        map &&
        gameStarted &&
        !gameEnded &&
        !currentQuestionCountry &&
        !activeBonus
    ) {
        map.flyTo(savedCenter, savedZoom, {
            duration: 0.8,
            easeLinearity: 0.25
        });
    }

    bonusRestoreTimeout = null;
}, 1000);
    }

    function close() {
    if (bonusRestoreTimeout) {
        clearTimeout(bonusRestoreTimeout);
        bonusRestoreTimeout = null;
    }

    markers.remove();

    if (bonusMarkers === markers) {
        bonusMarkers = null;
    }

    endRound();
}

    function endRound() {
        finished = true;
        ready = false;

        if (skipBonusButton) {
            skipBonusButton.classList.add("hidden");
        }

        document.getElementById("map").classList.remove("bonus-active");

        if (map) {
            map.doubleClickZoom.enable();
        }

        if (activeBonus === api) {
            activeBonus = null;
        }

        if (!gameStarted || gameEnded) return;

        currentQuestionCountry = null;

        const labels = document.querySelectorAll(".card-label");
        if (labels[1]) {
            labels[1].textContent = t("capitalQuestion");
        }

        questionDisplay.textContent = t("countryConquered");
        questionInfo.textContent = t("chooseAnother");

        setMapMessage("chooseNeighbor");

        setFeedback("");

        disableAnswers();
        updateMapColors();
    }

    const api = {
        guess,
        finish,
        close,
        render,
        setReady
    };

    return api;
}

function startBonusRound(countryName) {
    const points = capitalCoords[countryName];
    const country = capitalBank[countryName];

    // No coordinates for this capital: skip the bonus quietly
    if (!points || !country || !map) return;

    activeBonus = createBonusRound(countryName, country.capital, points);

    setFeedback("");
    activeBonus.render();

    skipBonusButton.textContent = t("bonusSkip");
    skipBonusButton.classList.remove("hidden");
    document.getElementById("map").classList.add("bonus-active");

    // Zoom to the conquered country so the guess is fair
    const layer = countryLayersByName[countryName];

    // A double click would count as two guesses, so it is off in the bonus
    map.doubleClickZoom.disable();

    const bonus = activeBonus;

    if (layer) {
        map.flyToBounds(layer.getBounds(), {
            padding: [40, 40],
            maxZoom: 6,
            duration: 0.6
        });

        // Accept guesses once the zoom ends (or after 1 s at the latest)
        map.once("moveend", () => bonus.setReady());
        setTimeout(() => bonus.setReady(), 1000);
    } else {
        bonus.setReady();
    }
}

function cancelBonusRound() {
    if (bonusRestoreTimeout) {
        clearTimeout(bonusRestoreTimeout);
        bonusRestoreTimeout = null;
    }

    if (activeBonus) {
        activeBonus.close();
        activeBonus = null;
    }

    // Always remove remaining bonus markers.
    if (bonusMarkers) {
        bonusMarkers.remove();
        bonusMarkers = null;
    }

    if (skipBonusButton) {
        skipBonusButton.classList.add("hidden");
    }

    if (map) {
        map.doubleClickZoom.enable();
        document.getElementById("map").classList.remove("bonus-active");
    }
}
// SIMPLIFIED GAME OVER SCREEN


function renderGameSummary() {
    const card = document.querySelector(".game-over-card");
    if (!card) return;

    const nameInput = document.getElementById("player-name");
    const saveButton = document.getElementById("save-score-btn");
    const playAgainButton = document.getElementById("play-again-btn");

    const countries = finalGameStats?.gameRoute || gameRoute;

    card.innerHTML = "";
    // Close button
const closeButton = document.createElement("button");
closeButton.className = "game-over-close";
closeButton.innerHTML = "&times;";
closeButton.type = "button";
closeButton.title = "Close";

closeButton.addEventListener("click", function() {
    if (playAgainButton) {
        playAgainButton.click();
    }
});

card.appendChild(closeButton);

    // GAME OVER title
    const title = document.createElement("h2");
    title.textContent = currentLanguage === "tr" ? "OYUN BİTTİ" : "GAME OVER";
    card.appendChild(title);

    // Score box: number and label together
    const scoreBox = document.createElement("div");
    scoreBox.className = "final-score-heading";

    const scoreNumber = document.createElement("strong");
    scoreNumber.id = "final-score";
    scoreNumber.textContent = score;

    const scoreLabel = document.createElement("span");
    scoreLabel.textContent = currentLanguage === "tr"
        ? "ÜLKE FETHEDİLDİ"
        : "COUNTRIES CONQUERED";

    scoreBox.append(scoreNumber, scoreLabel);
    card.appendChild(scoreBox);

    // Conquered countries
    const countriesTitle = document.createElement("h3");
    countriesTitle.textContent = currentLanguage === "tr"
        ? "FETHEDİLEN ÜLKELER"
        : "COUNTRIES CONQUERED";
    card.appendChild(countriesTitle);

    const countriesList = document.createElement("div");
    countriesList.className = "conquered-countries-list";

    countries.forEach(country => {
        const item = document.createElement("span");
        item.className = "conquered-country-item";
        item.textContent = country;
        countriesList.appendChild(item);
    });

    card.appendChild(countriesList);

    // Bonus round result
    const bonusLine = document.createElement("p");
    bonusLine.className = "bonus-summary";
    bonusLine.textContent = t("bonusSummary", {
        count: finalGameStats ? finalGameStats.bonusFound : bonusFoundCount
    });
    card.appendChild(bonusLine);

    // Player name
    if (nameInput) {
        nameInput.value = "";
        nameInput.placeholder = t("enterName");
        card.appendChild(nameInput);
    }

    // Save button
    if (saveButton) {
        saveButton.disabled = false;
        saveButton.textContent = t("saveScore");
        card.appendChild(saveButton);
    }

    // Play again button
    if (playAgainButton) {
        playAgainButton.textContent = t("playAgain");
        card.appendChild(playAgainButton);
    }
}


// LEADERBOARD

function getLeaderboard() {
    try {
        return JSON.parse(
            localStorage.getItem("capitalConquestLeaderboard") || "[]"
        );
    } catch (error) {
        console.warn("Could not read leaderboard:", error);
        return [];
    }
}

function renderLeaderboard() {
    const gameOver = document.getElementById("game-over");
    if (!gameOver) return;

    let panel = document.getElementById("commander-leaderboard");

    if (!panel) {
        panel = document.createElement("section");
        panel.id = "commander-leaderboard";
        gameOver.appendChild(panel);
    }

    panel.innerHTML = `
        <h3></h3>
        <p></p>
        <ol id="leaderboard-list"></ol>
    `;

    panel.querySelector("h3").textContent = t("leaderboardTitle");
    panel.querySelector("p").textContent = t("leaderboardSubtitle");

    const list = panel.querySelector("#leaderboard-list");
    const scores = getLeaderboard().slice(0, 5);

    if (scores.length === 0) {
        const item = document.createElement("li");
        item.textContent = t("noScores");
        list.appendChild(item);
        return;
    }

    scores.forEach(entry => {
        const item = document.createElement("li");
        item.textContent =
            entry.name + " — " + entry.score + " " + t("countriesLabel");
        list.appendChild(item);
    });
}

// SAVE SCORE

function saveCurrentScore() {
    const nameInput = document.getElementById("player-name");
    const name = nameInput ? nameInput.value.trim() : "";

    if (!name) {
        if (nameInput) {
            nameInput.focus();
            nameInput.style.borderColor = "#ff4769";
        }

        return;
    }

    const accuracy = totalAttempts
        ? Math.round((correctAnswers / totalAttempts) * 100)
        : 0;

    const scores = getLeaderboard();

    scores.push({
        name: name.slice(0, 20),
        score: score,
        accuracy: accuracy,
        date: new Date().toISOString()
    });

    scores.sort((a, b) =>
        b.score - a.score || b.accuracy - a.accuracy
    );

    try {
        localStorage.setItem(
            "capitalConquestLeaderboard",
            JSON.stringify(scores.slice(0, 5))
        );
    } catch (error) {
        console.error("Could not save leaderboard:", error);
    }

    renderLeaderboard();

    const saveButton = document.getElementById("save-score-btn");

    if (saveButton) {
        saveButton.disabled = true;
        saveButton.textContent =
            currentLanguage === "tr" ? "KAYDEDİLDİ" : "SAVED";
    }
}

document.getElementById("save-score-btn").addEventListener(
    "click",
    saveCurrentScore
);

// END GAME

function endGame() {
    if (gameEnded) return;

    gameEnded = true;
    gameStarted = false;

    clearInterval(timerInterval);
    timerInterval = null;

    cancelBonusRound();

    currentQuestionCountry = null;

    finalGameStats = {
        bonusFound: bonusFoundCount,
        startingCountry: startingCountry || selectedCountry,
        score: score,
        totalAttempts: totalAttempts,
        correctAnswers: correctAnswers,
        bestStreak: bestStreak,
        timeLost: timeLost,
        gameRoute: [...gameRoute]
    };

    disableAnswers();
    updateMapColors();

    setMapMessage("gameOver");

    renderGameSummary();
    renderLeaderboard();

    const gameOverScreen = document.getElementById("game-over");

    if (gameOverScreen) {
        gameOverScreen.classList.remove("hidden");
        gameOverScreen.style.display = "flex";
        gameOverScreen.style.visibility = "visible";
        gameOverScreen.style.opacity = "1";
        gameOverScreen.style.zIndex = "99999";
    }

    const finalScoreDisplay = document.getElementById("final-score");

    if (finalScoreDisplay) {
        finalScoreDisplay.textContent = score;
    }

    const saveButton = document.getElementById("save-score-btn");

    if (saveButton) {
        saveButton.disabled = false;
        saveButton.textContent = t("saveScore");
    }
}

// PLAY AGAIN

document.getElementById("play-again-btn").addEventListener(
    "click",
    function() {
        // Stop old timer and bonus operations.
        clearInterval(timerInterval);
        timerInterval = null;

        cancelBonusRound();

        // Reset game state.
        timeLeft = TOTAL_TIME;
        score = 0;

        startingCountry = null;
        selectedCountry = null;
        currentQuestionCountry = null;

        gameRoute = [];
        totalAttempts = 0;
        correctAnswers = 0;
        currentStreak = 0;
        bestStreak = 0;
        timeLost = 0;
        bonusFoundCount = 0;

        gameStarted = false;
        gameEnded = false;
        finalGameStats = null;

        conqueredCountries.clear();
        availableNeighbors.clear();

        // Reset interface.
        updateTimerVisual();
        scoreDisplay.textContent = "0";

        const gameOverScreen = document.getElementById("game-over");

        if (gameOverScreen) {
            gameOverScreen.classList.add("hidden");
            gameOverScreen.style.display = "";
            gameOverScreen.style.visibility = "";
            gameOverScreen.style.opacity = "";
            gameOverScreen.style.zIndex = "";
        }

        document.getElementById("territory-name").textContent =
            t("territoryNotSelected");

        setTerritoryInfo("initialTerritory");

        territoryCapital.textContent = "---";
        territoryNeighbors.textContent = "---";

        territoryStatus.dataset.translationKey = "waitingStatus";
        territoryStatus.textContent = t("waitingStatus");

        setMapMessage("initialMap");
        setFeedback("");

        questionDisplay.textContent = t("questionReady");
        questionInfo.textContent = t("questionInfo");

        answerButtons.forEach(function(button, index) {
            button.disabled = true;
            button.classList.remove("correct", "wrong");
            button.textContent = String.fromCharCode(65 + index);
            delete button.dataset.answer;
        });

        startButton.disabled = false;
        startButton.textContent = t("startSelect");

        const labels = document.querySelectorAll(".card-label");

        if (labels[1]) {
            labels[1].textContent = t("capitalQuestion");
        }

        if (map) {
            fitWorld();
            updateMapColors();
        }

        applyLanguage();
    }
);