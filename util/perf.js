
class Debounce {
    #minInterval = 0;
    #lastCallThroughTs = 0;

    constructor(minInterval = 1e3) {
        this.#minInterval = minInterval;
        this.#lastCallThroughTs = 0;
    }

    attempt() {
        const now = Date.now();
        if (this.#lastCallThroughTs + this.#minInterval <= now) {
            this.#lastCallThroughTs = now;
            console.log('debounce: allow');
            return true;
        }
        console.log('debounce: skip');
        return false;
    }
}


export {
    Debounce,
};

