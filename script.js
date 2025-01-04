const words = [
    { word: 'JAVASCRIPT', hint: 'A popular programming language for web development' },
    { word: 'REACT', hint: 'A JavaScript library for building user interfaces' },
    { word: 'TYPESCRIPT', hint: 'A typed superset of JavaScript' },
    { word: 'PYTHON', hint: 'A versatile programming language known for its simplicity' },
    { word: 'ALGORITHM', hint: 'A step-by-step procedure for solving a problem' }
];

class HangmanGame {
    constructor() {
        this.initialize();
        this.setupEventListeners();
        this.loadHighScores();
    }

    initialize() {
        this.currentWord = this.getRandomWord();
        this.guessedLetters = new Set();
        this.wrongGuesses = 0;
        this.maxGuesses = 6;
        this.score = 100;
        this.gameStatus = 'playing'; // 'playing', 'won', 'lost'
        this.hintsRemaining = 2;
        this.renderGame();
    }

    getRandomWord() {
        return words[Math.floor(Math.random() * words.length)];
    }

    setupEventListeners() {
        document.getElementById('theme-switch').addEventListener('change', () => {
            document.body.classList.toggle('dark-mode');
        });

        document.getElementById('new-game').addEventListener('click', () => {
            this.initialize();
        });

        document.getElementById('hint').addEventListener('click', () => {
            this.getHint();
        });

        this.createKeyboard();

        // Add keyboard support
        document.addEventListener('keydown', (e) => {
            const key = e.key.toUpperCase();
            if (/^[A-Z]$/.test(key)) {
                this.handleGuess(key);
            }
        });
    }

    createKeyboard() {
        const keyboard = document.getElementById('keyboard');
        keyboard.innerHTML = '';
        
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(letter => {
            const button = document.createElement('button');
            button.className = 'keyboard-key';
            button.textContent = letter;
            button.addEventListener('click', () => this.handleGuess(letter));
            keyboard.appendChild(button);
        });
    }

    handleGuess(letter) {
        if (this.gameStatus !== 'playing' || this.guessedLetters.has(letter)) {
            return;
        }

        this.guessedLetters.add(letter);
        
        if (!this.currentWord.word.includes(letter)) {
            this.wrongGuesses++;
            this.score = Math.max(0, this.score - 15);
            this.updateHangman();
        }

        this.updateGameStatus();
        this.renderGame();
    }

    updateGameStatus() {
        if (this.wrongGuesses >= this.maxGuesses) {
            this.gameStatus = 'lost';
            this.showMessage(`Game Over! The word was "${this.currentWord.word}"`, 'error');
        } else if (this.isWordGuessed()) {
            this.gameStatus = 'won';
            this.updateHighScores();
            this.showMessage(`Congratulations! You won with a score of ${this.score}!`, 'success');
        }
    }

    isWordGuessed() {
        return [...this.currentWord.word].every(letter => this.guessedLetters.has(letter));
    }

    updateHangman() {
        const parts = document.querySelectorAll('.hangman-part');
        parts.forEach((part, index) => {
            if (index < this.wrongGuesses) {
                part.style.opacity = '1';
                this.animateHangmanPart(part);
            } else {
                part.style.opacity = '0';
            }
        });
    }

    animateHangmanPart(part) {
        part.style.animation = 'drawLine 0.3s ease forwards';
        part.addEventListener('animationend', () => {
            part.style.animation = '';
        }, { once: true });
    }

    getHint() {
        if (this.hintsRemaining <= 0 || this.gameStatus !== 'playing') {
            this.showMessage('No hints remaining!', 'error');
            return;
        }

        const unguessedLetters = [...this.currentWord.word]
            .filter(letter => !this.guessedLetters.has(letter));

        if (unguessedLetters.length > 0) {
            const hintLetter = unguessedLetters[Math.floor(Math.random() * unguessedLetters.length)];
            this.handleGuess(hintLetter);
            this.hintsRemaining--;
            this.score = Math.max(0, this.score - 10); // Penalty for using hint
            this.showMessage(`Hint used! ${this.hintsRemaining} remaining`, 'info');
        }
    }

    showMessage(text, type) {
        const messageEl = document.getElementById('message');
        messageEl.textContent = text;
        messageEl.className = `message ${type}`;
        setTimeout(() => {
            messageEl.className = 'message';
            messageEl.textContent = '';
        }, 3000);
    }

    loadHighScores() {
        this.highScores = JSON.parse(localStorage.getItem('hangmanHighScores')) || [];
        this.renderHighScores();
    }

    updateHighScores() {
        if (this.score > 0) {
            const date = new Date().toLocaleDateString();
            this.highScores.push({ score: this.score, date });
            this.highScores.sort((a, b) => b.score - a.score);
            this.highScores = this.highScores.slice(0, 5); // Keep top 5 scores
            localStorage.setItem('hangmanHighScores', JSON.stringify(this.highScores));
            this.renderHighScores();
        }
    }

    renderHighScores() {
        const highScoresEl = document.getElementById('highscores');
        highScoresEl.innerHTML = this.highScores
            .map(score => `
                <div class="highscore-item">
                    <span>${score.score} points</span>
                    <span>${score.date}</span>
                </div>
            `)
            .join('');
    }

    renderGame() {
        // Word display
        const wordContainer = document.getElementById('word-container');
        wordContainer.innerHTML = '';
        
        [...this.currentWord.word].forEach(letter => {
            const letterBox = document.createElement('div');
            letterBox.className = 'letter-box';
            letterBox.textContent = this.guessedLetters.has(letter) ? letter : '';
            wordContainer.appendChild(letterBox);
        });

        // Update keyboard
        document.querySelectorAll('.keyboard-key').forEach(button => {
            const letter = button.textContent;
            button.disabled = this.guessedLetters.has(letter) || this.gameStatus !== 'playing';
            if (this.guessedLetters.has(letter)) {
                button.classList.add(this.currentWord.word.includes(letter) ? 'correct' : 'incorrect');
            }
        });

        // Update score and hint button
        document.getElementById('current-score').textContent = this.score;
        document.getElementById('hint').disabled = this.hintsRemaining <= 0 || this.gameStatus !== 'playing';
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new HangmanGame();
    
    // Add keyboard support for New Game
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && game.gameStatus !== 'playing') {
            game.initialize();
        }
    });
});