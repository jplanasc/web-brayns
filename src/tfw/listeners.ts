type IListener = (...args: any) => void;

export default class Listeners {
    private listeners: IListener[] = [];

    constructor(private name: string = "Listener") {}

    add(listener: IListener) {
        this.remove( listener);
        this.listeners.push(listener);
    }

    remove(listener: IListener) {
        this.listeners = this.listeners.filter( x => x !== listener);
    }

    fire(...args: any) {
        this.listeners.forEach((listener: IListener) => {
            try {
                listener(...args);
            } catch(ex) {
                console.error(`[${this.name}] Error in a listener!`);
                console.error(">  ex: ", ex);
                console.error(">  args: ", [...args]);
            }
        });
    }
}
