//object producing class
class newComponent {

    constructor(x, y, width, height, color, type, radius, vy) {
        this.type = type;
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.vy = vy;
        this.radians = 0;
        this.angle = 0;
    }

    update() {
        if (this.type == "bcircle") {
            var ctx = game.context;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
            ctx.strokeStyle = "rgba(0, 200, 255, 0.5)";
            ctx.lineWidth = "4";
            ctx.shadowBlur = 20;
            ctx.shadowColor = "white";
            ctx.stroke();
            ctx.closePath();
        } else if (this.type == "circle") {
            var ctx = game.context;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 20;
            ctx.shadowColor = "white";
            ctx.fill();
            ctx.closePath();
        } else if (this.type == "score") {
            var ctx = game.context;
            ctx.beginPath();
            ctx.fillStyle = this.color;
            ctx.font = "60px Consolas";
            ctx.shadowBlur = 20;
            ctx.shadowColor = "#71c7ec";
            ctx.fillText(this.text, this.x, this.y);
            ctx.closePath();
        } else if (this.type == "horlicks") {
            var ctx = game.context;
            ctx.shadowBlur = 0;
            ctx.shadowColor = "black";
            var img = new Image();
            img.src = "horlicksmod.jpg"
            ctx.drawImage(img, 0, 0, 60, 60, this.x, this.y, 60, 60);
        } else if (this.type == "flight") {
            var ctx = game.context;
            ctx.shadowBlur = 0;
            ctx.shadowColor = "black";
            var img = new Image();
            img.src = "flightmod.jpg";
            ctx.drawImage(img, 30, 30, 60, 60, this.x, this.y, 60, 60);
        } else if (this.type == "affection") {
            var ctx = game.context;
            ctx.fillStyle = this.color;
            ctx.rect(this.x, this.y, this.width, this.height);
            ctx.fill();
        } else if (this.type == "bar") {
            var ctx = game.context;
            ctx.strokeStyle = "#FFFFFF";
            ctx.shadowBlur = 20;
            ctx.shadowColor = "#FFFFFF";
            ctx.rect(this.x, this.y, this.width, this.height);
            ctx.stroke();
        } else {
            var ctx = game.context;
            ctx.beginPath();
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 20;
            ctx.shadowColor = this.color;
            this.y += this.vy;
            if (this.angle != 0) {
                ctx.save();
                ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
                ctx.rotate(this.angle * Math.PI / 180);
                ctx.rect(-this.width / 2, -this.height / 2, this.width, this.height);
                ctx.fill();
                ctx.translate(-this.x - this.width / 2, -this.y - this.height / 2);
                ctx.restore();
                ctx.closePath();
            } else {
                ctx.rect(this.x, this.y, this.width, this.height);
                ctx.fill();
                ctx.closePath();
            }

        }

    }

    clockwiseRot() {
        this.radians += rotAngle;
    }

    cClockwiseRot() {
        this.radians -= rotAngle;
    }


    crash(obstacle) {
        var circleX = this.x;
        var circleY = this.y;
        var radius = this.radius;
        var otherX = obstacle.width / 2 + obstacle.x;
        var otherY = obstacle.height / 2 + obstacle.y;
        var distX = Math.abs(circleX - otherX);
        var distY = Math.abs(circleY - otherY);

        if (distX > (radius + obstacle.width / 2) || distY > (radius + obstacle.height / 2)) {
            return false;
        }
        if (distX <= obstacle.width / 2 || distY <= obstacle.height / 2) {
            return true;
        }
        var dx = distX - obstacle.width / 2;
        var dy = distY - obstacle.height / 2;
        return (dx * dx + dy * dy <= (radius * radius));

    }


}

var li = document.createElement("LI");
var li2 = document.createElement("LI");
var color = ["#f0e310", "#000080", "#FE77FE"];
var time = 0;
var bCircle, circleBlue, circleRed,
    collide, collideTime, score,
    boostTime, flightTime, start_time,
    vy, curr_score, obstacles,
    game, title, flag = 1,
    powertext,
    scoreA = 0,
    scoreB = 0,
    multi,
    scoreList = [],
    pauseTime,
    resumeTime, power, rotAngle,
    powerBoost, flight, n, pausedGame,
    affection, affOuter, passed;



startScreen();



function startGame() {

    bCircle = new newComponent(game.canvas.width / 2, game.canvas.height - 300, 0, 0, "", "bcircle", 200);
    circleRed = new newComponent(game.canvas.width / 2 - 200, game.canvas.height - 300, 0, 0, "red", "circle", 40);
    circleBlue = new newComponent(game.canvas.width / 2 + 200, game.canvas.height - 300, 0, 0, "blue", "circle", 40);
    score = new newComponent(game.canvas.width - 400, 50, 0, 0, "white", "score");
    title = new newComponent(700, 50, 0, 0, "white", "score")
    affOuter = new newComponent(200, 50, 400, 30, "", "bar");
    affection = new newComponent(200, 50, 0, 30, "#d74f6b", "affection");
    resumeTime = 0;
    pauseTime = 0;
    time_elaspse = 0;
    boostTime = 0;
    flightTime = 0;
    collideTime = 0;
    passed = 0;
    curr_score = 0;
    rotAngle = 0.03;
    flight = false;
    collide = false;
    powerBoost = false;
    pausedGame = false;
    obstacles = [];
    power = [];
    n = 150;
    vy = 2;

    start_time = Date.now() / 1000;

    //scoreboard visible
    document.body.querySelector("#score").classList.remove("hidden");

    //clearing scoreboard
    var ol = document.querySelector("#list");
    while (ol.firstChild) {
        ol.removeChild(ol.firstChild);
    }

    //initial obstacles
    for (var i = 0; i < 3; i++)
        newOb();

    //multiplayer mode
    if (multi) {
        scoreList = [];
        multiScore();
    } else {
        initialScore();
    }

    updateGame();

}



function gameArea() {

    game = {
        canvas: document.querySelector("#canvas"),
        start: function() {
            this.canvas.width = window.innerWidth * 0.4;
            this.canvas.height = window.innerHeight * 0.8;
            this.context = this.canvas.getContext("2d");
            this.canvas.fillStyle = "black";
            this.frameNo = 0;
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        },
        clear: function() {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        },
        res: function() {
            this.context.fillStyle = "black"
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        },
    };

    game.start();
}


//single player
function initialScore() {
    var ol = document.querySelector("#list");
    for (var i = 0; i < scoreList.length; i++) {
        var li = document.createElement("LI");
        li.innerHTML = scoreList[i];
        ol.appendChild(li);
    }
}

//multiplayer mode
function multiScore() {
    var ol = document.querySelector("#list");
    li.innerHTML = "Your Score: " + curr_score;
    if (flag == 1) {
        li2.innerHTML = "B's Score: 0";
    } else {
        li2.innerHTML = "A's Score/Score to Beat: " + scoreA;
    }
    ol.appendChild(li);
    ol.appendChild(li2);
}

//caculate score
function scoreCalc() {
    var time_elaspse = Date.now() / 1000;
    curr_score = parseInt(2 * (time_elaspse - start_time - (resumeTime - pauseTime)));
    score.text = "SCORE: " + curr_score;
    score.update();
}

//update scoretable
function scoreboard() {
    li.innerHTML = "Current Score: " + curr_score;
    var ol = document.querySelector("#list");
    ol.appendChild(li);
    for (var i = 0; i < scoreList.length; i++) {
        if (curr_score > scoreList[i]) {
            var ol = document.querySelector("#list");
            ol.insertBefore(li, ol.childNodes[i]);

        }
    }
}


function updateGame() {


    if (!pausedGame) {

        for (var i = 0; i < obstacles.length; i++) {
            if (!powerBoost) {
                if (circleRed.crash(obstacles[i]) || circleBlue.crash(obstacles[i])) {
                    game.res();

                    if (multi) {
                        if (flag == 1) {
                            scoreA = curr_score;
                        } else {
                            scoreB = curr_score;
                        }

                        multiText();
                    } else {
                        scoreList.push(curr_score);
                        scoreList.sort(function(a, b) {
                            return (b - a)
                        });

                        crashText();
                    }

                    game = undefined;

                    cancelAnimationFrame(id);

                    document.onkeypress = function(event) {
                        gameArea();
                        startGame();
                    }

                    return;
                }
            } else {

                powerText();
            }


            if (obstacles[i].y > game.canvas.height) {
                passed++;
                resetOb(i);
            }


        }

        crashPower();

        game.res();

        bCircle.update();
        circleBlue.update();
        circleRed.update();
        affOuter.update();
        title.text = "DUET";
        title.update();

        game.frameNo += 1;

        var timeNow = Date.now();

        //horlicks boost over
        if (timeNow - boostTime > 5000 && powerBoost) {
            powerBoost = false;
            circleBlue.radius = 40;
            circleRed.radius = 40;
            circleBlue.update();
            circleRed.update();
        }

        //flight over
        if (timeNow - flightTime > 5000 && flight) {
            rotAngle = 0.03;
            flight = false;

        }


        //increase speed of obstacles with number of frames
        if (everyinterval(n * 2) && curr_score <= 500) {

            if (n > 60) {
                n -= 10;
            }
            newOb();
        }

        vy += 0.0001;

        //drop power boosts 
        if (curr_score > 5) {
            if (everyinterval(n)) {

                powBoost();
            }
            for (var j = 0; j < power.length; j++) {
                power[j].y += power[j].vy;
                power[j].update();
            }
        }

        //affection meter 
        if (affection.width >= affOuter.width && !collide) {
            collideBall();
            affection.width = 0;
            passed = 0;
            collide = true;
        }

        //affection time over
        if (Date.now() - collideTime > 10000 && collide) {
            circleRed.x = game.canvas.width / 2 + 200;
            circleRed.y = game.canvas.height - 300;
            circleBlue.x = game.canvas.width / 2 - 200;
            circleBlue.y = game.canvas.height - 300;
            circleRed.color = "red";
            collide = false;
        }

        //update affection bar
        if (passed % 3 == 0 && passed > 0 && !collide) {
            affection.width += 2;
        }

        affection.update();

        //rotating obstacles
        for (i = 0; i < obstacles.length; i += 1) {
            if (curr_score >= 50) {
                obstacles[i].angle += 0.7;
            }
            obstacles[i].y += obstacles[i].vy;
            obstacles[i].update();
        }

        scoreCalc();

        if (multi) {
            multiScore();
        } else {
            scoreboard();
        }

        id = window.requestAnimationFrame(updateGame);
    }
}

function crashPower() {
    for (var j = 0; j < power.length; j++) {
        if (circleBlue.crash(power[j]) && !flight) {
            if (power[j].type == "flight") {
                rotAngle += 0.1;
                flightTime = Date.now();
                flight = true;
                powerText();
            } else if (power[j].type == "horlicks" && !powerBoost) {
                powerBoost = true;
                circleBlue.radius *= 2;
                circleRed.radius *= 2;
                boostTime = Date.now();
                powerText();
            }

            break;
        }

    }
}

function collideBall() {
    collideTime = Date.now();
    circleRed.x = circleBlue.x;
    circleRed.y = circleBlue.y;
    circleRed.color = "#800080";
    circleBlue.update();
    circleRed.update();
}


function powerText() {

    powertext = new newComponent(800, 500, 0, 0, "rgba(255,255,255,0.7)", "score", 0, 0);
    powertext.text = "POWER BOOST ENABLED FOR 5 SECS";
    powertext.update();
}


function newOb() {
    var minWidth = 70;
    var maxWidth = 230;
    var minHeight = 50;
    var maxHeight = 70;
    var width = Math.floor(Math.random() * (maxWidth - minWidth + 1) + minWidth);
    var height = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
    var x = Math.floor(Math.random() * (game.canvas.width - 600) + 300);
    var y = Math.floor(Math.random() * (game.canvas.height * 0.1));
    var colorBlock = color[Math.floor(Math.random() * 3)];
    var overlapped = overlap(x, y, width, height);

    if (!overlapped) {
        obstacles.push(new newComponent(x, y, width, height, colorBlock, "", 0, vy));
    } else {
        newOb();
    }
}


function resetOb(pos) {
    var minWidth = 60;
    var maxWidth = 200;
    var minHeight = 50;
    var maxHeight = 70;
    var width = Math.floor(Math.random() * (maxWidth - minWidth + 1) + minWidth);
    var height = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
    var x = Math.floor(Math.random() * (game.canvas.width - 600) + 300);
    var y = Math.floor(Math.random() * (game.canvas.height * 0.1));
    var colorBlock = color[Math.floor(Math.random() * 3)];
    var overlapped = overlap(x, y, width, height);

    if (!overlapped)
        obstacles[pos] = new newComponent(x, y, width, height, colorBlock, "", 0, vy, obstacles[pos].angle);
    else {
        resetOb(pos);
    }
}

function overlap(x, y, width, height) {
    var overlapped = false;
    for (var j = 0; j < obstacles.length; j++) {
        difx = Math.abs(x - obstacles[j].x);
        dify = Math.abs(y - obstacles[j].y);
        if (difx < (width + obstacles[j].width) / 2 && dify < (height + obstacles[j].height) / 2) {
            overlapped = true;
        }
    }

    return overlapped;
}

function everyinterval(n) {
    if ((game.frameNo / n) % 1 == 0) {
        return true;
    }
    return false;
}


function powBoost() {
    var minWidth = 40;
    var maxWidth = 100;
    var minHeight = 80;
    var maxHeight = 150;
    var width = Math.floor(Math.random() * (maxWidth - minWidth + 1) + minWidth);
    var height = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
    var x = Math.floor(Math.random() * (game.canvas.width - 700) + 400);
    var rand = Math.floor(Math.random() * 2 + 1);
    if (rand == 1) {
        power.push(new newComponent(x, 0, width, height, "", "horlicks", 0, 2));

    } else if (rand == 2) {
        power.push(new newComponent(x, 0, width, height, "", "flight", 0, 2));
    }
}


document.onkeydown = function(event) {
    if (event.keyCode == 39) {

        game.context.save();
        game.context.translate(bCircle.x, bCircle.y);
        game.context.rotate(rotAngle);

        circleRed.clockwiseRot();
        circleBlue.clockwiseRot();

        if (!collide) {
            circleBlue.x = game.canvas.width / 2 + bCircle.radius * Math.cos(2 * circleBlue.radians);
            circleBlue.y = game.canvas.height - 300 + bCircle.radius * Math.sin(2 * circleBlue.radians);
            circleRed.x = game.canvas.width / 2 - bCircle.radius * Math.cos(2 * circleRed.radians);
            circleRed.y = game.canvas.height - 300 - bCircle.radius * Math.sin(2 * circleRed.radians);
        } else {
            circleBlue.x = game.canvas.width / 2 + bCircle.radius * Math.cos(2 * circleBlue.radians);
            circleBlue.y = game.canvas.height - 300 + bCircle.radius * Math.sin(2 * circleBlue.radians);
            circleRed.x = game.canvas.width / 2 + bCircle.radius * Math.cos(2 * circleRed.radians);
            circleRed.y = game.canvas.height - 300 + bCircle.radius * Math.sin(2 * circleRed.radians);
        }


        circleBlue.update();
        circleRed.update();
        game.context.translate(-1 * bCircle.x, -1 * bCircle.y);
        game.context.restore();

    } else if (event.keyCode == 37) {
        game.context.save();
        game.context.translate(bCircle.x, bCircle.y);
        game.context.rotate(-rotAngle);

        circleBlue.cClockwiseRot();
        circleRed.cClockwiseRot();

        if (!collide) {

            circleBlue.x = game.canvas.width / 2 + bCircle.radius * Math.cos(2 * circleBlue.radians);
            circleBlue.y = game.canvas.height - 300 + bCircle.radius * Math.sin(2 * circleBlue.radians);
            circleRed.x = game.canvas.width / 2 - bCircle.radius * Math.cos(2 * circleRed.radians);
            circleRed.y = game.canvas.height - 300 - bCircle.radius * Math.sin(2 * circleRed.radians);
        } else {
            circleBlue.x = game.canvas.width / 2 + bCircle.radius * Math.cos(2 * circleBlue.radians);
            circleBlue.y = game.canvas.height - 300 + bCircle.radius * Math.sin(2 * circleBlue.radians);
            circleRed.x = game.canvas.width / 2 + bCircle.radius * Math.cos(2 * circleRed.radians);
            circleRed.y = game.canvas.height - 300 + bCircle.radius * Math.sin(2 * circleRed.radians);
        }


        circleBlue.update();
        circleRed.update();
        game.context.translate(-1 * bCircle.x, -1 * bCircle.y);
        game.context.restore();
    } else if (event.keyCode == 80) {
        if (!pausedGame) {
            pausedGame = true;
            pauseTime = Date.now() / 1000;
            console.log("pause");
            return false;
        }
    } else if (event.keyCode == 82) {
        if (pausedGame) {
            pausedGame = false;
            resumeTime = Date.now() / 1000;
            updateGame();
            return false;
        }
    } else if (event.keyCode == 69) {
        scoreList = [];
        obstacles = [];
        power = [];
        game = undefined;
        cancelAnimationFrame(id);
        pausedGame = false;
        pauseTime = 0;
        resumeTime = 0;
        gameArea();
        startGame();
        return false;
    } else if (event.keyCode == 77) {
        scoreA = 0;
        scoreB = 0;
        multi = true;
        game.context.restore();
        startGame();
        //multi
        return false;
    } else if (event.keyCode == 83) {
        //single
        game.context.restore();
        startGame();
        return false;
    }

}


function startScreen() {
    gameArea();
    var ctx = game.context;

    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillRect(0, 0, game.canvas.width * 0.2, game.canvas.height);

    ctx.font = "40px Consolas"
    ctx.fillText("Welcome To Duet", 100, 100);

    ctx.font = "30px Consolas";
    ctx.fillText("With the arrival of long, lazy days and light, balmy evenings of the summer months,", 100, 200);
    ctx.fillText("Rishavhas decided to give in to the new trend of freckling, or as most would call it, summer fling.", 100, 240);
    ctx.fillText("He's heads over heels for this girl named Phoebe, but she's franticallyrunning away, ", 100, 280);
    ctx.fillText("always making sure that she's at a constant distance from him.", 100, 320);
    ctx.fillText("Help him get his girl.", 100, 360);

    ctx.font = "35px Consolas";
    ctx.fillText("Instruction: ", 100, 500);
    ctx.fillText("Use Arrow Keys (left and right) to rotate and escape the obstacles", 100, 550);
    ctx.fillText("Press P to Pause", 100, 600);
    ctx.fillText("Press R to Resume", 100, 650);
    ctx.fillText("Press E to Restart", 100, 700);

    ctx.fillText("Press M for Multiplayer", 100, 900);
    ctx.fillText("Press S for Single Player", 100, 1000);
}


function crashText() {

    var ctx = game.context;
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.fillRect(0, 0, game.canvas.width * 0.2, game.canvas.height);


    score.x = 200;
    score.y = 500;
    score.text = "SCORE:" + curr_score;
    score.update();

    score.y = 700;
    score.text = "LEADERBOARD";
    score.update();

    score.y = 800;
    score.text = "TOP SCORE: " + scoreList[0];
    score.update();

    if (scoreList.length >= 2) {
        score.y = 900;
        score.text = "SECOND: " + scoreList[1];
        score.update();
    }

    if (scoreList.length >= 3) {
        score.y = 1000;
        score.text = "THIRD: " + scoreList[2];
        score.update();
    }

    document.querySelector("#score").classList.add("hidden");

    game.context.fillStyle = "rgba(255,255,255,0.3)";
    game.context.font = "40px Consolas"
    game.context.fillText("Press Any Key to Play Again", 200, 1200);
}

function multiText() {

    var ctx = game.context;
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.fillRect(0, 0, game.canvas.width * 0.2, game.canvas.height);
    ctx.restore();

    document.querySelector("#score").classList.add("hidden");

    score.x = 200;
    score.y = 700;
    score.text = "Your Score: " + curr_score;
    score.update();

    if (flag == 1) {
        game.context.fillStyle = "rgba(255,255,255,0.3)";
        game.context.font = "60px Consolas"
        game.context.fillText("B's Turn. Press Any Key to Play", 200, 1000);
        flag = 0;
    } else {
        score.x = 200;
        score.y = 800;
        score.text = "Your Opponent's Score: " + scoreA;
        score.update();

        if (scoreA >= scoreB) {
            game.context.fillStyle = "rgba(255,255,255,0.3)";
            game.context.font = "60px Consolas"
            game.context.fillText("Oops! Your opponent won", 300, 1000);
        } else {
            game.context.fillStyle = "rgba(255,255,255,0.3)";
            game.context.font = "60px Consolas"
            game.context.fillText("Yayy You Won", 200, 1200);
        }

        scoreB = 0;
        scoreA = 0;
        flag = 1;

        game.context.fillStyle = "rgba(255,255,255,0.3)";
        game.context.font = "40px Consolas"
        game.context.fillText("Press Any Key to start a New Game", 200, 1400);


    }

}
