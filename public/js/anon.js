//
// const gamepadHandler = (event, connecting) => {
//     if(connecting) {
//         window.gamepad = event.gamepad;
//     } else {
//         window.gamepad = null;
//     }
// }
//
// window.addEventListener('gamepadconnected', e => gamepadHandler(e, true));
// window.addEventListener('gamepaddisconnected', e => gamepadHandler(e, false));

// const pollControllers = () => {
//     if (window.gamepad) {
//         console.log('window.gamepad.axes', window.gamepad.axes);
//     }
// }

console.log(`paul: 1
    ryan: 2
    cait: 3
    mikep: 4
    kayla: 5`);
let selectedPlayer = null;
window.isViewer = true;

socket.on('updateSelected', ent => {
    rotateSelectedPlayer(Number(ent.id));
});

const rotateSelectedPlayer = (num) => {
    // console.log('rotate player');
    if(!num) {
        if(selectedPlayer) {
            let curIndex = localEnts.findIndex((ent) => {
                return ent.id == selectedPlayer.id
            });
            let curEnt = localEnts[curIndex];
            let curNum = Number(selectedPlayer.id);
            if (curNum < 5) {
                let newNum = curNum + 1;
                selectedPlayer = localEnts.find((ent) => {
                    return (Number(ent.id) == newNum);
                });
            } else {
                selectedPlayer = localEnts.find((ent) => {
                    return (Number(ent.id) == 1);
                });
            }
            curEnt.selected = false
            selectedPlayer.selected = true;
            // selectedPlayer = null;
            // for (var x = curIndex; x < localEnts.length; x++) {
            //     if(isPlayerAndNotSelected(localEnts[x])) {
            //         selectedPlayer = localEnts[x];
            //     }
            // }
            // if (!selectedPlayer) {
            //     for (var x = 0; x < localEnts.length; x++) {
            //         if(isPlayerAndNotSelected(localEnts[x])) {
            //             selectedPlayer = localEnts[x];
            //         }
            //     }
            // }
            // selectedPlayer.selected = true;
            // curEnt.selected = false;
            socket.emit('entityChange', curEnt);
            socket.emit('entityChange', selectedPlayer);
        } else {
            selectedPlayer = localEnts.find((ent) => {
                return isPlayerAndNotSelected(ent);
            });
            selectedPlayer.selected = true;
            socket.emit('entityChange', selectedPlayer);
        }
    } else {
        if(selectedPlayer) {
            let curSel = selectedPlayer;
            curSel.selected = false;
            selectedPlayer = localEnts.find((ent) => {
                return (Number(ent.id) == num);
            });
            selectedPlayer.selected = true;
            socket.emit('entityChange', curSel);
            socket.emit('entityChange', selectedPlayer);
        } else {
            selectedPlayer = localEnts.find((ent) => {
                return (Number(ent.id) == num);
            });
            selectedPlayer.selected = true;
            socket.emit('entityChange', selectedPlayer);
        }
    }
}

const isPlayerAndNotSelected = (ent) => {
    return (ent.selected == false && ent.type =='player');
}

var haveEvents = 'ongamepadconnected' in window;
var controllers = {};

function connecthandler(e) {
  controllers[e.gamepad.index] = e.gamepad;
  requestAnimationFrame(updateStatus);
}

function disconnecthandler(e) {
  delete controllers[e.gamepad.index];
}


function updateStatus() {
  if (!haveEvents) {
    scangamepads();
  }

  var i = 0;
  var j;

  for (j in controllers) {
    var controller = controllers[j];

    // controller.buttons.forEach((button, index) => {
    //     if (button.pressed) {
    //         console.log(`button # ${index} pressed`);
    //     }
    // });

    if (controller.buttons[0].pressed) {
        rotateSelectedPlayer(1);
    }
    if (controller.buttons[1].pressed) {
        rotateSelectedPlayer(2);
    }
    if (controller.buttons[2].pressed) {
        rotateSelectedPlayer(3);
    }
    if (controller.buttons[3].pressed) {
        rotateSelectedPlayer(4);
    }
    if(controller.buttons[9].pressed) {
        rotateSelectedPlayer(5);
    }

    // for (i = 0; i < controller.buttons.length; i++) {
    //   var val = controller.buttons[i];
    //   var pressed = val == 1.0;
    //   if (typeof(val) == "object") {
    //     pressed = val.pressed;
    //     val = val.value;
    //   }
    //
    //   if (pressed) {
    //       rotateSelectedPlayer();
    //   }
    // }

    for (i = 0; i < controller.axes.length; i++) {
        // console.log('controller.axes', controller.axes);
        if(controller.axes[0] <= -0.25) {
            moveEntGP('left');
        }
        if (controller.axes[0] >= .25) {
            moveEntGP('right');
        }
        if (controller.axes[1] <= -0.25) {
            moveEntGP('up');
        }
        if (controller.axes[1] >= 0.25) {
            moveEntGP('down');
        }
      // var a = axes[i];
      // a.innerHTML = i + ": " + controller.axes[i].toFixed(4);
      // a.setAttribute("value", controller.axes[i] + 1);
    }
  }

  requestAnimationFrame(updateStatus);
}

function scangamepads() {
  var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
  for (var i = 0; i < gamepads.length; i++) {
    if (gamepads[i]) {
      if (gamepads[i].index in controllers) {
        controllers[gamepads[i].index] = gamepads[i];
      } else {
        addgamepad(gamepads[i]);
      }
    }
  }
}


window.addEventListener("gamepadconnected", connecthandler);
window.addEventListener("gamepaddisconnected", disconnecthandler);

if (!haveEvents) {
  setInterval(scangamepads, 500);
}

const moveEntGP = (dir) => {
    if(selectedPlayer) {
        if(dir == 'left') {
            selectedPlayer.x -= .001;
        }
        if (dir == 'right') {
            selectedPlayer.x += .001;
        }
        if (dir == 'down') {
            selectedPlayer.y += .001;
        }
        if(dir == 'up') {
            selectedPlayer.y -= .001;
        }
        socket.emit('entityChange', selectedPlayer);
    }
}
