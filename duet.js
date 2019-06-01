var pause = document.querySelector("#pause");
var resume = document.querySelector("#resume");
var reset = document.querySelector("#restart");
// var multi = document.querySelector("#multi");
var li = document.createElement("LI");
var color = ["#f0e310","#000080","#FE77FE"];
var time = 0;
var bCircle,circleBlue,circleRed,score,boostTime,flightTime,start_time,vy,curr_score,obstacles,game,title,scoreList = [],pauseTime,resumeTime,power,rotAngle,powerBoost,flight,n,pausedGame,affection,affOuter;

startScreen();

class newComponent{

	constructor(x,y,width,height,color,type,radius,vy){
		this.type = type;
		this.width = width;
		this.height = height;
		this.x = x;
		this.y = y;	
		this.radius = radius;	
		this.color = color;
		this.vy = vy;
	}

	update(){
		if(this.type == "bcircle"){
			var ctx = game.context;
			ctx.beginPath();
			ctx.arc(this.x,this.y,this.radius,0,2*Math.PI);
			ctx.strokeStyle = "rgba(0, 200, 255, 0.5)";
			ctx.lineWidth = "4";
			ctx.shadowBlur = 20;
			ctx.shadowColor = "white";
			ctx.stroke();
			ctx.closePath();
		}
		else if(this.type == "circle"){
			var ctx = game.context;
			// var image = new Image();
			ctx.beginPath();
			ctx.arc(this.x,this.y,this.radius,0,2*Math.PI);
			ctx.fillStyle = this.color;
			ctx.shadowBlur = 20;
			ctx.shadowColor = "white";
			ctx.fill();
			ctx.closePath();
		}
		else if(this.type == "score"){
			var ctx = game.context;
			ctx.beginPath();
			ctx.fillStyle = this.color;
			ctx.font = "60px Consolas";
			ctx.shadowBlur = 20;
			ctx.shadowColor = "#71c7ec";
			ctx.fillText(this.text,this.x,this.y);
			ctx.closePath();
		}
		else if(this.type == "horlicks"){
			var ctx = game.context;
			ctx.shadowBlur = 0;
			ctx.shadowColor = "black";
			var img = new Image();
			img.src = "horlicksmod.jpg"
			ctx.drawImage(img,0,0,60,60,this.x,this.y,60,60);
		}
		else if(this.type == "flight"){
			var ctx = game.context;
			ctx.shadowBlur = 0;
			ctx.shadowColor = "black";
			var img = new Image();
			img.src = "flightmod.jpg";
			ctx.drawImage(img,30,30,60,60,this.x,this.y,60,60);
		}
		else if(this.type == "affection"){
			var ctx = game.context;
			ctx.fillStyle = this.color;
			ctx.rect(this.x,this.y,this.width,this.height);
			ctx.fill();
		}
		else if(this.type == "bar"){
			var ctx = game.context;
			ctx.strokeStyle = "#FFFFFF";
			ctx.shadowBlur = 20;
			ctx.shadowColor = "#FFFFFF";
			ctx.rect(this.x,this.y,this.width,this.height);
			ctx.stroke();
		}
		else{
			var ctx = game.context;
			ctx.beginPath();
			ctx.fillStyle = this.color;
			ctx.shadowBlur = 20;
			ctx.shadowColor = this.color;
			this.y += this.vy;
			ctx.rect(this.x,this.y,this.width,this.height);
			ctx.fill();	
			ctx.closePath();
		}
		
	}


	crash(obstacle){
		var circleX = this.x;
		var circleY = this.y;
		var radius = this.radius;
		var otherX = obstacle.width/2 + obstacle.x;
		var otherY = obstacle.height/2 + obstacle.y;
		var distX = Math.abs(circleX - otherX);
		var distY = Math.abs(circleY - otherY);

		if(distX > (radius + obstacle.width/2) || distY > (radius + obstacle.height/2)){
			return false;
		}
		if(distX <= obstacle.width/2 || distY <= obstacle.height/2){
			return true;
		}
		var dx = distX-obstacle.width/2;
		var dy=distY-obstacle.height/2;
		return (dx * dx + dy * dy <= (radius * radius));

	}


}

function startGame(){

	bCircle = new newComponent(900,1200,0,0,"","bcircle",200);
	circleRed = new newComponent(700,1200,0,0,"red","circle",40);
	circleBlue = new newComponent(1100,1200,0,0,"blue","circle",40);
	score = new newComponent(1300,50,0,0,"white","score");
	title = new newComponent(900,80,0,0,"white","score");
	affOuter = new newComponent(300,50,400,30,"","bar");
	affection = new newComponent(300,50,0,0,"#d74f6b","affection");
	resumeTime = 0;
	pauseTime = 0;
	time_elaspse = 0;
	powerBoost = false;
	numR = 0;
	rotAngle = 2;
	boostTime = 9999999999999;
	flightTime = 0;
	flight = false;
	obstacles = [];
	power = [];
	pausedGame = false;
	n = 150;
	curr_score = 0;
	vy = 1;
	start_time = Date.now()/1000;
	//clearing scoreboard
	var ol = document.querySelector("#list");
	while(ol.firstChild){
		ol.removeChild(ol.firstChild);
	}	
	initialScore();
	updateGame();
	

}

function gameArea(){
	game = {
		canvas: document.querySelector("#canvas"),
		start: function(){
			this.canvas.width = 1800;
			this.canvas.height = 1600;
			this.context = this.canvas.getContext("2d"); 
			this.canvas.fillStyle = "black";
			this.frameNo = 0;
			this.context.fillRect(0,0,this.canvas.width,this.canvas.height);
			
		},
		clear: function(){
			this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
		},
		res: function(){
			this.context.fillStyle = "black"
			this.context.fillRect(0,0,this.canvas.width,this.canvas.height);
		},

	};
	game.start();
}

function initialScore(){
	var ol = document.querySelector("#list");
	for(var i = 0;i<scoreList.length;i++){
		var li = document.createElement("LI");
		li.innerHTML = scoreList[i];
		ol.appendChild(li);
	}
}

function updateGame(){
	if(!pausedGame){
		if(!powerBoost){
			// for(var i = 0;i<obstacles.length;i++){
			// 	if(circleRed.crash(obstacles[i]) || circleBlue.crash(obstacles[i])){
			// 		game.res();

			// 		crashText();

			// 		obstacles = [];
			// 		power = [];

			// 		scoreList.push(curr_score);
			// 		scoreList.sort(function(a,b){return (b - a)});

			// 		game = undefined;

			// 		cancelAnimationFrame(id);

			// 		document.onkeypress = function(event){
			// 			gameArea();
			// 			startGame();
			// 			document.body.removeChild(document.body.lastChild);
			// 		}

			// 		return;
			// 	}
			// }

			
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
		// if(timeNow - boostTime > 5000){
		// 	powerBoost = false;
		// 	circleBlue.radius = 40;
		// 	circleBlue.update();
		// 	boostTime = 99999999999999;
		// }



		//flight over
		if(timeNow - flightTime > 5000 && flight){
			rotAngle = 2;
			flight = false;

     	}
		
		


        //increase speed of obstacles with number of frames
		if(everyinterval(n*3)){
			vy += 0.5;
			if(n > 70){
				n-=30;
			}
			for (var i = 0; i < obstacles.length; i += 1) {
				obstacles[i].vy += vy;
				obstacles[i].y += obstacles[i].vy;
				obstacles[i].update();
			}
		}
         

         //drop power boosts 
		if(curr_score > 10){
			if(everyinterval(n*5)){

				powBoost();
			}
			for(var j = 0; j<power.length;j++){
				power[j].y += power[j].vy;
				power[j].update();
			}
		}

		if(game.frameNo == 1 || everyinterval(n)){
			newOb();
		}
		

		for (i = 0; i < obstacles.length; i += 1) {
			obstacles[i].y += obstacles[i].vy;
			obstacles[i].update();
		}	

		scoreCalc();
		scoreboard();
		id = window.requestAnimationFrame(updateGame);
	}
}

// function affectionMeter(){
// 	if(score)
// }

function crashPower(){
	for(var j = 0;j<power.length;j++){
			if(circleBlue.crash(power[j])){
				if(power[j].type == "flight"){
					rotAngle += 1;
					flightTime = Date.now();
					flight = true;
					// console.log("phew");
					// console.log(power.length);

				}
				else if(power[j].type == "horlicks"){
					powerBoost = true;
					circleBlue.radius *= 2;
					boostTime = Date.now();
				}
			  break;
			}

		}
}

function newOb(){
	var minWidth = 60;
	var maxWidth = 190;
	var minHeight = 80;
	var maxHeight = 150;
	var width = Math.floor(Math.random()*(maxWidth-minWidth+1) + minWidth);
	var height = Math.floor(Math.random()*(maxHeight-minHeight+1) + minHeight);
	var x = Math.floor(Math.random()*(game.canvas.width - 1200) + 300);
	var colorBlock = color[Math.floor(Math.random() * 3)];
	obstacles.push(new newComponent(x,0,width,height,colorBlock,"",0,vy));		
}

function everyinterval(n) {
	if ((game.frameNo/n) %1 == 0) {return true;}
	return false;
}


function scoreCalc(){
	var time_elaspse = Date.now()/1000;
	curr_score = parseInt(2*(time_elaspse - start_time - (resumeTime - pauseTime)));
	score.text = "SCORE: " + curr_score;
	score.update();
}

function scoreboard(){
	li.innerHTML = curr_score;
	var ol = document.querySelector("#list");
	ol.appendChild(li);
	for(var i = 0;i<scoreList.length;i++){
		if(curr_score > scoreList[i]){
			var ol = document.querySelector("#list");
			ol.insertBefore(li,ol.childNodes[i]);
			
		}
	}
}

function powBoost(){
	var minWidth = 40;
	var maxWidth = 100;
	var minHeight = 80;
	var maxHeight = 150;
	var width = Math.floor(Math.random()*(maxWidth-minWidth+1) + minWidth);
	var height = Math.floor(Math.random()*(maxHeight-minHeight+1) + minHeight);
	var x = Math.floor(Math.random()*(400) + 600);
	var rand = Math.floor(Math.random()*2 + 1);
	rand = 2;
	if(rand == 1){
		power.push(new newComponent(x,0,width,height,"","horlicks",0,vy));

	}
	else if(rand == 2){
		power.push(new newComponent(x,0,width,height,"","flight",0,vy));		
	}
}


document.onkeydown = function(event){
	if(event.keyCode == 39){
		game.context.save();
		game.context.translate(bCircle.x,bCircle.y);
		game.context.rotate(rotAngle*Math.PI/180);
		numR++;
		circleBlue.x = game.canvas.width/2 + bCircle.radius * Math.cos(2*rotAngle*numR*Math.PI/180);
		circleBlue.y = game.canvas.height - 400 + bCircle.radius * Math.sin(2*rotAngle*numR*Math.PI/180);
		circleRed.x = game.canvas.width/2 - bCircle.radius * Math.cos(2*rotAngle*numR*Math.PI/180);
		circleRed.y = game.canvas.height - 400 - bCircle.radius * Math.sin(2*rotAngle*numR*Math.PI/180);
		circleBlue.update();
		circleRed.update();
		game.context.translate(-1 * bCircle.x,-1 * bCircle.y);
		game.context.restore();
	}

	else if(event.keyCode == 37){
		game.context.save();
		game.context.translate(bCircle.x,bCircle.y);
		game.context.rotate(-2*Math.PI/180);
		numR--;
		circleBlue.x = game.canvas.width/2 + bCircle.radius * Math.cos(2*rotAngle*numR*Math.PI/180);
		circleBlue.y = game.canvas.height - 400 + bCircle.radius * Math.sin(2*rotAngle*numR*Math.PI/180);
		circleRed.x = game.canvas.width/2 - bCircle.radius * Math.cos(2*rotAngle*numR*Math.PI/180);
		circleRed.y = game.canvas.height - 400 - bCircle.radius * Math.sin(2*rotAngle*numR*Math.PI/180);
		circleBlue.update();
		circleRed.update();
		game.context.translate(-1 * bCircle.x,-1 * bCircle.y);
		game.context.restore();	
	}

}

pause.addEventListener("click",function(){
	if(!pausedGame){
		pausedGame = true;
		pauseTime = Date.now()/1000;
	}
})

resume.addEventListener("click",function(){
	pausedGame = false;
	resumeTime = Date.now()/1000;
	updateGame();
})

reset.addEventListener("click",function(){
	// game.res();
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

});

function startScreen(){
	gameArea();
	var ctx = game.context;
	ctx.save();
	ctx.fillStyle = "rgba(255,255,255,0.5)";
	ctx.fillRect(0,0,game.canvas.width*0.2,game.canvas.height);

	ctx.font = "40px Consolas"
	ctx.fillText("Welcome To Duet",200,100);

	ctx.font = "30px Consolas";
	ctx.fillText("With the arrival of long, lazy days and light, balmy evenings of the summer months,",200,200);
	ctx.fillText("Rishavhas decided to give in to the new trend of freckling, or as most would call it, summer fling.",200,240);
	ctx.fillText("He's heads over heels for this girl named Phoebe, but she's franticallyrunning away, ",200,280); 
	ctx.fillText("always making sure that she's at a constant distance from him.",200,320);
	ctx.fillText("Help him get his girl.",200,360);

	ctx.font = "35px Consolas";
	ctx.fillText("Instruction: ",200,500);
	ctx.fillText("Use Arrow Keys (left and right) to rotate and escape the obstacles",200,550);

	ctx.fillText("PRESS ANY KEY TO START THE GAME",600,800);

	document.onkeypress = function(event){
		startGame();
		ctx.restore();

	}

}

function crashText(){
	score.x = 800;
	score.y = 750;
	score.text = "SCORE:" + curr_score;
	score.update();

	game.context.fillStyle = "rgba(255,255,255,0.3)";
	game.context.font = "40px Consolas"
	game.context.fillText("Press Any Key to Play Again",800,850);	
}







