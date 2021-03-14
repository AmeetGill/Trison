class Message {
    //to which tunnel message is assigned
    private _tunnelId: string;

    //data
    private _data: object;
    private _callbackFunction: Function;

    private _priority: number;

    get priority(): number {
        return this._priority;
    }

    set priority(value: number) {
        this._priority = value;
    }

    get tunnelId(): string {
        return this._tunnelId;
    }

    set tunnelId(value: string) {
        this._tunnelId = value;
    }

    get data(): object {
        return this._data;
    }

    set data(value: object) {
        this._data = value;
    }

    get callbackFunction(): Function {
        return this._callbackFunction;
    }

    set callbackFunction(value: Function) {
        this._callbackFunction = value;
    }

    constructor(data: object, callbackFunction: Function) {
        this._data = data;
        this._callbackFunction = callbackFunction;
    }

    setTunnelId(tunnelId: string) {
        this._tunnelId = tunnelId;
    }

}