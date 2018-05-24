let game = {
  players: [],
  entities: [],
  dm: null,
  socketio: null
}

const fs = require('fs');
const util = require('util');
const shortid = require('shortid');
const PlayerModel = require('./PlayerModel.js');

const findIndex = (needle, haystack) => {
  haystack.find((hay, iterator) => {
    if (hay.id === needle.id ) {
      return iterator;
    }
  });
  // for(var i = game.players.length - 1; i>=0; i--) {
  //   if(game.players[i].id == player.id) {
  //     return i;
  //   }
  // }

}

const getListOfUserIDsFromArray = () => {
  return game.players.map((player) => {
    return player.id;
  });
}

const getNameFromURL = (client) => {
  // return 'test';
  return client.handshake.headers.referer.split('player/')[1];
}
const checkIfDM = (client) => {
  return client.handshake.headers.referer.split('/')[3] === 'dm';
}
const getUserTypeFromURL = (client) => {
  let isDM = checkIfDM(client) ? 'dm' : false;
  let isPlayer = getNameFromURL(client) ? 'player' : false;
  return isDM || isPlayer || 'viewer';
}

const bindDMEvents = (client) => {
  client.id = 'DM';
  console.log(`\tsocket.io:: DM connected`);
  game.dm = client;

  client.on('disconnect', () => {
    game.dm = null;
    console.log(`\tsocket.io:: DM disconnected`)
    game.socketio.sockets.emit('getPlayersFromServer', game.players, getListOfUserIDsFromArray());
  });



}

const bindPlayerEvents = (client) => {
  const playerName = getNameFromURL(client);
  const playerFound = game.players.find((player) => {
    return player.name === playerName;
  })
  if (playerFound) {
    return client.emit('alreadyUsingName', playerName);
  }
  // find out what url they hit
  if (playerName) {
    client.id = shortid.generate();
    console.log(`\tsocket.io:: player ${client.id}(${playerName}) connected`);
    var newPlayerForClient = new PlayerModel(client.id, getNameFromURL(client));

    game.players.push(newPlayerForClient);
    client.emit('onConnected', newPlayerForClient );

  }

  client.on('disconnect', () => {
    game.players.forEach((player, iterator) => {
      if (player.id == client.id) {
        game.players.splice(iterator, 1);
        console.log(`\tsocket.io:: player ${client.id}(${playerName}) disconnected`);
      }
    });

    game.socketio.sockets.emit('getPlayersFromServer', game.players, getListOfUserIDsFromArray());
  });
}

const bindViewerEvents = (client) => {
  // bindPlayerEvents(client);
  console.log(`\tsocket.io:: viewer connected`);
  client.on('disconnect', () => {
    console.log(`\tsocket.io:: viewer disconnected`);
  })
}

const init = (socketio) => {
  game.socketio = socketio;
  game.socketio.sockets.on('connection', (client) => {
    const userType = getUserTypeFromURL(client);
    client.userType = userType;
    switch(userType) {
      case 'dm':
        bindDMEvents(client);
        break;
      case 'player':
        bindPlayerEvents(client);
        break;
      default:
        bindViewerEvents(client);
    }

    game.socketio.sockets.emit('getPlayersFromServer', game.players, getListOfUserIDsFromArray());


    client.on('playerMoved', (playerWhoMoved) => {
      game.players[findIndex(playerWhoMoved, game.players)] = playerWhoMoved;
      game.socketio.sockets.emit('getPlayersFromServer', game.players, getListOfUserIDsFromArray());
    });

    client.on('entityChange', (entity) => {
      game.entities[findIndex(entity, game.entities)] = entity;
      game.socketio.sockets.emit('getEntitiesFromServer', game.entities);
    })
  })

}

module.exports = {
  bindEvents: init
}
