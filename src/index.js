const width = 640;
const height = 480;
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
let size = { width: 50, height: 50 };
let position = { x: 0, y: 0 };
let velocity = { x: 1, y: 1 };
let states = [
  "home",
  "about",
  "settings",
  "save",
  "load",
  "new",
  "open",
  "brewing",
  "talking",
  "disecting",
  
]

let imgs = [];

let saved = false;
let game_state = "home";

var player = {
	xp: 0,
	level: 0,
	gold: 0,
  skills: {},
  spells: {},
  inventory: {},
};

canvas.width = width;
canvas.height = height;

function draw() {
  requestAnimationFrame(draw);

  switch(game_state)
  {
    case "home":
      drawMenu();
      break;
    case "about":
      drawAbout();
      break;
    case "settings":
      drawSettings();
      break;
    case "load":
      break;
    case "save":
      break;
    case "new":
      break;
  }
 

 

  
}

function drawMenu()
{
  ctx.clearRect(0, 0, width, height);
  ctx.font="30px tahoma";

  ctx.fillStyle = "orange";
  ctx.fillRect((width/2)-80,(height*0.45)-30,160,40)
  
  ctx.fillRect((width/2)-80,(height*0.75)-30,160,40)
  ctx.fillRect((width/2)-80,(height*0.9)-30,160,40)
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";

  ctx.fillText("New Game", width/2, height*0.45);
  
  ctx.fillText("Settings", width/2, height*0.75);
  ctx.fillText("About", width/2, height*0.9);

  // reload savegame
  if (saved) ctx.fillStyle = "orange"; else ctx.fillStyle = "#bf6c13";
  ctx.fillRect((width/2)-80,(height*0.60)-30,160,40)
  if (saved) ctx.fillStyle = "#fff"; else ctx.fillStyle = "grey";
  ctx.fillText("Load Game", width/2, height*0.6);
  
  drawLogo(width/2,height*0.05,128,128)
  drawCharacter(0,0, 64, 'red','blue', 'witch')
}

function drawAbout()
{

}

function drawSettings()
{

}

function drawLogo(x,y,w,h)
{
  
  
  ctx.fillStyle = '#aaa';
  ctx.beginPath();
  ctx.ellipse(x, y+(h*0.85), w*0.45, h*0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#666';
  ctx.beginPath();
  ctx.ellipse(x, y+(h*0.85), w*0.45, h*0.1, 0, Math.PI *1.7, Math.PI * 2.7);
  ctx.fill();

  ctx.fillStyle = '#b476de';
  ctx.beginPath();
  ctx.ellipse(x, y+(h*0.79), w*0.3, h*0.08, 0, 0, Math.PI * 2.0);
  ctx.fill();

  ctx.fillStyle = '#aaa';
  ctx.beginPath();
  ctx.moveTo(x - w*0.3,y + (h*0.79));
  ctx.lineTo(x - w*0.25,y+(h*0.5));
  ctx.lineTo(x ,y+(h*0.35));
  ctx.lineTo(x +w*0.3 ,y+(h*0.3));
  ctx.lineTo(x +w*0.7 ,y+(h*0.55));
  ctx.lineTo(x +w*0.4,y+(h*0.5));

  ctx.lineTo(x + w*0.25,y+(h*0.5));
  ctx.lineTo(x + w*0.3,y+ (h*0.79));
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#b476de';
  ctx.beginPath();
  ctx.moveTo(x - w*0.3,y + (h*0.79));
  ctx.lineTo(x - w*0.29,y + (h*0.7));
  ctx.lineTo(x + w*0.3,y + (h*0.7));
  ctx.lineTo(x + w*0.3,y + (h*0.79));
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#aaa';
  ctx.beginPath();
  ctx.ellipse(x, y+(h*0.7), w*0.29, h*0.07, 0, 0, Math.PI * 2.0);
  ctx.fill();

}

function drawCharacter(x,y,scale,primary,secondary,type)
{
  ctx.fillStyle="green";
  ctx.fillRect(x,y,scale,scale);
  
  ctx.fillStyle = primary;
  // head
  ctx.beginPath();
  ctx.arc(x+scale/2,y+scale*0.5,scale*0.25,0,Math.PI*2);
  ctx.fill();
  // body
  ctx.fillStyle = secondary;
  ctx.beginPath();
  ctx.arc(x+scale/2,y+scale,scale*0.25,Math.PI*1,Math.PI*2);
  ctx.fill();
  if (type=='witch')
  {
    ctx.beginPath();
    ctx.moveTo(x+scale*0.25,y+scale*0.25);
    ctx.lineTo(x+scale/2,y);
    ctx.lineTo(x+scale*0.75,y+scale*0.25);
    ctx.closePath();
    ctx.fill();
  }
  
}

function loadGame()
{
  var gameLoad = JSON.parse(localStorage.getItem('witchesApprentice'));
  player = gameLoad;
  console.log(player);
} 

function hasSave()
{
  var gameLoad = JSON.parse(localStorage.getItem('witchesApprentice'));
  if (gameLoad)
  {
    return true;
  }
  return false;
}

function saveGame()
{
  try {
    localStorage.setItem('witchesApprentice',JSON.stringify(player));
  } catch(err) {
    console.log('Cannot access localStorage');
  }
  console.log('game saved')
}

function deleteGame()
{
  localStorage.removeItem('witchesApprentice');
}

if (hasSave()) saved = true; else saved = false;

draw();
