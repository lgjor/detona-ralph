// Coloque seu firebaseConfig aqui

const firebaseConfig = {
  apiKey: "AIzaSyCEgEjiOab1-iH3F3gAyL4AarpFRPf4zG8",
  authDomain: "detona-ralph-db59d.firebaseapp.com",
  databaseURL: "https://detona-ralph-db59d-default-rtdb.firebaseio.com/",
  projectId: "detona-ralph-db59d",
  storageBucket: "detona-ralph-db59d.firebasestorage.app",
  messagingSenderId: "173501837635",
  appId: "1:173501837635:web:0900b17e25144223847ff6",
  measurementId: "G-X7FJ04GFSB"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const state = {
    view: {},
    values: {
        timerId: null,
        gameSpeed: 1000,
        hitPosition: 0,
        result: 0,
        currentTime: 60,
        gameLevel: 1,
    },
    actions: {
        countDownTimerId: null,
    },
};

function initView() {
    state.view = {
        squares: document.querySelectorAll(".square"),
        enemy: document.querySelectorAll(".enemy"),
        timeLeft: document.querySelector("#time-left"),
        score: document.querySelector("#score"),
        level: document.querySelector("#level"),
        gameState: document.querySelector("#gameState"),
        startButton: document.querySelector("#start-restart-button"),
        totalScore: document.querySelector("#totalScore"),
        leaderboard: document.querySelector("#leaderboard-overlay"),
    };
}

function calculateSpeedByLevel(level) {
    const speeds = [1000, 900, 800, 700, 600, 500, 450, 400, 350, 300];
    return speeds[Math.min(level - 1, speeds.length - 1)];
}

// Increase game level and speed
function updateGameLevel(newLevel) {
    state.values.gameLevel = newLevel;
    state.view.level.textContent = newLevel;
    playSound("levelUp");
    let newSpeed = calculateSpeedByLevel(newLevel);
    updateGameSpeed(newSpeed);
    
    // Fun and motivational messages per level (English)
    const messages = [
        "Too easy, right? 😎", // Level 1
        "Still a walk in the park!", // Level 2
        "Now it's heating up...", // Level 3
        "Feeling the pressure?", // Level 4
        "Let's speed things up!", // Level 5
        "It's getting fast!", // Level 6
        "Only the strong make it here!", // Level 7
        "Sweating yet?", // Level 8
        "Now or never!", // Level 9
        "Turbo mode! Show who's boss! 🚀", // Level 10
    ];

    setGameState(messages[Math.min(newLevel - 1, messages.length - 1)]);
}

function updateGameSpeed(newSpeed) {
    clearInterval(state.values.timerId);
    state.values.gameSpeed = newSpeed;
    state.values.timerId = setInterval(randomSquare, state.values.gameSpeed);
}

function countDown(){
    //console.log("countDown called", state.values.currentTime);
    state.values.currentTime--;
    state.view.timeLeft.textContent = state.values.currentTime;

    // 10 níveis, mudando a cada 6 segundos (ajuste se quiser)
    const levelThresholds = [54, 48, 42, 36, 30, 24, 18, 12, 6];
    for (let i = 0; i < levelThresholds.length; i++) {
        if (state.values.currentTime === levelThresholds[i]) {
            updateGameLevel(i + 2); // Nível 2 até 10
        }
    }

    if(state.values.currentTime <= 0){
        playSound("Randomize13");
        clearInterval(state.values.timerId);
        clearInterval(state.actions.countDownTimerId);
        setGameState("Gamer over!");
        state.view.squares.forEach(square => square.classList.remove("enemy"));
        state.view.totalScore.textContent = (`Your total score is: ${state.values.result}`);

        // Verifica, salva e mostra o leaderboard após o jogo
        checkAndSaveHighScore(state.values.result, showLeaderboard);
    }   
}

function playSound(audioName){
    const audio = new Audio(`https://raw.githubusercontent.com/lgjor/detona-ralph/main/src/audios/${audioName}.m4a`);
    if (audioName === "Jump20"){
        audio.volume = 0.01;
    } else {
        audio.volume = 0.1;
    }
    audio.play().catch((error) => {
        console.error(`Failed to play sound ${audioName}:`, error);
    });
}

function randomSquare(){
    // Remove the enemy class from all squares
    state.view.squares.forEach((square)=>{
        square.classList.remove("enemy")
    });

    // Get a random number between 0 and 8
    let randomNumber = Math.floor(Math.random() * 9);
    let randomSquare = state.view.squares[randomNumber];
    randomSquare.classList.add("enemy");
    state.values.hitPosition = randomSquare.id;
    playSound("Jump20");
}

function moveEnemy(){
    state.values.timerId = setInterval(randomSquare, state.values.gameSpeed);
}

function addListenerHitBox() {
    state.view.squares = document.querySelectorAll(".square");
    state.view.squares.forEach((square) => {
        // Remove qualquer listener antigo antes de adicionar um novo
        square.onmousedown = null;
        square.onmousedown = function () {
            if (square.id === state.values.hitPosition) {
                state.values.result++;
                state.view.score.textContent = state.values.result;
                state.values.hitPosition = null;
                playSound("Pickup_Coin13");
            }
        };
    });
}

function startGame() { 
    state.view.squares.forEach((square) => {
        square.classList.remove("enemy");
    });
    state.view.startButton.textContent = "Restart";
    // Zera tempo e score ao reiniciar
    state.values.currentTime = 60;
    state.values.result = 0;
    state.view.timeLeft.textContent = state.values.currentTime;
    state.view.score.textContent = state.values.result;
    updateGameLevel(1); // Garante que começa no nível 1
    setGameState("Click on the enemy!");

    // Limpa timers antigos antes de iniciar novos
    clearInterval(state.values.timerId);
    clearInterval(state.actions.countDownTimerId);

    moveEnemy();
    addListenerHitBox();

    // Defensive: clear again before starting, just in case
    clearInterval(state.actions.countDownTimerId);
    state.actions.countDownTimerId = setInterval(countDown, 1000);

     // Troca o listener do botão
    state.view.startButton.removeEventListener("click", startGame);
    state.view.startButton.addEventListener("click", restartGame);
 }

 function restartGame() {
    state.view.startButton.textContent = "Start";
    state.view.squares.forEach((square) => {
        square.classList.remove("enemy");
    });
    clearInterval(state.values.timerId);
    clearInterval(state.actions.countDownTimerId);
    state.values.result = 0;
    state.values.currentTime = 60;
    state.view.totalScore.textContent = "";
    state.view.level.textContent = 1; // Reseta o nível
    state.view.score.textContent = state.values.result;
    state.view.timeLeft.textContent = state.values.currentTime;
    setGameState("Are you ready?");

    // Remove o listener antigo para evitar múltiplos jogos simultâneos
    state.view.startButton.removeEventListener("click", restartGame);
    state.view.startButton.addEventListener("click", startGame);
}

function setGameState(message){

    state.view.gameState.textContent = message;
}

function saveScore(username, score) {
    // Push a new score to the 'scores' list
    db.ref('scores').push({
        username: username,
        score: score,
        timestamp: Date.now()
    });
}

function saveScoreWithLimit(username, score, callback) {
    getTopScores(function(scores) {
        scores.sort((a, b) => {
            if (a.score !== b.score) return a.score - b.score;
            return a.timestamp - b.timestamp;
        });

        if (scores.length < 10) {
            db.ref('scores').push({
                username,
                score,
                timestamp: Date.now()
            }).then(() => {
                if (callback) callback();
            });
        } else {
            const lowest = scores[0];
            if (score > lowest.score ||
                (score === lowest.score && Date.now() > lowest.timestamp)) {
                db.ref('scores')
                  .orderByChild('score')
                  .equalTo(lowest.score)
                  .once('value', (snapshot) => {
                      let toRemoveKey = null;
                      let minTimestamp = Infinity;
                      snapshot.forEach(child => {
                          if (child.val().timestamp < minTimestamp) {
                              minTimestamp = child.val().timestamp;
                              toRemoveKey = child.key;
                          }
                      });
                      if (toRemoveKey) {
                          db.ref('scores/' + toRemoveKey).remove().then(() => {
                              db.ref('scores').push({
                                  username,
                                  score,
                                  timestamp: Date.now()
                              }).then(() => {
                                  if (callback) callback();
                              });
                          });
                      } else {
                          if (callback) callback();
                      }
                  });
            } else {
                if (callback) callback();
            }
        }
    });
}

function getTopScores(callback) {
    const dbRef = firebase.database().ref('scores');
    dbRef.orderByChild('score').limitToLast(10).get().then((snapshot) => {
        const scores = [];
        snapshot.forEach((childSnapshot) => {
            const scoreData = childSnapshot.val();
            scores.push({
                key: childSnapshot.key,
                username: scoreData.username,
                score: scoreData.score,
                timestamp: scoreData.timestamp
            });
        });
        // Ordena do maior para o menor, e mais antigo em caso de empate
        scores.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.timestamp - b.timestamp;
        });
        callback(scores);
    }).catch((error) => {
        console.error("Erro ao buscar top scores:", error);
        callback([]); // Retorna lista vazia em caso de erro
    });
}

function checkAndSaveHighScore(finalScore, callback) {
    getTopScores(function(scores) {
        if (scores.length < 10 || finalScore > scores[scores.length - 1].score) {
            const username = prompt("Congratulations! You made a high score! Enter your name:");
            if (username && username.trim() !== "") {
                saveScoreWithLimit(username.trim(), finalScore, callback);
            } else if (callback) {
                callback();
            }
        } else if (callback) {
            callback();
        }
    });
}

function showLeaderboard() {
    getTopScores(function(scores) {
        const overlay = document.getElementById('leaderboard-overlay');
        const table = document.getElementById('leaderboard-list');
        const tbody = table.querySelector('tbody');
        tbody.innerHTML = '';
        scores.forEach((entry, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${idx + 1}</td>
                <td>${entry.username || 'Anonymous'}</td>
                <td style="text-align:right;">${entry.score}</td>
            `;
            tbody.appendChild(tr);
        });
        overlay.style.display = 'flex';
    });
}

// Fechar overlay ao clicar no botão
document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.getElementById('leaderboard-overlay');
    const closeBtn = document.getElementById('close-leaderboard');
    if (closeBtn) {
        closeBtn.onclick = () => { overlay.style.display = 'none'; };
    }
});

function main(){
    initView();
    state.view.totalScore.textContent = "";
    state.view.startButton.addEventListener("click", startGame);
}

main();
