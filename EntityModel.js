class EntityModel {
    constructor(opts) {
        this.x = opts.x || 0;
        this.y = opts.y || 0;
        this.name = opts.name || 'monster';
        this.color = opts.color || 'red';
        this.id = opts.id;
        this.type = opts.type || 'monster';
        this.selected = false;
    }
}

module.exports = EntityModel;
