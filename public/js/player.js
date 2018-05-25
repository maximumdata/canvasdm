let $root = document.getElementById('root');
// this will control the actions for a specific player.
// when it is loaded, get the name from body.dataset.user
// create a new player instance and send it to socket.io to the dm
// this will give the player a color and dot that can then be used on the clients
// dms can move all player dots
// players can only move their dot

let myPlayer = null;
// let localPlayers = [];

socket.on('hello', msg => {
    console.log('msg', msg);
});

socket.on('onConnected', entity => {
    myPlayer = entity;
});

socket.on('alreadyUsingName', name => {
    alert(
        `someone is using the name "${name}" already.

        please navigate to a different /player/NAMEHERE url`
    );
    socket = null;
});

document.addEventListener('DOMContentLoaded', e => {
    canvas.addEventListener('click', e => {
        myPlayer.x = e.clientX / width;
        myPlayer.y = e.clientY / height;
        socket.emit('entityChange', myPlayer);
    });
    // Set up touch events for mobile, etc
    canvas.addEventListener(
        'touchend',
        e => {
            mousePos = getTouchPos(canvas, e);
            var touch = e.touches[0];
            var mouseEvent = new MouseEvent('click', {
                clientX: touch.clientX / width,
                clientY: touch.clientY - 60 / height
            });
            canvas.dispatchEvent(mouseEvent);
        },
        false
    );
    // canvas.addEventListener(
    //     'touchend',
    //     (e) => {
    //         mousePos = getTouchPos(canvas, e);
    //         var touch = e.touches[0];
    //         var mouseEvent = new MouseEvent('click', {
    //             clientX: touch.clientX / width,
    //             clientY: touch.clientY / height
    //         });
    //         canvas.dispatchEvent(mouseEvent);
    //     },
    //     false
    // );
    // canvas.addEventListener(
    //     'touchend',
    //     (e) => {
    //         var mouseEvent = new MouseEvent('mouseup', {});
    //         canvas.dispatchEvent(mouseEvent);
    //     },
    //     false
    // );
    // canvas.addEventListener(
    //     'touchmove',
    //     (e) => {
    //         var touch = e.touches[0];
    //         var mouseEvent = new MouseEvent('mousemove', {
    //             clientX: touch.clientX,
    //             clientY: touch.clientY
    //         });
    //         canvas.dispatchEvent(mouseEvent);
    //     },
    //     false
    // );

    // Get the position of a touch relative to the canvas
    const getTouchPos = (canvasDom, touchEvent) => {
        var rect = canvasDom.getBoundingClientRect();
        return {
            x: touchEvent.touches[0].clientX - rect.left,
            y: touchEvent.touches[0].clientY - rect.top
        };
    };
});
