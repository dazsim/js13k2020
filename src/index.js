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

function rgba(r,g,b,a) {
  
  return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
}
function sheet(x,seed = 0,a=255,b=255,c=255)
{
  
  x.lineWidth=2
  r=_=>(Math.sin(++s)+1)*1e9%255|0
  for(t=640;t--;)
  for(k=4;k--;)
  for(s=seed+t*t,i=r()/9+50|0;i--;)
  X=i&7,Y=i>>3,n=r()/255,d=a*n,e=b*n,f=c*n,
  r()<29?x.fillStyle=`rgb(${d},${e},${f})`:r()**2/2e3>X*X+(Y-5)**2&&x[k&2?'strokeRect':'fillRect'](7+t%30*16-k%2*2*X+X,3+(t>>5)*16+Y,1,1)
}

let imgs = [];
let scale = 64;
let saved = false;
let game_state = "editor";// default home, editor for worldedit
let menu_state = "new";
let pan = false;
let w_dx = 0;
let w_dy = 0;

let editor_state = "add"; // add or edit
let e_c_state = 0 // 0 is no click, 1 is first click
let e_c_x = 0;
let e_c_y = 0;
let editor_tile = 0;
let editor_tile_max = 5;
let editMode = 0; // 0 == world map. 1 == collision map

let editor_menu_state = "save"; // also load/clear/exit
let map_width = scale*10*10;
let map_height = scale*6*10;

let mx = 0;
let my = 0;
let wx = 0;
let wy = 0;
let editor_map_zoom = 0;
let e_sprite_s = 0;
let e_layers_s = 0;

let world_elements = []
let collision_elements = []

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
  constructor(i,t,s,c1,c2,c3) {
    //scratch.width=s
    //scratch.height=s
    this.t = t
    this.s = s
    this.i = i
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
sprites.push( new Sprite(0,"drawWall",32,"#303030","#404040"))
sprites.push( new Sprite(1,"drawTree",32,'#2a2','brown'))

sprites.push( new Sprite(2,"drawGrass",32,'#00aa00','#784642'))
sprites.push( new Sprite(3,"drawGrass",32,'#00aa00','green'))
sprites.push( new Sprite(4,"drawGrass",32,'#522c29','#824541'))
sprites.push( new Sprite(5,"drawFloor",32,'#522c29','#824541'))
sprites.push( new Sprite(6,"drawDoor",32,"black","brown"))
sprites.push( new Sprite(7,"drawDoor",32,"lightgrey","grey",1))
sprites.push( new Sprite(8,"drawWater",32,'cyan','blue',0))
sprites.push( new Sprite(9,"drawChair",32,"brown","brown",0))
sprites.push( new Sprite(10,"drawChair",32,"brown","brown",1))
sprites.push( new Sprite(11,"drawSolid",32,"grey"))
sprites.push( new Sprite(12,"drawSolid",32,"grey","lightgrey",1))
sprites.push( new Sprite(13,"drawSolid",32,"grey","lightgrey",2))
sprites.push( new Sprite(14,"drawSolid",32,"grey","lightgrey",3))
sprites.push( new Sprite(15,"drawSolid",32,"grey","lightgrey",4))
sprites.push( new Sprite(16,"drawCollide",32))



world_elements.push(new MapElement(0,96,128,96,96,64,1))
world_elements.push(new MapElement(0,384,288,96,96,64,2))
world_elements.push(new MapElement(0,544,192,192,224,64,3))
world_elements.push(new MapElement(5,576,224,128,160,64,4))
world_elements.push(new MapElement(3,96,256,224,256,64,5))
world_elements.push(new MapElement(6,608,384,32,32,64,6))
world_elements.push(new MapElement(6,128,192,32,32,64,7))
world_elements.push(new MapElement(5,128,160,32,32,64,8))
world_elements.push(new MapElement(5,416,320,32,32,64,9))
world_elements.push(new MapElement(6,416,352,32,32,64,10))
collision_elements.push(new MapElement(1,544,192,192,32,64,1))
collision_elements.push(new MapElement(1,704,224,32,192,64,1))
collision_elements.push(new MapElement(1,640,384,64,32,64,1))
collision_elements.push(new MapElement(1,544,384,64,32,64,1))
collision_elements.push(new MapElement(1,544,224,32,160,64,1))




world_elements.sort((a, b) => a.l - b.l)
collision_elements.sort((a,b) => a.l - b.l)
canvas.width =  width;
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
  if (!pan)
  {
    
    mx = mousePos.x;
    my = mousePos.y;
  } else
  {
    wx = wdx -mx + mousePos.x;
    wy = wdy -my + mousePos.y;
  }
  
}, false);

canvas.addEventListener('mousedown', e => {
  if (e.button==1)
  {
  mx = e.offsetX;
  my = e.offsetY;
  wdx = wx;
  wdy = wy;
  pan=true;
  e_c_state = 0
  
  }

});

canvas.addEventListener('mouseup', e => {

  if (e.button==1)
  {
    mx = e.offsetX;
    my = e.offsetY;
    wdx = wx;
    wdy = wy;
    pan=false;
  }

});

canvas.addEventListener('click', (e) => {
  const mousePos = {
    x: e.clientX - canvas.offsetLeft,
    y: e.clientY - canvas.offsetTop
  };
  
  mx = mousePos.x
  my = mousePos.y
  //mx = parseInt(((mousePos.x)*2)/scale) * (scale/2) ;
  //my = parseInt((mousePos.y*2)/scale) * (scale/2) ;
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
              
              

              
              e_c_x = parseInt(((mx - wx)*2/scale))* (scale/2) ;
              e_c_y = parseInt(((my - wy)*2/scale))* (scale/2);
            } else
            {
              // add new bounding area
              mx = parseInt(((mx - wx)*2/scale))* (scale/2);
              my = parseInt(((my - wy)*2/scale))* (scale/2);
              if ((mx == e_c_x) || (my == e_c_y)) return;
              if (mx < e_c_x)
              {
                var t = e_c_x
                e_c_x = mx
                mx = t
              }
              if (my < e_c_y)
              {
                var t = e_c_y
                e_c_y = my
                my = t
              }
              if (editMode)
              {
                collision_elements.push(new MapElement(1,e_c_x,e_c_y,mx-e_c_x,my-e_c_y,32,1)) 
                
              } else
              {
                world_elements.push(new MapElement(editor_tile,e_c_x,e_c_y,mx-e_c_x,my-e_c_y,32,e_layers_s+1)) 
                e_layers_s++
              }
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
      if (e.keyCode == 90)
      {
        editMode = 1-editMode;
        
      }

      if (e.keyCode == 67)
      {
        saveWorldClipboard()
      }
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

function drawArea(spr,x,y,s,w,h,o=1.0)
{
  
  scratch.width = w
  scratch.height = h
  ctx2.globalAlpha = o;
  for(i=0;i < w/s+1;i++)
  {
    for(j=0;j < h/s+1;j++)
    {
      ctx2.drawImage(spr.i,i*s,j*s);
    }
  }
  var i = new Image();
  i.src = scratch.toDataURL();
  ctx2.globalAlpha = 1.0;
  ctx.drawImage(i,x,y);

}




function drawGame()
{
  ctx.clearRect(0, 0, width, height);
  drawWorldElements(1.0);
  //sheet(ctx,0,215,185,37)
  //drawCharacter(ctx,player.x % (10 * scale),player.y % (6*scale),scale,"blue","red","witch")
  //drawEditorHud()
}

function drawEditor()
{
  ctx.clearRect(0,0, width,height);
  
  
  //drawArea(sprites[1],120,120,32,240,220)

  //drawArea(spr,135,145,32,220,220)
  
  //drawRoom(1,1);
  if (editMode)
  {
    drawWorldElements(0.5)
    drawCollideElements(1.0)
  } else
  {
    drawWorldElements(1.0)
  }
  drawOverlay(ctx);
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

function drawOverlay(c)
{
  var w_i = (width - 200) / (scale/2)
  var w_j = (height - 200) / (scale/2)
  c.lineWidth = 1
  c.strokeStyle = "#fff";
  for(i = -1; i < w_i+1;i++)
  {
    if (i*(scale/2) < width-200)
    {
      c.beginPath()
      c.moveTo(i*(scale/2)+1+wx%(scale/2),0)
      c.lineTo(i*(scale/2)+wx%(scale/2),height-200)
      c.stroke()
    }
  }
  for(j = -1; j < w_j+1; j++)
  {
    if (j*(scale/2) < height-200) 
    {
      c.beginPath()
      c.moveTo(0,j*(scale/2)+1+wy%(scale/2))
      c.lineTo(width-200,j*(scale/2)+wy%(scale/2))
      c.stroke()
    }
  }

  if (e_c_state)
  {
    c.strokeStyle = "#f00";
    c.beginPath()
    c.moveTo(e_c_x+wx-8,e_c_y+wy)
    c.lineTo(e_c_x+wx+8,e_c_y+wy)
    c.stroke()

    c.beginPath()
    c.moveTo(e_c_x+wx,e_c_y-8+wy)
    c.lineTo(e_c_x+wx,e_c_y+8+wy)
    c.stroke()
  }
}



function drawWorldElements(o = 1.0)
{
  world_elements.forEach(function(e){
    if (e.x + wx < width-200 && e.y + wy <height -200 && e.x+e.w+wx >0 && e.y+e.h+wy>0)
    {
      var dx = width-200-e.x-e.w-wx;
      var dy = height-200-e.y-e.h-wy;
      if (dx<0) dx = -dx 
      else dx = 0
      if (dy<0) dy = -dy 
      else dy = 0
      drawArea(sprites[e.sp],e.x+wx,e.y+wy,32,e.w-dx,e.h-dy,o) //TODO : clip to window
    }
  })
}

function drawCollideElements(o= 1.0)
{
  collision_elements.forEach(function(e){
    if (e.x + wx < width-200 && e.y + wy <height -200 && e.x+e.w+wx >0 && e.y+e.h+wy>0)
    {
      var dx = width-200-e.x-e.w-wx;
      var dy = height-200-e.y-e.h-wy;
      if (dx<0) dx = -dx 
      else dx = 0
      if (dy<0) dy = -dy 
      else dy = 0
      drawArea(sprites[16],e.x+wx,e.y+wy,32,e.w-dx,e.h-dy,o) //TODO : clip to window
    }
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

  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";

  //ctx.fillText("X: " + mx, width/2, height*0.8);
  //ctx.fillText("Y: " + mx, width/2, height*0.85);
  ctx.fillText("WX: " + wx, width-100, height*0.9);
  ctx.fillText("WX: " + wy, width-100, height*0.95);
}

function pad(num) {
  var s = "00" + num;
  return s.substr(s.length-2);
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

  c.lineWidth=s/32
  c.beginPath()
  c.moveTo(x+s-s/32,y)
  c.lineTo(x+s-s/32,y+s)
  c.stroke()

  c.beginPath()
  c.moveTo(x,y)
  c.lineTo(x,y+s)
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

function drawDoor(c,x,y,s,primary,secondary,t=0)
{
  c.fillStyle = secondary
  // body of door
  c.beginPath()
  c.arc(x+s*0.5,y+s*0.5,s*0.4,Math.PI*1,Math.PI*2)
  c.fill()
  c.fillRect(x+s*0.1,y+s*0.5,s*0.8,s*0.5)

  c.fillStyle = primary
  switch(t)
  {
    case 0:
      
      c.beginPath()
      c.arc(x+s*0.7,y+s*0.6,s*0.1,0,Math.PI*2)
      c.fill()
      break
    case 1:
      c.beginPath()
      c.moveTo(x+s*0.3,y+s*0.5)
      c.lineTo(x+s*0.7,y+s*0.5)
      c.moveTo(x+s*0.3,y+s*0.6)
      c.lineTo(x+s*0.7,y+s*0.6)
      c.moveTo(x+s*0.3,y+s*0.7)
      c.lineTo(x+s*0.7,y+s*0.7)
      c.stroke()    
  }

}

function drawWater(c,x,y,s,primary,secondary,t=0)
{
  c.clearRect(0,0, s,s);
  c.fillStyle = secondary
  c.fillRect(x,y,s,s)
  
  c.strokeStyle = primary

  c.moveTo(x+s*0.3, y+0.3)
    
  c.quadraticCurveTo(x+s*0.4, y+s*0.4, x+s*0.5, y+s*0.3)
  c.stroke()
}



function drawChair(c,x,y,s,primary,secondary,t=0)
{
  c.fillStyle = secondary
  c.beginPath()
  //c.arc(x+s*0.5,y+s*0.5,s*0.25,Math.PI*0,Math.PI*2)
  c.ellipse(x+s*0.5, y+s*0.5, s*0.3, s*0.1, 0, 0, Math.PI*2 );
  c.fill()
  c.strokeStyle = primary
  switch (t)
  {
    case 0:
      c.moveTo(x+s*0.2,y+s*0.2)
      c.lineTo(x+s*0.2,y+s*0.9)
      c.moveTo(x+s*0.8,y+s*0.5)
      c.lineTo(x+s*0.8,y+s*0.9)
      c.stroke()
      break
    case 1:
      c.moveTo(x+s*0.8,y+s*0.2)
      c.lineTo(x+s*0.8,y+s*0.9)
      c.moveTo(x+s*0.2,y+s*0.5)
      c.lineTo(x+s*0.2,y+s*0.9)
      c.stroke()
  }
}

function drawBed(c,x,y,s,primary,secondary,t=0)
{
}

function drawTable(c,x,y,s,primary,secondary,t=0)
{
}

function drawBarrel(c,x,y,s,primary,secondary,t=0)
{
}

function drawBars(c,x,y,s,primary,secondary,t=0)
{
}

function drawChest(c,x,y,s,primary,secondary,t=0)
{
}

function drawMushroom(c,x,y,s,primary,secondary,t=0)
{

}

function drawFish(c,x,y,s,primary,secondary,t=0)
{
}

function drawBeer(c,x,y,s,primary,secondary,t=0)
{
}

function drawCarrot(c,x,y,s,primary,secondary,t=0)
{
}

function drawSteak(c,x,y,s,primary,secondary,t=0)
{
}

function drawSign(c,x,y,s,primary,secondary,t="")
{
}


function drawRidge(c,x,y,s)
{
  c.beginPath()
  c.moveTo(x+s*0.5-s/2,y+s*0.75-s/2)
  c.lineTo(x-s/2+s*0.5,y+s/2)
  c.stroke()
  c.beginPath()
  c.moveTo(x+s*0.25-s/2,y+s*0.75-s/2)
  c.lineTo(x+s*0.25-s/2,y+s-s/2)
  c.stroke()
  c.beginPath()
  c.moveTo(x+s*0.75-s/2,y+s*0.75-s/2)
  c.lineTo(x+s*0.75-s/2,y+s-s/2)
  c.stroke()
  c.beginPath()
  c.moveTo(x+1-s/2,y+s*0.75-s/2)
  c.lineTo(x+1-s/2,y+s-s/2)
  c.stroke()
  c.beginPath()
  c.moveTo(x+s-1 -s/2,y+s*0.75-s/2)
  c.lineTo(x+s-1-s/2,y+s-s/2)
  c.stroke()
}

function drawSolid(c,x,y,s,primary,secondary = "",t=0)
{
  c.save();  
  c.fillStyle = primary
  c.fillRect(x,y,s,s)
  c.strokeStyle = secondary
  
  c.width =s
  c.height = s
  switch (t)
  {
    case 0:
      break
    case 1:
      c.translate(s/2,s/2)
      drawRidge(c,x,y,s)
      break
    case 2:
      c.translate(s/2,s/2)
      c.rotate(Math.PI/2)
      drawRidge(c,x,y,s)
      
      break
    case 3:
      c.rotate(Math.PI)
      drawRidge(c,x-s/2,y-s/2,s)
      break
    case 4:
      c.rotate(Math.PI*1.5)
      drawRidge(c,x-s/2,y+s/2,s)
      break
  }
  c.restore();
}

function drawCollide(c,x,y,s)
{
   
  
  c.strokeStyle = rgba(255,0,0,150)
  c.strokeRect(x,y,s,s)

  c.beginPath()
  c.moveTo(x+s*0.5,y)
  c.lineTo(x,y+s*0.5)
  c.stroke()

  c.beginPath()
  c.moveTo(x+s,y)
  c.lineTo(x,y+s)
  c.stroke()

  c.beginPath()
  c.moveTo(x+s*0.5,y+s)
  c.lineTo(x+s,y+s*0.5)
  c.stroke()

}

function saveWorldClipboard()
{
  var c = "";
  world_elements.forEach(function(e){
    c = c + "world_elements.push(new MapElement(" + e.sp + "," + e.x + "," + e.y + "," + e.w + "," + e.h + "," + scale + "," + e.l + "))\n";
    
  })
  collision_elements.forEach(function(e){
    c = c + "collision_elements.push(new MapElement(" + e.sp + "," + e.x + "," + e.y + "," + e.w + "," + e.h + "," + scale + "," + e.l + "))\n";
    
  })
  updateClipboard(c) 
}

function updateClipboard(c) {
  navigator.clipboard.writeText(c).then(function() {
    console.log("clipped")
  }, function() {
    console.log("not clipped")
  });
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
