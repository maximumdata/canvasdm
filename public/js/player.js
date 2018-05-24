let $root = document.getElementById('root');
console.log($root.dataset.user);


// this will control the actions for a specific player.
// when it is loaded, get the name from body.dataset.user
// create a new player instance and send it to socket.io to the dm
// this will give the player a color and dot that can then be used on the clients
// dms can move all player dots
// players can only move their dot

let socket = io.connect()
socket.on('hello', (msg) => {
  console.log('msg', msg);
})

socket.on('onConnected', (playerFromServer) => {
  console.log('this is from onConnected, this will set the clients player object to the one received from the server');
})

socket.on('getPlayersFromServer', (players, ids) => {
  console.log('players', players);
  console.log('ids', ids);
})

socket.on('alreadyUsingName', (name) => {
  alert(`someone is using the name "${name}" already.\nplease navigate to a different /player/NAMEHERE url`);
  socket = null;
})
