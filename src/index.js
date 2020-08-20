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
let scale = 64;
let saved = false;
let game_state = "editor";// default home, editor for worldedit
let menu_state = "new";

let editor_state = "tile"; // tile or map
let editor_x = 0;
let editor_y = 0;
let editor_tile = 0;
let editor_tile_max = 5;

let editor_menu_state = "save"; // also load/clear/exit
let map_width = scale*10*10;
let map_height = scale*6*10;
let tile_map = []
//generate empty map
for (x = 0; x<10; x++)
{
  tile_map[x] = [];
  for (y = 0;y<10;y++)
  {
    tile_map[x][y] = [];
    tile_map[x][y] = 
    "01010101010101010101" + 
    "01040202020202020201" +
    "01020203020203020201" + 
    "03030303030303030303" +
    "01020202020202020201" +
    "01010101010101010101"
  }
}
var player = {
	xp: 0,
	level: 0,
	gold: 0,
  skills: {},
  spells: {},
  inventory: {},
  hp: 8,
  maxhp : 10,
  x: 320,
  y: 196,

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
      drawGame();
      break;
    case "editor":
      drawEditor();
      break;
    case "editor-menu":
      drawEditorMenu();
      break;
  }
 
}


canvas.addEventListener('click', (e) => {
  const mousePos = {
    x: e.clientX - canvas.offsetLeft,
    y: e.clientY - canvas.offsetTop
  };
  // each states hitboxes needs to be handled here. 

})

window.addEventListener( "keydown", (e) => {
  // handle keyboard input based on game_state etc. 
  
  switch(game_state)
  {
    case "home":
      if (e.keyCode == 40)
      {
        switch(menu_state)
        {
          case "new":
            if (saved) menu_state = "old"; else menu_state = "settings";
            break;
          case "old":
            menu_state = "settings";
            break;
          case "settings":
            menu_state = "about";
            break;
          case "about":
            menu_state = "new";
            break;
        }
      } 
      if (e.keyCode == 38)
      {
        switch(menu_state)
        {
          case "settings":
            if (saved) menu_state = "old"; else menu_state = "new";
            break;
          case "about":
            menu_state = "settings";
            break;
          case "new":
            menu_state = "about";
            break;
          case "old":
            menu_state = "new";
            break;
        } 
        

      }
      if (e.keyCode == 13)
      {
        switch(menu_state)
        {
          case "new":
            game_state = "new";
            break
          case "old":
            break
          case "settings":
            game_state = "settings"
            break
          case "about":
            game_state = "about"
            break
        }  
      }
      break;
    case "about":
      if (e.keyCode == 13) game_state = "home";
      
      break;
    case "settings":
      
      break;
    case "load":
      break;
    case "save":
      break;
    case "new":
      break;
    case "editor":
      if (e.keyCode == 13)
      {
        //open context menu
        game_state = "editor_menu";  
      }
      if (e.keyCode == 69)
      {
        // switch between map and tile
        editor_state = editor_state=="map"? "tile" : "map";
      }
      if (e.keyCode == 40) // down
      {
        if (editor_state == "map" && editor_y<5)
        {
          editor_y++
        }
      }
      if (e.keyCode == 38) // up
      {
        if (editor_state == "map" && editor_y>0)
        {
          editor_y--
        }
      }
      if (e.keyCode == 37) // left
      {
        if (editor_state == "map" && editor_x>0)
        {
          editor_x--
        }
        if (editor_state == "tile")
        {
          editor_tile--;
          if (editor_tile <0)
          {
            editor_tile = editor_tile_max;
          }
        }
      }
      if (e.keyCode == 39) // right
      {
        if (editor_state == "map" && editor_x<9)
        {
          editor_x++
        }
        if (editor_state == "tile")
        {
          editor_tile++;
          if (editor_tile >editor_tile_max)
          {
            editor_tile = 0;
          }
        }
      }
      if (e.keyCode == 32) 
      {
        if (editor_state = "map")
        {
          
          
          tile_map[0][0] = tile_map[0][0].substring(0,2*(editor_x+editor_y*10)) + pad(editor_tile) + tile_map[0][0].substring(2*(editor_x+editor_y*10)+2,tile_map[0][0].length)
          
          
        }
      }
      break;
    case "editor-menu":

      break;
  }
});

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
  drawCharacter(0,0, scale, 'red','blue', 'witch')
  ctx.fillStyle = "red";
  switch(menu_state) {
    case "new" : 
      ctx.strokeRect((width/2)-79,(height*0.45)-30,158,40)
      break;
    case "old" : 
      ctx.strokeRect((width/2)-79,(height*0.60)-30,158,40)
      break;
    case "settings" :
      ctx.strokeRect((width/2)-79,(height*0.75)-30,160,40)
      break;
    case "about" :
      ctx.strokeRect((width/2)-80,(height*0.9)-30,160,40)
      break
      
  }
}

function drawAbout()
{
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle="orange";
  ctx.fillRect((width/2)-80,(height*0.8)-30,160,40)
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";

  ctx.fillText("You are a witches apprentice. ", width/2, height*0.1);
  ctx.fillText("Find ingredients for your potions", width/2, height*0.2);
  ctx.fillText("and spells. Help the inhabitants ", width/2, height*0.3);
  ctx.fillText("of the town and they will reward you. ", width/2, height*0.4);
  ctx.fillText("Good Luck!", width/2, height*0.6);

  
  ctx.fillText("Back", width/2, height*0.8);

}

function drawSettings()
{
  ctx.clearRect(0, 0, width, height);

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
  
  // body
  ctx.fillStyle = secondary;
  ctx.beginPath();
  ctx.arc(x+scale*0.5,y+scale*0.9,scale*0.25,Math.PI*1,Math.PI*2);
  ctx.fill();
  ctx.fillStyle = primary;
  // head
  ctx.beginPath();
  ctx.arc(x+scale*0.5,y+scale*0.5,scale*0.15,0,Math.PI*2);
  ctx.fill();

  ctx.fillStyle=primary
  ctx.fillRect(x + scale*0.4,y + scale*0.9,scale*0.05,scale*0.1)
  ctx.fillRect(x + scale*0.55,y + scale*0.9,scale*0.05,scale*0.1)
  
  if (type=='witch')
  {
    drawLogo(x+scale*0.5,y,scale*0.5,scale*0.5)
    

  }
  
}





function drawGame()
{
  ctx.clearRect(0, 0, width, height);
  drawRoom(player.x,player.y)
  drawCharacter(player.x % (10 * scale),player.y % (6*scale),scale,"blue","red","witch")
  drawHud()
}

function drawEditor()
{
  ctx.clearRect(0,0, width,height);
  drawRoom(1,1);
  if (editor_state=="map")
    ctx.strokeStyle = "white";
  else
    ctx.strokeStyle = "grey";
  ctx.lineWidth = 2
  ctx.strokeRect(scale*editor_x,scale*editor_y,scale,scale)
  //drawCharacter(player.x % (10 * scale),player.y % (6*scale),scale,"blue","red","witch")
  drawEditorHud();
}

function drawRoom(px,py)
{
  var rx = Math.floor(px / (10*scale));
  var ry = Math.floor(py / (6*scale));
  var tile = "00";
  for( dx=0;dx<10;dx++)
  {
    for(dy=0; dy<6;dy++)
    {
      //tile = tile_map[rx,ry].substring(dx+(dy*10)*2,dx+(dy*10)*2+1);
      tile = tile_map[rx][ry];
      tile = tile.substr((dx+(dy*10))*2,2)
      drawTile(dx*scale, dy*scale, scale,tile)
      
    }
  }
  // draw background entities here
  // draw npc's here
  // console.log(
  
  // draw foreground entities here
}

function drawHud()
{
  var bezel = 4;
  ctx.fillStyle = "#202020";
  ctx.fillRect(0,6*scale,width,height - 6*scale)
  ctx.fillStyle = "#808080";
  ctx.fillRect(0,6*scale,width-bezel,height - 6*scale-bezel)
  ctx.fillStyle = "#505050";
  ctx.fillRect(bezel,6*scale+bezel,width-bezel*2,height - 6*scale-bezel*2)
  ctx.fillStyle = "black";
  ctx.arc(320,6*scale+48,40,0,Math.PI*2)
  ctx.fill();
  ctx.fillStyle = "red";
  ctx.beginPath()
  console.log("left: " + player.hp/player.maxhp*Math.PI)
  console.log("right: " + (Math.PI -  player.hp/player.maxhp*Math.PI))
  ctx.arc(320,6*scale+48,40,player.hp/player.maxhp*Math.PI + Math.PI,Math.PI*2 -  player.hp/player.maxhp*Math.PI)
  ctx.fill();
  player.hp -= 0.01;

}

function drawEditorHud()
{
  var bezel = 4;
  ctx.fillStyle = "#202020";
  ctx.fillRect(0,6*scale,width,height - 6*scale)
  ctx.fillStyle = "#808080";
  ctx.fillRect(0,6*scale,width-bezel,height - 6*scale-bezel)
  ctx.fillStyle = "#505050";
  ctx.fillRect(bezel,6*scale+bezel,width-bezel*2,height - 6*scale-bezel*2)

  for (i=0;i<5;i++)
  {
    drawTile(16+i*24,6*64+24,24,pad(i))
    
  }
  if (editor_state=="tile")
    ctx.strokeStyle = "white";
  else
    ctx.strokeStyle = "grey";
  ctx.lineWidth = 2
  ctx.strokeRect(16+editor_tile*24,6*64+24,24,24)
}

function pad(num) {
  var s = "00" + num;
  return s.substr(s.length-2);
}

function drawTile(x,y,s,code)
{
    switch(code)
    {
        case "00":
            break;
        case "01":
            //draw wall
            drawWall(x, y, s, "#303030", "#404040")
            break;
        case "02":
            //draw sparse grass
            drawGrass(x,y,s,'#00aa00','#784642')
            break;
        case "03":
            //draw thick grass
            drawGrass(x,y,s,'#00aa00','green')
            break;
        case "04":
            //draw tree
            drawTree(x,y,s,'green','#522c29')
            break;
        case "05":
            //draw dirt
            break;
    }
}

function drawWall(x,y,s,primary,secondary)
{
  ctx.fillStyle=secondary
  ctx.fillRect(x,y,s,s)
  ctx.strokeStyle = primary
  ctx.lineWidth = 4

  ctx.beginPath()
  ctx.moveTo(x,y + s/2)
  ctx.lineTo(x+s,y + s/2)
  ctx.stroke()

  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x,y )
  ctx.lineTo(x+s,y )
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(x,y+s-2 )
  ctx.lineTo(x+s,y+s-2 )
  ctx.stroke()

  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(x+s-2,y + s/2)
  ctx.lineTo(x+s-2,y+s)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(x + s/2 -2 ,y)
  ctx.lineTo(x+ s/2 -2,y+s/2)
  ctx.stroke()

}

function drawGrass(x,y,scale,primary,secondary)
{
  ctx.fillStyle=secondary
  ctx.fillRect(x,y,scale,scale)
  ctx.strokeStyle=primary
  ctx.lineWidth =4

  ctx.beginPath()
  ctx.moveTo(x+scale*0.3,y+scale*0.8)
  ctx.lineTo(x+scale*0.28,y+scale*0.6)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(x+scale*0.7,y+scale*0.78)
  ctx.lineTo(x+scale*0.72,y+scale*0.58)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(x+scale*0.5,y+scale*0.58)
  ctx.lineTo(x+scale*0.52,y+scale*0.3)
  ctx.stroke()

}

function drawTree(x,y,s,primary,secondary)
{
  ctx.fillStyle=secondary
  ctx.fillRect(x+s*0.4,y+s*0.5,s*0.2,s*0.5)
  ctx.fillStyle=primary
  ctx.beginPath()
  ctx.moveTo(x+s*0.5,y)
  ctx.lineTo(x+s*0.8,y+s*0.7)
  ctx.lineTo(x+s*0.5,y+s*0.6)
  ctx.lineTo(x+s*0.2,y+s*0.7)
  ctx.lineTo(x+s*0.5,y)
  ctx.fill()
  

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
