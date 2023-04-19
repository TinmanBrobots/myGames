var character = document.getElementById('character');
character.addEventListener('click', jump);
let score = 0;
var scoreElement = document.getElementById('score');
scoreElement.innerHTML = score;

function jump(){
    if (character.classList == 'animate') { return; }
    character.classList.add('animate');
    setTimeout(removeJump, 400); // 300ms = len of animation
    score += 1;
    scoreElement.innerHTML = score;
}

function removeJump(){
    character.classList.remove('animate');
}

var block = document.getElementById('block');

function checkDead(){
    let characterTop = parseInt(window.getComputedStyle(character).getPropertyValue('top'));
    let blockLeft = parseInt(window.getComputedStyle(block).getPropertyValue('left'));
    if (blockLeft < 20 && blockLeft > -20 && characterTop >= 100) {
        alert("Game Over");
        score = 0;
        scoreElement.innerHTML = score;
    }
}

setInterval(checkDead, 10);