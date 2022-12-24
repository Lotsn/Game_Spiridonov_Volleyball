var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var raf;
var collided, right, left, up, jumped = false, no_prev_colloid, cyloc, cxloc, theta;
var g = 3;
var t, dt = 0.2;
var time = 0, newTime;
var gameover;
var player_score = document.getElementById("player_score");
var reset_score_btn = document.getElementById("btn_reset_score");
var new_game_btn = document.getElementById("btn_new_game");
var Player_win_AI = false;
var Name;
var frozen;
var arrowImage = new Image();
arrowImage.src = 'arrow.png';
let loadArrowPromise = new Promise(resolve => arrowImage.onload = resolve);

async function loadArrow() {
  await loadArrowPromise;
}

loadArrow();

const MAX_ACC_X = 3;
const MAX_ACC_Y = 3;
const MAX_VEL_X = 6;
const MAX_VEL_Y = 30;
const MAX_VEL = { x: MAX_VEL_X, y: MAX_VEL_Y };
const MAX_ACC = { x: MAX_ACC_X, y: MAX_ACC_Y };
const SLOWING_RAD = 50;
const HALF_COURT = canvas.width / 2;

/**************DETECT SLIME COLLISION********************/
function detect_collision(ball, slime) {

  var a = (ball.x - slime.x) * (ball.x - slime.x);
  var b = (ball.y - slime.y) * (ball.y - slime.y);
  c = Math.sqrt(a + b);
  if (c < ball.radius + slime.radius) {
    return true;
  } else {
    return false;
  }
}

var ball = {
  x: 100,
  y: 100,
  // vx: 5,
  vx: 0,
  vy: -30,
  radius: 15,
  t: 0,
  mass: 1,
  color: '#8E44AD',
  origin: 425,
  draw: function () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();
  },
  /**************DETECT COURT NET COLLISION********************/
  detect_court_net_collision: function (cn) {
    closestx = 0;
    closesty = 0;
    coming_from_left = -1;


    if (this.x < cn.x) {
      closestx = cn.x;
      coming_from_left = 1;
    } else if (this.x > (cn.x + cn.width)) {
      closestx = cn.x + cn.width;
      coming_from_left = 0;
    } else {
      closestx = this.x;
      coming_from_left = -1;
    }

    if (this.y < cn.y) {
      closesty = cn.y;
    } else if (this.y > (cn.y + cn.height)) {
      closesty = cn.y + cn.height;
    } else {
      closesty = this.y;
    }

    deltaxsq = (closestx - this.x) * (closestx - this.x);
    deltaysq = (closesty - this.y) * (closesty - this.y);
    collision_detected = ((deltaxsq + deltaysq) < (this.radius * this.radius)) ? 1 : 0;

    if (collision_detected) {

      if (this.x > cn.x && this.x < (cn.x + cn.width) && ((cn.y - this.y) > 0)) {
        this.t = 0;
        this.origin = cn.y - this.radius;
        this.y = this.origin;

      } else {
        this.vx *= -1;

        if (coming_from_left == 1) {
          this.x = cn.x - this.radius;
        }

        if (coming_from_left == 0) {
          this.x = cn.x + cn.width + this.radius;
        }
      }
    }
  }
};

var player = {

  x: 600,
  y: canvas.height,
  vx: 0,
  vy: 0,
  vel: { x: 0, y: 0 },
  radius: 50,
  mass: 3,
  color: '#2980B9',
  t: 0,
  score: 0,
  draw: function () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI, true);
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();
  },
  update: function () {

    if (right && this.x < canvas.width - this.radius) {
      this.vel.x = 6;
      this.x += this.vel.x;
    }

    else if (left && (this.x - this.radius) > (court_net.x + court_net.width)) {
      this.vel.x = -6;
      this.x += this.vel.x;
    }

    else {
      this.vel.x = 0;
    }

    if (this.y > canvas.height && jumped) {
      jumped = 0;
      this.y = canvas.height;
      this.vel.y = 0;
      this.t = 0;
    }

    else if (this.y <= canvas.height && jumped) {
      this.y = 0.5 * g * this.t * this.t + this.vel.y * this.t + canvas.height;
    }

    else if (up && this.y == canvas.height) {
      jumped = true;
      this.t = 0;
      this.vel.y = -25;
    }
  },
  getVelocity: function () {
    return this.vel.y + g * this.t;
  }
};

/**************AI********************/


/**************COURT NET********************/

var court_net = {
  width: 100,
  height: 300,
  x: 390,
  y: 400,
  color: '#1F271D',
  draw: function () {
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
};

var court_net2 = {
  width: 100,
  height: 300,
  x: 100,
  y: 300,
  color: '#1F271D',
  draw: function () {
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
};

function begin() {
  gameover = false;
  player.x = 600;
  player.y = canvas.height;
  player.t = 0;
  player.vel.x = 0;
  player.vel.y = 0;

  ball.t = 0;
  ball.x = player.x;
  ball.y = player.y - player.radius - (ball.radius);
  ball.origin = ball.y;
  ball.t = 0;
  ball.vx = 0;
}

function draw() {
  if (frozen) {
    return;
  }

  /**************UPDATE GRAPHICS********************/
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  court_net.draw();
  court_net2.draw();
  
  ctx.drawImage(arrowImage, 250, 330, 80, 130);
  
  ball.draw();
  player.draw();

  /**************UPDATE POSITIONS********************/
  ball.x += ball.vx;
  ball.y += ball.vy;  //CHECK
  ball.t += dt;
  ball.y = 0.5 * ball.t * ball.t * g + ball.vy * ball.t + ball.origin;
  player.t += dt;
  player.update();

  collided = false;

  if (no_prev_colloid) {
    collided = detect_collision(ball, player);

  } else {
    no_prev_colloid = true;
  }
  if (collided) {
    ball.t = 0;
    no_prev_colloid = true;
    ball.vx = (((ball.mass - player.mass) * ball.vx) + (2 * player.mass * player.vel.x)) / (player.mass + ball.mass); ///CHECK
    theta = Math.atan((player.y - ball.y) / (player.x - ball.x));
    ball.y = (player.y - (player.radius + ball.radius) * Math.sin(Math.abs(theta)));
    if (theta < 0) { // left quad
      ball.x = player.x + (player.radius + ball.radius) * Math.cos(Math.abs(theta));

    }
    else if (theta > 0) { // right quad
      ball.x = player.x - (player.radius + ball.radius) * Math.cos(Math.abs(theta));

    }
    ball.origin = ball.y;
  }

  /**************CHECK IF BOUNDARIES ARE HIT********************/
  ball.detect_court_net_collision(court_net);
  ball.detect_court_net_collision(court_net2);
  if (ball.y - ball.radius < 0) {
    ball.y = ball.radius;
    ball.t = 0;
  }
  else if (ball.x + ball.radius > canvas.width && ball.vx > 0) {
    ball.vx = -ball.vx;
    ball.x = canvas.width - ball.radius;
  }
  

  if (ball.y + ball.radius > canvas.height) {
    ball.y = canvas.height - ball.radius;
    ball.draw();
    player.draw();
    court_net.draw();
    court_net2.draw();
    gameover = true;
  }

  /**************DID BALL HIT GROUND********************/

  if (gameover) {
    if (ball.x > court_net2.x && ball.x < court_net.x) {
      player.score += 1;
    } else {
      player.score +=10;
    }
    window.cancelAnimationFrame(raf);
    begin();
  }


  if (player.score == 1) {
    ctx.fillStyle = 'white';
    const rectWidth = canvas.width;
    const rectHeight = 80;
    ctx.fillRect((canvas.width - rectWidth) / 2, (canvas.height - rectHeight) / 2, rectWidth, rectHeight);

    ctx.font = "40px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.textBaseline = 'middle';
    ctx.fillText(player.name + " победил!", canvas.width / 2, canvas.height / 2);
   
    if (!Player_win_AI) {
      Player_win_AI = true;
      addInfo(player.name);
    }

    frozen = true;
  }


  if (player.score == 10) {
    ctx.fillStyle = 'white';
    const rectWidth = canvas.width;
    const rectHeight = 80;
    ctx.fillRect((canvas.width - rectWidth) / 2, (canvas.height - rectHeight) / 2, rectWidth, rectHeight);

    ctx.font = "40px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.textBaseline = 'middle';
    ctx.fillText("Неудача", canvas.width / 2, canvas.height / 2);
    frozen = true;
  }

  raf = window.requestAnimationFrame(draw);
  
}

document.addEventListener("keydown", keyDown, false);
document.addEventListener("keyup", keyUp, false);
window.addEventListener('mouseover', function (e) {
  raf = window.requestAnimationFrame(draw);
});

window.addEventListener("mouseout", function (e) {
  window.cancelAnimationFrame(raf);
});

new_game_btn.addEventListener("click", function (e) {
  begin();
  player.score = 0;
  Player_win_AI = false;
  frozen = false;
})

function keyDown(e) {
  if (e.keyCode == 39) {
    right = true;
  }
  else if (e.keyCode == 37) {
    left = true;
  }
  else if (e.keyCode == 38) {
    up = true;
  }
}

function keyUp(e) {
  if (e.keyCode == 39) {
    right = false;
  }
  else if (e.keyCode == 37) {
    left = false;
  }
  else if (e.keyCode == 38) {
    up = false;
  }
}

function getDist(a, b) {
  return Math.sqrt(((a.x - b.x) * (a.x - b.x)) + ((a.y - b.y) * (a.y - b.y)))
}

function truncate(obj, lim, opt) {
  if (Math.abs(obj) > lim.x) {
    if (obj < 0) {
      obj = -lim.x;
    } else {
      obj = lim.x
    }
  }
  if (opt) {
    if (Math.abs(obj.y) > lim.y) {
      if (obj.y < 0) {
        obj.y = -lim.y;
      } else {
        obj.y = lim.y;
      }
    }
  }
  return obj;
}
/**
 * Collision is completly elastic i.e., both momentum and kinetic energy
 * are fully conserved.
 */


function addInfo(name) {
  var obj = JSON.parse(localStorage.getItem(name));
  if (obj === null) {
    localStorage.setItem(name, JSON.stringify({ "Nickname": name, "countWon": 1 }))
  }
  let playerscore = Number(obj.countWon);
  if (playerscore > 0) {
    playerscore += 1;
    localStorage.setItem(name, JSON.stringify({ "Nickname": name, "countWon": playerscore }))
  }
}



function analyisCollision(a, b) {
  vx = (((a.mass - b.mass) * a.vx) + (2 * b.mass * b.vel.x)) / (b.mass + a.mass);
  vy = (((a.mass - b.mass) * a.vy) + (2 * b.mass * b.vel.y)) / (b.mass + a.mass);
  return { x: vx, y: vy };
}

player.name = new URLSearchParams(document.location.search).get('username');

begin();