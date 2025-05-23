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

function main(){
    initView();
    state.view.totalScore.textContent = "";
    state.view.startButton.addEventListener("click", startGame);
}

main();