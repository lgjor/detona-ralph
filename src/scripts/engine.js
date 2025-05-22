const state = {
    view:{
        squares: document.querySelectorAll(".square"),
        enemy: document.querySelectorAll(".enemy"),
        timeLeft: document.querySelector("#time-left"),
        score: document.querySelector("#score"),
    },
    values:{
        timerId: null,
        gameSpeed: 1000,
        hitPosition: 0,
        result: 0,
        currentTime: 60,
    },
    actions:{
        countDownTimerId: setInterval(countDown, 1000),
    },
};

function countDown(){
    state.values.currentTime--;
    state.view.timeLeft.textContent = state.values.currentTime;
    if(state.values.currentTime <= 0){
        clearInterval(state.values.timerId);
        clearInterval(state.actions.countDownTimerId);
        playSound("Randomize13");
        alert("Game Over! Your final score is " + state.values.result);
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

function addListenerHitBox(){
    state.view.squares.forEach((square)=>{
        square.addEventListener("mousedown", (e)=>{
            if(square.id === state.values.hitPosition){
                state.values.result++;
                state.view.score.textContent = state.values.result;
                state.values.hitPosition = null;
                playSound("Pickup_Coin13");
            }
        });
    });
}

function main(){
    moveEnemy();
    addListenerHitBox();
}

main();