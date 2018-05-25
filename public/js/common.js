let canvas = null;
let context = null;
let width = window.innerWidth;
let height = window.innerHeight;
let socket = io.connect();
let localLines = [];
let localEnts = [];
let mouse = {
    click: false,
    move: false,
    pos: { x: 0, y: 0 },
    pos_prev: false
};

socket.on('draw_line', data => {
    localLines.push(data.line);
});

document.addEventListener('DOMContentLoaded', () => {
    // get canvas element and create context
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');

    // set canvas to full browser width/height
    if (document.getElementById('root').dataset.user == 'dm') {
        canvas.width = width;
        // smaller height for dm because phone aspect ratios are fucking awful
        canvas.height = height - 150;
        canvas.style.border = '1px solid black';
    } else {
        canvas.width = width;
        canvas.height = height;
    }
    startAnimating(60);
});

const clearCanvas = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
};

const drawEntities = () => {
    localEnts.forEach(ent => {
        var radius = 10;
        context.beginPath();
        context.arc(
            ent.x * width,
            ent.y * height,
            radius,
            0,
            2 * Math.PI,
            false
        );
        context.fillStyle = ent.color;
        context.fill();
        context.lineWidth = 5;
        context.strokeStyle = 'black';
        context.stroke();
    });
};

const drawLines = () => {
    localLines.forEach(line => {
        context.lineWidth = 4;
        context.beginPath();
        // context.moveTo(line[0].x, line[0].y);
        // context.lineTo(line[1].x, line[1].y);
        context.moveTo(line[0].x * width, line[0].y * height);
        context.lineTo(line[1].x * width, line[1].y * height);
        context.stroke();
        context.lineWidth = 1;
    });
};

const draw = () => {
    clearCanvas();
    // drawGrid();
    drawLines();
    drawEntities();
};

var stop = false;
var frameCount = 0;
var fps, fpsInterval, startTime, now, then, elapsed;

const startAnimating = fps => {
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    animate();
};

const animate = () => {
    // stop
    if (stop) {
        return;
    }

    // request another frame

    requestAnimationFrame(animate);

    // calc elapsed time since last loop

    now = Date.now();
    elapsed = now - then;

    // if enough time has elapsed, draw the next frame

    if (elapsed > fpsInterval) {
        // Get ready for next frame by setting then=now, but...
        // Also, adjust for fpsInterval not being multiple of 16.67
        then = now - elapsed % fpsInterval;

        // draw stuff here
        draw();
    }
};

socket.on('getEntitiesFromServer', entities => {
    localEnts = entities;
});
