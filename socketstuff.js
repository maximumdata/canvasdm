let game = {
    entities: [],
    dm: null,
    socketio: null,
    lineHistory: []
};

const fs = require('fs');
const util = require('util');
const shortid = require('shortid');
const EntityModel = require('./EntityModel.js');

const findIndex = (needle, haystack) => {
    haystack.find((hay, iterator) => {
        if (hay.id === needle.id) {
            return iterator;
        }
    });
};

const getNameFromURL = client => {
    return client.handshake.headers.referer.split('player/')[1];
};

const getColorByName = client => {
    let name = getNameFromURL(client);
    let colorMap = {
        ryan: 'blue',
        cait: 'yellow'
    };
    return colorMap[name];
};

const checkIfDM = client => {
    return client.handshake.headers.referer.split('/')[3] === 'dm';
};

const getUserTypeFromURL = client => {
    let isDM = checkIfDM(client) ? 'dm' : false;
    let isPlayer = getNameFromURL(client) ? 'player' : false;
    return isDM || isPlayer || 'viewer';
};

const bindDMEvents = client => {
    client.id = 'DM';
    console.log(`\tsocket.io:: DM connected`);
    game.dm = client;

    client.on('disconnect', () => {
        game.dm = null;
        console.log(`\tsocket.io:: DM disconnected`);
        game.socketio.sockets.emit('getEntitiesFromServer', game.entities);
    });
    client.on('undoLine', what => {
        if (game.lineHistory.length > 2) {
            console.log('game.lineHistory.length', game.lineHistory.length);
            try {
                while (
                    game.lineHistory[game.lineHistory.length - 1].id == what
                ) {
                    game.lineHistory.pop();
                }
            } catch (err) {}
            game.socketio.emit('getLinesFromServer', game.lineHistory);
        }
    });

    client.on('newEnt', pos => {
        var newEnt = new EntityModel({
            id: Date.now(),
            color: 'orange',
            x: pos.x,
            y: pos.y
        });
        game.entities.push(newEnt);
        game.socketio.emit('getEntitiesFromServer', game.entities);
    });
    client.on('delEnt', entID => {
        let index = game.entities.findIndex(e => {
            return e.id == entID;
        });
        if (index > -1) {
            game.entities.splice(index, 1);
            game.socketio.emit('getEntitiesFromServer', game.entities);
        }
    });
    client.on('moveEnt', change => {
        console.log('change', change);
        game.entities.find((ent, iterator) => {
            console.log('ent.id', ent.id);
            if (ent.id == change.id) {
                console.log('ent', ent);
                game.entities[iterator].x = change.x;
                game.entities[iterator].y = change.y;
                console.log('ent after', ent);
            }
        });
        game.socketio.emit('getEntitiesFromServer', game.entities);
    });
};

const bindPlayerEvents = client => {
    const playerName = getNameFromURL(client);
    const playerFound = game.entities.find(player => {
        return player.name === playerName;
    });

    if (playerFound) {
        return client.emit('alreadyUsingName', playerName);
    }

    if (playerName) {
        client.id = shortid.generate();
        console.log(
            `\tsocket.io:: player ${client.id}(${playerName}) connected`
        );

        var newPlayerForClient = new EntityModel({
            id: client.id,
            name: getNameFromURL(client),
            color: getColorByName(client),
            type: 'player'
        });

        game.entities.push(newPlayerForClient);
        client.emit('onConnected', newPlayerForClient);
    }

    client.on('disconnect', () => {
        game.entities.forEach((player, iterator) => {
            if (player.id == client.id) {
                game.entities.splice(iterator, 1);
                console.log(
                    `\tsocket.io:: player ${
                        client.id
                    }(${playerName}) disconnected`
                );
            }
        });

        game.socketio.sockets.emit('getEntitiesFromServer', game.entities);
    });
};

const bindViewerEvents = client => {
    // bindPlayerEvents(client);
    console.log(`\tsocket.io:: viewer connected`);
    client.on('disconnect', () => {
        console.log(`\tsocket.io:: viewer disconnected`);
    });
};

const init = socketio => {
    game.socketio = socketio;
    game.socketio.on('connection', client => {
        const userType = getUserTypeFromURL(client);
        client.userType = userType;
        switch (userType) {
            case 'dm':
                bindDMEvents(client);
                break;
            case 'player':
                bindPlayerEvents(client);
                break;
            default:
                bindViewerEvents(client);
        }

        game.socketio.emit('getEntitiesFromServer', game.entities);

        client.on('entityChange', entity => {
            game.entities.find((ent, iterator) => {
                if (ent.id === entity.id) {
                    game.entities[iterator] = entity;
                }
            });
            game.socketio.emit('getEntitiesFromServer', game.entities);
        });

        client.on('draw_line', function(data) {
            game.lineHistory.push(data);
            game.socketio.emit('draw_line', { line: data.line, id: data.id });
        });

        game.lineHistory.forEach(line => {
            client.emit('draw_line', line);
        });
    });
};

module.exports = {
    bindEvents: init
};
