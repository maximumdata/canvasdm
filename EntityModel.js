class EntityModel {
    constructor(opts) {
        this.x = opts.x || 0;
        this.y = opts.y || 0;
        this.name = opts.name || '';
        this.color = opts.color || 'red';
        this.id = opts.id;
        this.type = opts.type || 'monster';
    }
}

module.exports = EntityModel;
