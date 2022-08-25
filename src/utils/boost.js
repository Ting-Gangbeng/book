Array.prototype.pushWithoutDuplicate = function () {
    for (let i = 0; i < arguments.length; i++) {
        const args = arguments[i];
        if (this.indexOf(args) == -1) {
            this.push(args)
        }
    }
}