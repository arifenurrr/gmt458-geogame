# CAPITAL CONQUEST

### Conquer the World, One Capital at a Time.

**Capital Conquest** is an interactive Web GIS game in which players conquer countries around the world using their knowledge of capital cities. Players choose a starting country, attack only neighboring countries, and expand their territory by answering capital city questions correctly.

The game combines geographical knowledge, map interaction, and time-based strategy.

## Live Demo

**Play the Game:** [https://arifenurrr.github.io/gmt458-geogame/](https://arifenurrr.github.io/gmt458-geogame/)

---

## 1. Game Overview

The main objective of the game is to conquer as many countries as possible within 60 seconds.

First, the player selects a starting country on the world map. Once the game begins, only unconquered countries that share a land border with the player's conquered territories become available to attack.

To attack a country, the player clicks on it on the map. A multiple-choice question asking for that country's capital city is then displayed.

- Correct answer: The country is conquered and added to the player's territory.
- Incorrect answer: 5 seconds are deducted from the remaining time.
- Bonus Round: After each correctly answered question, the player receives an additional task to locate the capital city on the map.

The player must try to conquer as many countries as possible before time runs out.

## 2. Game Interface and Layout

The game interface consists of two main sections: the map and the control panel.

- **Header:** Displays the game title, language selection, remaining time, and number of conquered countries.
- **World Map:** An interactive world map displaying country boundaries and their current game states.
- **Territory Panel:** Displays the name, capital city, number of neighboring countries, and status of the selected or conquered country.
- **Capital Question Panel:** Displays multiple-choice capital city questions and bonus round information.
- **How to Play:** Explains the game rules and gameplay steps.
- **Legend:** Explains the meaning of the different colors used on the map.
- **Leaderboard:** Displays the scores of the top five players.

### Frontend Layout Sketch

```text
+----------------------------------------------------------+
| CAPITAL CONQUEST       EN / TR       TIME      CONQUERED |
+-----------------------------------+----------------------+
|                                   | YOUR TERRITORY       |
|                                   |----------------------|
|                                   | CAPITAL QUESTION     |
|                                   |                      |
|           WORLD MAP               | A. Answer  B. Answer  |
|                                   | C. Answer  D. Answer  |
|                                   |                      |
|                                   | HOW TO PLAY          |
|                                   |                      |
+-----------------------------------+----------------------+
|                       MAP LEGEND                         |
+----------------------------------------------------------+
```

## 3. Game Progression and Rules

The game consists of five main stages:

**1. Starting Country Selection**

The player selects a playable starting country from the world map. The selected country is displayed in yellow.

**2. Attacking Neighboring Countries**

Once the game begins, the player can only attack countries that share a border with their conquered territories. Available countries are displayed in green. Countries that are not neighboring or are not yet accessible cannot be selected.

**3. Capital City Question**

When the player clicks on a country they want to attack, a multiple-choice question about its capital city appears. The selected country is highlighted in red on the map.

**4. Bonus Round**

After answering a capital city question correctly, the player enters a bonus round in which they must locate that country's capital on the map. The bonus round is explained in detail below.

**5. Game Over**

When the 60-second timer reaches zero, the game ends. The player's conquered countries, total score, and game statistics are displayed. The player can enter their name to save their score to the leaderboard or start a new game.

## 4. Questions, Attempts and Lives

There is no fixed number of questions in the game. Questions are generated dynamically using the country and capital city data stored in `capital-bank.json`.

For each attack, a capital city question is displayed with four answer options. Only one of these options is correct.

- Each question requires one correct answer.
- An incorrect answer results in a 5-second time penalty.
- The game does not include a separate life system.
- During each Bonus Round, the player has 3 attempts to guess the capital's location on the map.

The main limitation of the game is the 60-second time limit.

## 5. Bonus Round: Find the Capital on the Map

The Bonus Round is a special part of the game that focuses on geographical knowledge and spatial estimation skills.

After the player correctly answers a country's capital question, they enter the bonus round. Instead of answering a multiple-choice question, the player must estimate the actual geographical location of the capital city on the world map.

### How Does It Work?

1. The name of the capital city that needs to be found is displayed.
2. The map zooms in towards the region where the conquered country is located.
3. The player clicks on the map to indicate their estimated location.
4. The system calculates the distance in kilometers between the clicked location and the actual coordinates of the capital.
5. Based on the calculated distance, the player receives Hot and Cold feedback.

### Distance Calculation

The distance between two locations is calculated using Leaflet's `map.distance()` function. This function returns the distance between two coordinates in meters, which is then converted into kilometers.

If multiple coordinate points are defined for a capital city, the distance between the player's guess and each coordinate point is calculated, and the closest point is taken into account.

### Hot and Cold Feedback System

Five different feedback levels are used to indicate how close the player's guess is to the actual capital city:

| Distance from the actual capital | Feedback |
| -------------------------------- | -------- |
| 75 km or less | Capital Found |
| More than 75 km – up to 150 km | Very Hot |
| More than 150 km – up to 300 km | Hot |
| More than 300 km – up to 600 km | Warm |
| More than 600 km | Cold |

Each guess is represented by a differently colored marker on the map:

- **Green:** Capital found.
- **Red:** Very Hot.
- **Orange:** Hot.
- **Yellow:** Warm.
- **Blue:** Cold.

These colors help the player visually understand how close their guess is to the actual location.

### Attempts and Rewards

- The player has 3 attempts in each bonus round.
- If one of the guesses is within 75 km of the actual capital, the task is successfully completed.
- If the capital is found within the 75 km limit, 5 seconds are added to the player's remaining time.
- If all three attempts are used without finding the capital, the actual capital location is revealed on the map.
- The player can also skip the bonus round using the **Skip Bonus** button. In this case, no additional time is awarded.

After the bonus round is completed, the map returns to its normal gameplay view. This feature requires players not only to know capital cities but also to estimate their geographical locations.

## 6. Scoring and Leaderboard

The player's score is determined by the number of conquered countries.

- The starting country provides the first point.
- Each country conquered by answering correctly adds 1 point to the score.
- Incorrect answers do not reduce the score, but they deduct 5 seconds from the remaining time.
- Successfully completing a bonus round adds 5 seconds to the remaining time.

At the end of the game, the player can enter their name to save their score.

The leaderboard uses the browser's `localStorage` feature to store the top five players. Players are ranked primarily by the number of conquered countries and, in case of a tie, by their answer accuracy.

Scores are stored locally in the same browser. There is no shared online database for synchronizing scores across different devices or browsers.

## 7. Time-Based Gameplay

The temporal component of the game is a 60-second countdown timer.

- The timer starts counting down from 60 seconds when the game begins.
- 5 seconds are deducted for each incorrect answer.
- 5 seconds are added when the player finds the capital within 75 km during the Bonus Round.
- The game automatically ends when the timer reaches zero.

The remaining time is displayed using a circular timer at the top of the interface. As the remaining time decreases, the timer changes visually to indicate a warning state.

This time limit encourages players to make quick decisions and choose their strategies carefully.

## 8. Map Visualization and Color System

Countries are displayed in different colors on the map according to their current game states:

| Color | Meaning |
| ----- | ------- |
| Yellow | Conquered country / Starting country |
| Green | Available to attack |
| Red | Current question country |
| Dark Blue | Not available |

Map interactions are implemented using Leaflet.js. Players can select countries, zoom in and out of the map, and make location guesses during the Bonus Round.

## 9. Project File Structure

The project consists of HTML, CSS, JavaScript, and geographical data files.

```text
gmt458-geogame/
│
├── index.html
├── style.css
├── script.js
├── README.md
│
└── data/
    ├── countries.geojson
    ├── country-neighbors.json
    ├── capital-bank.json
    └── capital-coords.json
```

**File Descriptions:**

- `index.html`: Defines the HTML structure and interface elements of the game.
- `style.css`: Controls the game's visual design, colors, layout, and responsive appearance.
- `script.js`: Handles the game mechanics, map interactions, questions, timer, bonus round, and scoring system.
- `countries.geojson`: Contains the geographical boundary data of countries around the world.
- `country-neighbors.json`: Defines the neighboring relationships between countries.
- `capital-bank.json`: Stores country names and capital city information.
- `capital-coords.json`: Provides the geographical coordinates of capital cities used in the Bonus Round.

## 10. Technologies and JavaScript Libraries

The main technologies used in this project are:

| Technology / Library | Purpose |
| -------------------- | ------- |
| HTML5 | Defines the structure of the web page |
| CSS3 | Handles interface design and responsive layout |
| JavaScript | Controls game logic and interactions |
| Leaflet.js 1.9.4 | Creates the interactive map |
| Turf.js 6 | Performs geographical and spatial operations |
| GeoJSON | Represents country boundaries |
| JSON | Stores country, neighboring country, and capital city data |
| localStorage | Stores leaderboard scores locally |

Leaflet.js is used to display the world map and handle map interactions. Turf.js is included in the project to perform spatial operations on geographical data.

## 11. Event Handlers

Different JavaScript event handlers are used to manage user interactions throughout the project.

**1. Map Click Event (`map.on("click")`)**

Handles clicks on the map. Before the game starts, the player selects a starting country. Once the game begins, the player can attack a neighboring country. During the Bonus Round, map clicks are interpreted as location guesses.

**2. Answer Button Click Event (`button.addEventListener("click")`)**

Handles clicks on the answer options in capital city questions. If the selected answer is correct, the country is conquered. If the answer is incorrect, 5 seconds are deducted from the remaining time.

**3. Start Button Click Event (`startButton.addEventListener("click")`)**

Starts the game. It checks the selected starting country, initializes the game statistics, registers the selected country as the first conquered territory, and starts the 60-second timer.

Additional event handlers are also used for language selection, skipping the bonus round, saving scores, and restarting the game.

## 12. Use of Closures

JavaScript closures are used in the project, particularly to manage the Bonus Round mechanism.

The `createBonusRound()` function creates a separate scope for each bonus round. The following variables are maintained within this scope:

- `attemptsLeft`: The number of remaining attempts.
- `finished`: Indicates whether the bonus round has been completed.
- `lastFeedback`: Stores the feedback from the most recent guess.
- `ready`: Indicates whether the map is ready to accept new guesses.
- `markers`: Stores the map markers created during the bonus round.
- `savedCenter` and `savedZoom`: Store the map view before entering the bonus round.

These variables cannot be accessed directly from outside the function. Instead, they are managed through functions such as `guess()`, `finish()`, `close()`, `render()`, and `setReady()`.

This approach allows each bonus round to manage its own attempts and map markers independently.

## 13. DOM Interaction

DOM manipulation is used to dynamically update the game interface according to user interactions.

For example:

- `document.getElementById()` is used to access the timer, score, question area, and buttons.
- `textContent` and `innerHTML` are used to update questions, capital city names, and feedback messages.
- `classList.add()` and `classList.remove()` are used to change the states of countries and interface elements.
- `createElement()` is used to create interface elements related to bonus markers and the game-over screen.
- `querySelectorAll()` is used to select and manage multiple answer buttons and other interface elements.

These operations allow the game interface to be updated dynamically without reloading the page.

## 15. What I Learned from AI

During the development of this project, I used artificial intelligence as a learning and development assistant, particularly for JavaScript, Leaflet.js, and game logic.

The main topics I explored with AI assistance included:

- Managing country selection and map interactions using Leaflet.
- Understanding and implementing neighboring country relationships.
- Implementing coordinate and distance calculations for the Bonus Round.
- Understanding JavaScript event handlers and closure structures.
- Improving error handling.

Rather than using AI-generated suggestions without evaluation, I reviewed and tested them according to the needs of my project. I also used AI as a teacher by asking it to explain concepts and parts of the code that I did not know or found difficult to understand. This helped me learn and better understand how the project works.
