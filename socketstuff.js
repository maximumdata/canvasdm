const shortid = require('shortid');
const randomColor = require('randomcolor');
const EntityModel = require('./EntityModel.js');

let game = {
    entities: [
        new EntityModel({
            id: 1,
            name: 'Kris',
            color: '#cc6766',
            type: 'player'
        }),
        new EntityModel({
            id: 2,
            name: 'Issa',
            color: '#84898e',
            type: 'player'
        }),
        new EntityModel({
            id: 3,
            name: 'Kevin',
            color: '#6ca0cc',
            type: 'player'
        }),
        new EntityModel({
            id: 4,
            name: 'Jasmine',
            color: '#FFDC00',
            type: 'player'
        }),
        new EntityModel({
            id: 5,
            name: 'Johnnie',
            color: '#5cbc5c',
            type: 'player'
        })
    ],
    dm: null,
    socketio: null,
    lineHistory: []
};

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

    client.on('newEnt', details => {
        var newEnt = new EntityModel({
            id: Date.now(),
            color: details.color || 'orange',
            x: details.x,
            y: details.y,
            name: `monster-${game.entities.length + 1}`
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
        game.entities.find((ent, iterator) => {
            if (ent.id == change.id) {
                game.entities[iterator].x = change.x;
                game.entities[iterator].y = change.y;
            }
        });
        game.socketio.emit('getEntitiesFromServer', game.entities);
    });
    client.on('resetBoard', () => {
        game.entities = game.entities.filter(ent => {
            if (ent.type == 'player') {
                ent.x = 0;
                ent.y = 0;
                return ent;
            }
        });
        game.lineHistory = [];
        game.socketio.emit('getEntitiesFromServer', game.entities);
        game.socketio.emit('getLinesFromServer', game.lineHistory);
    });

    client.on('updateSelected', ent => {
        game.socketio.emit('updateSelected', ent);
    });
};

const bindPlayerEvents = client => {
    const playerName = getNameFromURL(client);
    const playerFound = game.entities.find(player => {
        return player.name === playerName;
    });

    if (playerFound) {
        return client.emit('onConnected', playerFound);
    }

    if (playerName) {
        client.id = shortid.generate();
        console.log(
            `\tsocket.io:: player ${client.id}(${playerName}) connected`
        );

        var newPlayerForClient = new EntityModel({
            id: client.id,
            name: getNameFromURL(client),
            color: randomColor(),
            type: 'player'
        });
        game.entities.push(newPlayerForClient);
        client.emit('onConnected', newPlayerForClient);
    }

    client.on('disconnect', () => {
        console.log(
            `\tsocket.io:: player ${client.id}(${playerName}) disconnected`
        );
        // game.entities.forEach((player, iterator) => {
        //     if (player.id == client.id) {
        //         game.entities.splice(iterator, 1);
        //         console.log(
        //             `\tsocket.io:: player ${
        //                 client.id
        //             }(${playerName}) disconnected`
        //         );
        //     }
        // });
        //
        // game.socketio.sockets.emit('getEntitiesFromServer', game.entities);
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

        client.on('updateSelected', ent => {
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
