const words = ["javascript", "hangman", "developer", "programming", "challenge"];
const maxAttempts = 6;
let word, displayWord, incorrectGuesses, remainingAttempts, alphabetButtons, highscores;

document.addEventListener("DOMContentLoaded", () => {
    setupGame();
    loadHighscores();
    document.getElementById("theme-toggle").addEventListener("click", toggleTheme);
});

function setupGame() {
    word = words[Math.floor(Math.random() * words.length)];
    displayWord = Array(word.length).fill('_');
    incorrectGuesses = [];
    remainingAttempts = maxAttempts;

    document.getElementById("word-display").innerText = displayWord.join(' ');
    document.getElementById("incorrect-guesses").innerText = incorrectGuesses.length;
    document.getElementById("remaining-attempts").innerText = remainingAttempts;
    setupAlphabetButtons();
    updateHangmanFigure();
    document.getElementById("restart-button").addEventListener("click", setupGame);
}

function setupAlphabetButtons() {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    alphabetButtons = document.getElementById("alphabet-buttons");
    alphabetButtons.innerHTML = '';

    alphabet.split('').forEach(letter => {
        const button = document.createElement('button');
        button.innerText = letter;
        button.addEventListener('click', () => handleLetterGuess(letter));
        alphabetButtons.appendChild(button);
    });
}

function handleLetterGuess(letter) {
    if (incorrectGuesses.includes(letter) || displayWord.includes(letter)) {
        return;
    }

    if (word.includes(letter)) {
        word.split('').forEach((char, index) => {
            if (char === letter) {
                displayWord[index] = letter;
            }
        });
    } else {
        incorrectGuesses.push(letter);
        remainingAttempts--;
    }

    updateGame();
}

function updateGame() {
    document.getElementById("word-display").innerText = displayWord.join(' ');
    document.getElementById("incorrect-guesses").innerText = incorrectGuesses.length;
    document.getElementById("remaining-attempts").innerText = remainingAttempts;

    if (!displayWord.includes('_')) {
        alert('Congratulations! You won!');
        updateHighscores();
        disableAlphabetButtons();
    } else if (remainingAttempts === 0) {
        alert(`Game over! The word was "${word}".`);
        updateHighscores();
        disableAlphabetButtons();
    }

    updateHangmanFigure();
}

function updateHangmanFigure() {
    const hangmanStages = [
        "",
        "O",
        "O<br/>|",
        "O<br/>|<br/>/",
        "O<br/>|<br/>/\\",
        "O<br/>|<br/>/\\<br/>/",
        "O<br/>|<br/>/\\<br/>/\\"
    ];

    document.getElementById("hangman-figure").innerHTML = hangmanStages[maxAttempts - remainingAttempts];
}

function disableAlphabetButtons() {
    alphabetButtons.querySelectorAll('button').forEach(button => {
        button.disabled = true;
    });
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    document.querySelector('.container').classList.toggle('dark-mode');
}

function loadHighscores() {
    highscores = JSON.parse(localStorage.getItem('highscores')) || [];
    updateHighscoresDisplay();
}

function updateHighscores() {
    const name = prompt('Enter your name for the leaderboard:');
    if (name) {
        highscores.push({ name, score: maxAttempts - remainingAttempts });
        highscores.sort((a, b) => b.score - a.score);
        highscores = highscores.slice(0, 10); // Keep top 10 scores
        localStorage.setItem('highscores', JSON.stringify(highscores));
        updateHighscoresDisplay();
    }
}

function updateHighscoresDisplay() {
    const highscoresList = document.getElementById("highscores");
    highscoresList.innerHTML = highscores.map(score => `<li>${score.name}: ${score.score}</li>`).join('');
}
function updateHangmanFigure() {
    const hangmanParts = [
        "head",
        "body",
        "left-arm",
        "right-arm",
        "left-leg",
        "right-leg"
    ];

    hangmanParts.forEach((part, index) => {
        const element = document.querySelector(`.hangman-figure .${part}`);
        element.style.display = index < maxAttempts - remainingAttempts ? 'block' : 'none';
    });
}
