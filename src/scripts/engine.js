const state = {
    view:{
        squares: document.querySelectorAll(".square"),
        enemy: document.querySelectorAll(".enemy"),
        timeLeft: document.querySelector("#time-left"),
        score: document.querySelector("#score"),
        level: document.querySelector("#level"),
        gameState: document.querySelector("#gameState"),
        startButton: document.querySelector("#start-restart-button"),
        totalScore: document.querySelector("#totalScore"),
    },
    values:{
        timerId: null,
        gameSpeed: 1000,
        hitPosition: 0,
        result: 0,
        currentTime: 60,
        gameLevel: 1, // Novo: nível do jogo
    },
    actions:{
        countDownTimerId: null,
    },
};

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
}

function updateGameSpeed(newSpeed) {
    clearInterval(state.values.timerId);
    state.values.gameSpeed = newSpeed;
    state.values.timerId = setInterval(randomSquare, state.values.gameSpeed);
}

function countDown(){
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
        //alert("Game Over! Your final score is " + state.values.result);
    }
}

function playSound(audioName){
    let audio = new Audio(`../src/audios/${audioName}.m4a`);
    if (audioName === "Jump20"){
        audio.volume = 0.01;
    } else {
        audio.volume = 0.1;
    }
    audio.play();
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

    // Inicia o timer do tempo corretamente
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
    state.view.totalScore.textContent = "";
    state.view.startButton.addEventListener("click", startGame);
}

main();