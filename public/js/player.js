let $root = document.getElementById('root');
console.log($root.dataset.user);


// this will control the actions for a specific player.
// when it is loaded, get the name from body.dataset.user
// create a new player instance and send it to socket.io to the dm
// this will give the player a color and dot that can then be used on the clients
// dms can move all player dots
// players can only move their dot
