console.log(`paul: 1
    ryan: 2
    cait: 3
    mikep: 4
    kayla: 5`);

document.addEventListener('DOMContentLoaded', e => {
    // createButton();
    // register mouse event handlers
    canvas.onmousedown = e => {
        mouse.click = true;
        mouse.id = Date.now();
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
    canvas.onclick = e => {
        if (mouse.mode == 'newEnt') {
            let deets = {
                x: e.clientX / width,
                y: e.clientY / height,
                color: document.getElementById('entColor').value
            };
            socket.emit('newEnt', deets);
        }
        if (mouse.mode == 'moveEnt') {
            let change = {
                x: e.clientX / width,
                y: e.clientY / height,
                id: document.getElementById('entList').value
            };
            socket.emit('moveEnt', change);
        }
    };
    // main loop, running every 25ms
    const mainLoop = () => {
        // check if the user is drawing
        if (
            mouse.click &&
            mouse.move &&
            mouse.pos_prev &&
            mouse.mode == 'draw'
        ) {
            // send line to to the server
            socket.emit('draw_line', {
                line: [mouse.pos, mouse.pos_prev],
                id: mouse.id
            });
            mouse.move = false;
        }
        mouse.pos_prev = { x: mouse.pos.x, y: mouse.pos.y };
        requestAnimationFrame(mainLoop);
    };
    mainLoop();

    const undoLine = document.getElementById('undoLine');
    undoLine.addEventListener('click', function(e) {
        e.preventDefault();
        if (localLines.length) {
            let id = localLines[localLines.length - 1].id || 1;
            socket.emit('undoLine', id);
        }
    });

    const mouseModeSel = document.getElementById('mouseMode');
    mouseModeSel.addEventListener('change', function(e) {
        mouse.mode = e.target.value;
    });

    const delEntButton = document.getElementById('delEnt');
    delEntButton.addEventListener('click', function(e) {
        e.preventDefault();
        let isPlayer = document.getElementById('entList').dataset.player;
        if (isPlayer == 'false') {
            let curEnt = document.getElementById('entList').value;
            socket.emit('delEnt', curEnt);
        } else {
            let confirm = window.confirm(
                `You're about to remove a player. Are you sure?`
            );
            if (confirm) {
                let curEnt = document.getElementById('entList').value;
                socket.emit('delEnt', curEnt);
            }
        }
    });

    const entListEl = document.getElementById('entList');
    entListEl.addEventListener('change', function(e) {
        let newID = e.target.value;
        let isPlayer = !!localEnts.find(ent => {
            return ent.id == newID && ent.type == 'player';
        });
        entListEl.dataset.player = isPlayer;
        // need to figure out if its a player and set data attribute here
    });

    const resetBoardEl = document.getElementById('resetBoard');
    resetBoardEl.addEventListener('click', function(e) {
        if (window.confirm('Do you really want to reset the board?')) {
            socket.emit('resetBoard');
        }
    });

    const setTurnEl = document.getElementById('setCurrentTurn');
    setTurnEl.addEventListener('click', function (e) {
        e.preventDefault();
        let isPlayer = document.getElementById('entList').dataset.player;
        if (isPlayer == 'false') {
            // let curEnt = document.getElementById('entList').value;
            // socket.emit('delEnt', curEnt);
        } else {
            localEnts.forEach((ent) => {
                if(ent.type == 'player' && ent.selected == true) {
                    ent.selected = false;
                    socket.emit('entityChange', ent);
                }
            });
            let curEnt = document.getElementById('entList').value;
            let newSel = localEnts.find((ent) => {
                return ent.id == curEnt
            });
            newSel.selected = true;
            socket.emit('entityChange', newSel);
            socket.emit('updateSelected', newSel);
        }
    });
});

const updateEntList = ents => {
    let el = document.getElementById('entList');
    let lastSel = el.value;
    while (el.firstChild) {
        el.removeChild(el.firstChild);
    }
    if (ents.length) {
        let lastSelExists = false;
        ents.forEach(ent => {
            if (ent.id == lastSel) {
                lastSelExists = true;
            }
            let opt = document.createElement('option');
            opt.value = ent.id;
            opt.innerText = ent.name;
            el.append(opt);
        });
        if (lastSel && lastSelExists) {
            el.value = lastSel;
        }
    }
    el.dispatchEvent(new Event('change'));
};
