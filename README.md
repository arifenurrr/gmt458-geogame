Capital Conquest – GeoGame

1. Game Description

Capital Conquest is a geography-based strategy game in which players try to conquer as many countries as possible by answering capital city questions correctly.

The game takes place on an interactive world map. Players start by selecting a country and then attempt to conquer its neighboring countries. To conquer a country, the player must correctly identify its capital city.

The main objective is to conquer as many countries as possible within 60 seconds.

2. Game Rules and Functional Requirements

The player selects a starting country on the world map.

The game starts with a 60-second countdown.

Only neighboring countries can be selected for attack.

When a country is selected, a question about its capital city appears with four answer options.

A correct answer conquers the country, which changes to the player's territory color.

The conquered country's neighboring countries become available for attack.

An incorrect answer deducts 5 seconds from the remaining time.

The player can try another question until the timer reaches zero.

The game ends when the time runs out.

3. Frontend Layout

The game interface will include:

An interactive world map in the main area.

A timer showing the remaining time.

A score counter displaying the number of conquered countries.

A question panel with four answer options.

A start screen for selecting the initial country.

A final screen showing the player's score and conquered territories.

4. Game Progression

The game has a single 60-second round.

Players expand their territory by conquering neighboring countries. As more countries are conquered, new neighboring countries become available.

The game becomes more challenging as players expand across the map and encounter new capital city questions.

5. Questions and Lives

Questions are generated based on the countries available for attack.

Each question asks the player to identify the capital city of a selected country.

Four answer options are provided for each question.

There is no fixed question limit. Players answer as many questions as possible within the time limit.

The game does not use a separate lives system.

6. Scoring and High Scores

Each successfully conquered country adds one point to the player's score.

The starting country does not count toward the score.

The final score represents the total number of conquered countries.

The game will display the top five high scores with player names.

7. Temporal Component

The game has a 60-second time limit.

Players must answer capital city questions quickly to conquer as many countries as possible.

Incorrect answers result in a 5-second time penalty. The game automatically ends when the timer reaches zero.

8. Technologies and Libraries

The project will use:

HTML5 – Structure of the game interface.

CSS3 – Styling and visual design.

JavaScript – Game logic, timer, questions and scoring.

Leaflet.js – Interactive world map.

GeoJSON – Country boundaries and geographic data.

9. Geographic Data

GeoJSON country boundary data will be used to display countries and determine their neighboring relationships.

The map will be the main element of the gameplay, allowing players to interact directly with geographic features.
