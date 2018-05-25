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
    pos_prev: false,
    mode: 'draw'
};

socket.on('draw_line', data => {
    localLines.push(data);
});

document.addEventListener('DOMContentLoaded', () => {
    // get canvas element and create context
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');

    // set canvas to full browser width/height
    if (document.getElementById('root').dataset.user == 'dm') {
        canvas.width = width;
        // smaller height for dm because phone aspect ratios are fucking awful
        canvas.height = height; // - 150;
        //canvas.style.border = '1px solid black';
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
        context.lineWidth = 2;
        context.strokeStyle = 'black';
        context.stroke();
    });
};

const drawLines = () => {
    localLines.forEach(data => {
        let line = data.line;
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
// let p = 0,
//     bh = height,
//     bw = width;
// const drawBoard = () => {
//     for (let x = 0; x <= width; x += 50 / width) {
//         context.moveTo(x * width, 0);
//         context.lineTo(x * width, height);
//     }
//
//     for (let y = 0; y <= height; y += 50 / height) {
//         context.moveTo(0, y * height);
//         context.lineTo(width, y * height);
//     }
//     context.strokeStyle = 'black';
//     context.stroke();
// };
// const drawBoard = () => {
//     for (var x = 0; x <= bw; x += 0.05) {
//         context.moveTo((0.5 + x) * width, 0);
//         context.lineTo((0.5 + x) * width, bh * height);
//     }
//
//     for (var x = 0; x <= bh; x += 0.05) {
//         context.moveTo(0, (0.5 + x) * height);
//         context.lineTo(bw * width, (0.5 + x) * height);
//     }
//
//     context.strokeStyle = 'black';
//     context.stroke();
// };
// function drawBoard() {
//     for (var x = 0; x <= bw; x += 40) {
//         context.moveTo(0.5 + x + p, p);
//         context.lineTo(0.5 + x + p, bh + p);
//     }
//
//     for (var x = 0; x <= bh; x += 40) {
//         context.moveTo(p, 0.5 + x + p);
//         context.lineTo(bw + p, 0.5 + x + p);
//     }
//
//     context.strokeStyle = 'black';
//     context.stroke();
// }
const draw = () => {
    clearCanvas();
    // drawGrid();
    // drawBoard();
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
    if (document.body.dataset.user === 'dm') {
        updateEntList(entities);
    }
});

socket.on('getLinesFromServer', lines => {
    localLines = lines;
});
