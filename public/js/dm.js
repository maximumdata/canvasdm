console.log('you the real dm now dawg');

let createButton = () => {
    let btn = document.createElement('button');
    btn.innerText = 'Logout';
    btn.id = 'logout';
    for (let i = 0; i < 10; i++) {
        document.body.appendChild(document.createElement('br'));
    }
    document.body.appendChild(btn);
    btn.addEventListener('click', e => {
        window.location = '/logout';
    });
};

document.addEventListener('DOMContentLoaded', e => {
    // createButton();
    // register mouse event handlers
    canvas.onmousedown = e => {
        mouse.click = true;
    };
    canvas.onmouseup = e => {
        mouse.click = false;
    };

    canvas.onmousemove = e => {
        // normalize mouse position to range 0.0 - 1.0
        mouse.pos.x = e.clientX / width;
        mouse.pos.y = e.clientY / height;
        mouse.move = true;
    };

    // main loop, running every 25ms
    const mainLoop = () => {
        // check if the user is drawing
        if (mouse.click && mouse.move && mouse.pos_prev) {
            // send line to to the server
            socket.emit('draw_line', { line: [mouse.pos, mouse.pos_prev] });
            mouse.move = false;
        }
        mouse.pos_prev = { x: mouse.pos.x, y: mouse.pos.y };
        requestAnimationFrame(mainLoop);
    };
    mainLoop();
});
