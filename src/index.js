const width = 1024;
const height = 768;
const canvas = document.getElementById("game");
const scratch = document.getElementById("gen");
const ctx = canvas.getContext("2d");
const ctx2 = scratch.getContext("2d");
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

let editor_state = "add"; // add or edit
let e_c_state = 0 // 0 is no click, 1 is first click
let e_c_x = 0;
let e_c_y = 0;
let editor_tile = 0;
let editor_tile_max = 5;

let editor_menu_state = "save"; // also load/clear/exit
let map_width = scale*10*10;
let map_height = scale*6*10;

let mx = 0;
let my = 0;
let editor_map_zoom = 0;
let e_sprite_s = 0;
let e_layers_s = 0;

let world_elements = []


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

class MapElement {
  constructor(sp,x,y,w,h,sc,l) {
    this.sp = sp
    this.x = x
    this.y = y
    this.w = w
    this.h = h
    this.sc = sc
    this.l = l
    
  }
  
}

class Sprite {
  constructor(t,s,c1,c2,c3) {
    //scratch.width=s
    //scratch.height=s
    this.t = t
    this.s = s
    ctx2.clearRect(0, 0, s, s)
    eval(this.t)(ctx2,0,0,s,c1,c2,c3)
    
    this.i = new Image()
    this.i.src = scratch.toDataURL()
    
  }
  draw(c,x,y)
  {
    
    c.drawImage(this.i,x,y)
  }

}

var sprites = []
//drawWall(ctx,x, y, s, "#303030", "#404040")
sprites.push( new Sprite("drawWall",32,"#303030","#404040"))
sprites.push( new Sprite("drawTree",32,'green','brown'))

sprites.push( new Sprite("drawGrass",32,'#00aa00','#784642'))
sprites.push( new Sprite("drawGrass",32,'#00aa00','green'))
sprites.push( new Sprite("drawGrass",32,'#522c29','#824541'))
sprites.push( new Sprite("drawFloor",32,'#522c29','#824541'))

world_elements.push(new MapElement((sprites[4]),0,0,640,100,32,0))
world_elements.push(new MapElement((sprites[3]),0,100,640,300,32,1))
world_elements.push(new MapElement((sprites[0]),48,48,150,150,32,2))

world_elements.sort((a, b) => a.l - b.l)
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

function getMousePos(canvas, e) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

canvas.addEventListener('mousemove', function(e) {
  var mousePos = getMousePos(canvas, e);
  mx = mousePos.x;
  my = mousePos.y;
  console.log("X: " + mx)
  console.log('Y: ' + my)
}, false);

canvas.addEventListener('wheel',function(e){
  // e.deltaY
  console.log(e);
  return false; 
}, false);


canvas.addEventListener('click', (e) => {
  const mousePos = {
    x: e.clientX - canvas.offsetLeft,
    y: e.clientY - canvas.offsetTop
  };
  mx = mousePos.x;
  my = mousePos.y;
  // each states hitboxes needs to be handled here. 
  switch (game_state)
  {
    case "editor":
      switch (editor_state)
      {
        case "add":
          if (mx < width-200 && my < height-200)
          {
            // we are in the build area
            if (!e_c_state)
            {
              e_c_state++
              e_c_x = mx
              e_c_y = my
            } else
            {
              // add new bounding area
              world_elements.push(new MapElement((sprites[editor_tile]),e_c_x,e_c_y,mx-e_c_x,my-e_c_y,32,e_layers_s+1))
              e_layers_s++
              e_c_state = 0
            }
          }
      }
  }
})

canvas.addEventListener('auxclick', function(e) {
  if (e.button == 1) {
    // standard checks for 
  }
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
        editor_state = editor_state=="add"? "edit" : "add";
      }
      if (e.keyCode == 40) // down
      {
      
      }
      if (e.keyCode == 38) // up
      {
      
      }
      if (e.keyCode == 37) // left
      {
      
        if (editor_state == "add")
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
        
        if (editor_state == "add")
        {
          editor_tile++;
          if (editor_tile >=sprites.length)
          {
            editor_tile = 0;
          }
        }
      }
      if (e.keyCode == 32) 
      {
        
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
  
  drawLogo(ctx,width/2,height*0.05,128,128)
  drawCharacter(ctx,0,0, scale, 'red','blue', 'witch')
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

function drawLogo(c,x,y,w,h)
{
  
  
  c.fillStyle = '#aaa';
  c.beginPath();
  c.ellipse(x, y+(h*0.85), w*0.45, h*0.1, 0, 0, Math.PI * 2);
  c.fill();

  c.fillStyle = '#666';
  c.beginPath();
  c.ellipse(x, y+(h*0.85), w*0.45, h*0.1, 0, Math.PI *1.7, Math.PI * 2.7);
  c.fill();

  c.fillStyle = '#b476de';
  c.beginPath();
  c.ellipse(x, y+(h*0.79), w*0.3, h*0.08, 0, 0, Math.PI * 2.0);
  c.fill();

  c.fillStyle = '#aaa';
  c.beginPath();
  c.moveTo(x - w*0.3,y + (h*0.79));
  c.lineTo(x - w*0.25,y+(h*0.5));
  c.lineTo(x ,y+(h*0.35));
  c.lineTo(x +w*0.3 ,y+(h*0.3));
  c.lineTo(x +w*0.7 ,y+(h*0.55));
  c.lineTo(x +w*0.4,y+(h*0.5));

  c.lineTo(x + w*0.25,y+(h*0.5));
  c.lineTo(x + w*0.3,y+ (h*0.79));
  c.closePath();
  c.fill();

  c.fillStyle = '#b476de';
  c.beginPath();
  c.moveTo(x - w*0.3,y + (h*0.79));
  c.lineTo(x - w*0.29,y + (h*0.7));
  c.lineTo(x + w*0.3,y + (h*0.7));
  c.lineTo(x + w*0.3,y + (h*0.79));
  c.closePath();
  c.fill();

  c.fillStyle = '#aaa';
  c.beginPath();
  c.ellipse(x, y+(h*0.7), w*0.29, h*0.07, 0, 0, Math.PI * 2.0);
  c.fill();

}

function drawCharacter(c,x,y,scale,primary,secondary,type)
{
  
  // body
  c.fillStyle = secondary;
  c.beginPath();
  c.arc(x+scale*0.5,y+scale*0.9,scale*0.25,Math.PI*1,Math.PI*2);
  c.fill();
  c.fillStyle = primary;
  // head
  c.beginPath();
  c.arc(x+scale*0.5,y+scale*0.5,scale*0.15,0,Math.PI*2);
  c.fill();

  c.fillStyle=primary
  c.fillRect(x + scale*0.4,y + scale*0.9,scale*0.05,scale*0.1)
  c.fillRect(x + scale*0.55,y + scale*0.9,scale*0.05,scale*0.1)
  
  if (type=='witch')
  {
    drawLogo(c,x+scale*0.5,y,scale*0.5,scale*0.5)
    

  }
  
}

function drawArea(spr,x,y,s,w,h)
{
  
  scratch.width = w
  scratch.height = h
  for(i=0;i < w/s+1;i++)
  {
    for(j=0;j < h/s+1;j++)
    {
      ctx2.drawImage(spr.i,i*s,j*s);
    }
  }
  var i = new Image();
  i.src = scratch.toDataURL();
  ctx.drawImage(i,x,y);
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
  
  
  //drawArea(sprites[1],120,120,32,240,220)

  //drawArea(spr,135,145,32,220,220)
  
  //drawRoom(1,1);
  drawWorldElements(0,0)

  if (editor_state=="map")
    ctx.strokeStyle = "white";
  else
    ctx.strokeStyle = "grey";
  ctx.lineWidth = 2
  // change this to highlight the area currently selected in the layer list.
  //ctx.strokeRect(scale*editor_x,scale*editor_y,scale,scale)
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

function drawWorldElements(dx,dy)
{
  world_elements.forEach(function(e){
    
    drawArea((e.sp),e.x,e.y,32,e.w,e.h)
  })
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
  var b = 4;
  ctx.fillStyle = "#202020";
  ctx.fillRect(0,height-b,width,b)
  ctx.fillRect(width-b,0,b,height)
  ctx.fillStyle = "#808080";
  ctx.fillRect(0,height-200,width-b,200-b)
  ctx.fillRect(width-200,0,200-b,height -b)
  ctx.fillStyle = "#505050";
  ctx.fillRect(b,height-200+b,width-b*2,200-b*2)
  ctx.fillRect(width-200+b , b,200 - b*2,height - 200 )

  
  var i = 1;
  sprites.forEach(function(s) {
    s.draw(ctx,i*32,height-180)
    i++;
  })
  if (editor_state=="add")
    ctx.strokeStyle = "white";
  else
    ctx.strokeStyle = "grey";
  ctx.lineWidth = 2
  ctx.strokeRect(32+editor_tile*32,height-180,32,32)

  
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
            drawWall(ctx,x, y, s, "#303030", "#404040")
            break;
        case "02":
            //draw sparse grass
            drawGrass(ctx,x,y,s,'#00aa00','#784642')
            break;
        case "03":
            //draw thick grass
            drawGrass(ctx,x,y,s,'#00aa00','green')
            break;
        case "04":
            //draw tree
            drawTree(ctx,x,y,s,'green','#522c29')
            break;
        case "05":
            //draw dirt
            break;
    }
}

function drawWall(c,x,y,s,primary,secondary)
{
  c.fillStyle=secondary
  c.fillRect(x,y,s,s)
  c.strokeStyle = primary
  c.lineWidth = 4

  c.beginPath()
  c.moveTo(x,y + s/2)
  c.lineTo(x+s,y + s/2)
  c.stroke()

  c.lineWidth = 2
  c.beginPath()
  c.moveTo(x,y )
  c.lineTo(x+s,y )
  c.stroke()

  c.beginPath()
  c.moveTo(x,y+s-2 )
  c.lineTo(x+s,y+s-2 )
  c.stroke()

  c.lineWidth = 4
  c.beginPath()
  c.moveTo(x+s-2,y + s/2)
  c.lineTo(x+s-2,y+s)
  c.stroke()

  c.beginPath()
  c.moveTo(x + s/2 -2 ,y)
  c.lineTo(x+ s/2 -2,y+s/2)
  c.stroke()

}

function drawFloor(c,x,y,s,primary,secondary)
{
  c.fillStyle = secondary
  c.fillRect(x,y,s,s)
  c.strokeStyle=primary
  c.lineWidth =s/16
  
  c.beginPath()
  c.moveTo(x+s*0.25,y)
  c.lineTo(x+s*0.25,y+s)
  c.stroke()

  c.beginPath()
  c.moveTo(x+s*0.5,y)
  c.lineTo(x+s*0.5,y+s)
  c.stroke()

  c.beginPath()
  c.moveTo(x+s*0.75,y)
  c.lineTo(x+s*0.75,y+s)
  c.stroke()

  c.beginPath()
  c.moveTo(x,y+s*0.5 )
  c.lineTo(x+s*0.25,y+s*0.5 )
  c.stroke()

  c.beginPath()
  c.moveTo(x+s*0.5,y+s*0.5)
  c.lineTo(x+s*0.75,y+s*0.5)
  c.stroke()

}

function drawGrass(c,x,y,s,primary,secondary)
{
  c.fillStyle=secondary
  c.fillRect(x,y,s,s)
  c.strokeStyle=primary
  c.lineWidth =4

  c.beginPath()
  c.moveTo(x+s*0.3,y+s*0.8)
  c.lineTo(x+s*0.28,y+s*0.6)
  c.stroke()

  c.beginPath()
  c.moveTo(x+s*0.7,y+s*0.78)
  c.lineTo(x+s*0.72,y+s*0.58)
  c.stroke()

  c.beginPath()
  c.moveTo(x+s*0.5,y+s*0.58)
  c.lineTo(x+s*0.52,y+s*0.3)
  c.stroke()

}

function drawTree(c,x,y,s,primary,secondary)
{
  c.fillStyle=secondary
  c.fillRect(x+s*0.4,y+s*0.5,s*0.2,s*0.5)
  c.fillStyle=primary
  c.beginPath()
  c.moveTo(x+s*0.5,y)
  c.lineTo(x+s*0.8,y+s*0.7)
  c.lineTo(x+s*0.5,y+s*0.6)
  c.lineTo(x+s*0.2,y+s*0.7)
  c.lineTo(x+s*0.5,y)
  c.fill()
  

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
