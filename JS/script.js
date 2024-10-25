// Achtergrond scrollsnelheid
let move_speed = 3;

// Gravity
let gravity = 0.4;

// Highscore
let highScore = localStorage.getItem("highScore") ? parseInt(localStorage.getItem("highScore")) : 0; // Laad de highscore van localStorage

// Hartjes
let hearts = 1;

// Referentie naar het vogel element (ervan uitgaande dat het een <img> is)
let bird = document.querySelector(".bird");

// Instellen van de afbeeldingsbronnen voor BatUp en BatDown
let batUpSrc = "images/BatUp.png";
let batDownSrc = "images/BatDown.png";

// Verkrijgen van eigenschappen van het vogel element
let bird_props = bird.getBoundingClientRect();
let background = document.querySelector(".background").getBoundingClientRect();

// Verkrijgen van referentie naar het score element
let score_val = document.querySelector(".score_val");
let message = document.querySelector(".message");
let score_title = document.querySelector(".score_title");
let hearticon = document.querySelector(".hearts");

// Huidige score
let currentScore = 0;

// Instellen van de initiële game status naar starten
let game_state = "Start";

let bird_dy = 0; // Initieel voor zwaartekracht
let pipe_seperation = 0;

// Geluidsbestanden
const jumpSound = document.getElementById("jump-sound");
const deathSound = document.getElementById("death-sound");
const pointSound = document.getElementById("point-sound");
pointSound.volume = 0.1;

// Muziek
const music = document.getElementById('background-music');
music.volume = 0.1;
music.pause(); // Start met de muziek gepauzeerd

// Voeg een eventlistener toe voor toetsindrukken
document.addEventListener("keydown", (e) => {
  if (e.key === " " && (game_state === "Start" || game_state === "Waiting")) {
    game_state = "Play";
    message.style.display = "none";
    play();
    jumpSound.currentTime = 0;
    jumpSound.play();
  }

  if (e.key === " " && game_state === "Play") {
    bird.src = batDownSrc;
    bird_dy = -7.6;
    jumpSound.currentTime = 0;
    jumpSound.play();
  }

  if (e.key === "p") { // Pauze menu
    if (game_state === "Play") {
      game_state = "Paused";
      document.querySelector(".pause-popup").style.display = "block";
      cancelAnimationFrame(moveAnimation);
      cancelAnimationFrame(gravityAnimation);
      cancelAnimationFrame(pipeAnimation);
      clearTimeout(scoreTimer);
    } else if (game_state === "Paused") {
      game_state = "Play";
      document.querySelector(".pause-popup").style.display = "none";
      moveAnimation = requestAnimationFrame(move);
      gravityAnimation = requestAnimationFrame(apply_gravity);
      pipeAnimation = requestAnimationFrame(create_pipe);
      increaseScore();
    }
  }
});

// Voeg een eventlistener toe voor muisklikken
document.addEventListener("mousedown", (e) => {
  if (game_state === "Start" || game_state === "Waiting") {
    game_state = "Play";
    message.style.display = "none";
    play();
    jumpSound.currentTime = 0;
    jumpSound.play();
  }

  if (game_state === "Play") {
    bird.src = batDownSrc;
    bird_dy = -7.6;
    jumpSound.currentTime = 0;
    jumpSound.play();
  }
});

// Reset de vleugels als de muisknop wordt losgelaten
document.addEventListener("mouseup", (e) => {
  if (game_state === "Play") {
    bird.src = batUpSrc;
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key === " " && game_state === "Play") {
    bird.src = batUpSrc;
  }
});

// Functie om het spel volledig opnieuw te starten
function resetGame() {
  document.querySelectorAll(".pipe_sprite").forEach((e) => e.remove());
  bird.style.top = "40vh";
  bird.style.left = "50vw";
  score_val.innerHTML = "0";
  currentScore = 0; // Reset de huidige score alleen bij opnieuw spelen
  bird_dy = 0;
  pipe_seperation = 0;
  game_state = "Start";
  message.style.display = "block";
  message.innerHTML = "Druk op Spatie of klik om opnieuw te beginnen";
}

// Functie om de highscore op te slaan in localStorage
function saveHighScore(score) {
  localStorage.setItem("highScore", score);
}

// Functie om het spel te stoppen en game over te geven
function gameOver() {
  game_state = "End";
  deathSound.currentTime = 0;
  deathSound.play();
  document.querySelector(".game-over-popup").style.display = "block";

  let currentScoreDisplay = document.querySelector(".current-score");
  let bestScoreDisplay = document.querySelector(".best-score");
  currentScore = parseInt(score_val.innerHTML);

  currentScoreDisplay.innerHTML = currentScore;

  // Controleer en sla de highscore op
  if (currentScore > highScore) {
    highScore = currentScore;
    saveHighScore(highScore);
  }

  bestScoreDisplay.innerHTML = highScore;
  clearTimeout(scoreTimer);
}

// Herstart het spel volledig en reset alle elementen
document.querySelector(".play-again-btn").addEventListener("click", () => {
  document.querySelector(".game-over-popup").style.display = "none";
  resetGame();
});

// Keer terug naar het startmenu (reset de game status en toon de start message)
document.querySelector(".lb-btn").addEventListener("click", () => {
  document.querySelector(".leaderboard-popup").style.display = "block";
  document.querySelector(".game-over-popup").style.display = "none";
  game_state = "End";
});

// Functie om het spel te starten
let moveAnimation, gravityAnimation, pipeAnimation; // Variabelen voor animatiefuncties

function play() {
  moveAnimation = requestAnimationFrame(move);
  gravityAnimation = requestAnimationFrame(apply_gravity);
  pipeAnimation = requestAnimationFrame(create_pipe);
  increaseScore();
}

// Functie om pijpen te creëren
function create_pipe() {
  if (game_state !== "Play") return;

  if (pipe_seperation > 115) {
    pipe_seperation = 0;

    let pipe_posi = Math.floor(Math.random() * 43) + 8;
    let pipe_sprite_inv = document.createElement("div");
    pipe_sprite_inv.className = "pipe_sprite";
    pipe_sprite_inv.style.top = pipe_posi - 70 + "vh";
    pipe_sprite_inv.style.left = "100vw";

    document.body.appendChild(pipe_sprite_inv);
    let pipe_sprite = document.createElement("div");
    pipe_sprite.className = "pipe_sprite";
    pipe_sprite.style.top = pipe_posi + 35 + "vh";
    pipe_sprite.style.left = "100vw";
    pipe_sprite.increase_score = "1";

    document.body.appendChild(pipe_sprite);
  }
  pipe_seperation++;
  pipeAnimation = requestAnimationFrame(create_pipe);
}

// Functie voor het verplaatsen van pijpen en botsingen
function move() {
  if (game_state !== "Play") return;

  let pipe_sprite = document.querySelectorAll(".pipe_sprite");
  pipe_sprite.forEach((element) => {
    let pipe_sprite_props = element.getBoundingClientRect();
    bird_props = bird.getBoundingClientRect();

    if (pipe_sprite_props.right <= 0) {
      element.remove();
    } else {
      if (
        bird_props.left < pipe_sprite_props.left + pipe_sprite_props.width &&
        bird_props.left + bird_props.width > pipe_sprite_props.left &&
        bird_props.top < pipe_sprite_props.top + pipe_sprite_props.height &&
        bird_props.top + bird_props.height > pipe_sprite_props.top
      ) {
        gameOver();
        return;
      }
      element.style.left = pipe_sprite_props.left - move_speed + "px";
    }
  });

  moveAnimation = requestAnimationFrame(move);
}

// Functie voor zwaartekracht
function apply_gravity() {
  if (game_state !== "Play") return;

  bird_dy += gravity;
  bird.style.top = bird.offsetTop + bird_dy + "px";
  bird_props = bird.getBoundingClientRect();

  if (bird_props.bottom >= background.bottom || bird_props.top <= background.top) {
    gameOver();
    return;
  }

  gravityAnimation = requestAnimationFrame(apply_gravity);
}

// Maak een variabele om de score timer bij te houden
let scoreTimer;
function increaseScore() {
  scoreTimer = setTimeout(() => {
    if (game_state === "Play") {
      currentScore++;
      score_val.innerHTML = currentScore;
      pointSound.currentTime = 0;
      pointSound.play();
      increaseScore();
    }
  }, 1000);
}

// Toggle muziek functie
document.querySelector(".music-toggle").addEventListener("click", () => {
  if (music.paused) {
    music.play();
    document.querySelector(".music-toggle").innerHTML = "Music On";
  } else {
    music.pause();
    document.querySelector(".music-toggle").innerHTML = "Music Off";
  }
});

// Refresh de site volledig
function siteReload() {
  location.reload();
}
