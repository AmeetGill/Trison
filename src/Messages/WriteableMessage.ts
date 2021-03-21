import ReadOnlyMessage from "./ReadOnlyMessage";
import {CallbackFunction} from "../types/CallbackFunction";

export default class WriteableMessage{
    //to which tunnel message is assigned
    private _tunnelId: string;

    //data
    private readonly _data: object;
    private readonly _callbackFunction: CallbackFunction;
    private readonly _priority: number;

    constructor(data: object, callbackFunction: CallbackFunction, priority?: number) {
        this._data = data;
        this._callbackFunction = callbackFunction;
        this._priority = priority;
    }

    createReadOnlyMessage() {
        return new ReadOnlyMessage(
            this.getCallbackFunction(),
            this.getData(),
            this.getPriority(),
            this.getTunnelId()
        );
    }

    getData(): object {
        return this._data;
    }

    setTunnelId(tunnel: string){
        this._tunnelId = tunnel;
    }

    getPriority(): number {
        return this._priority;
    }

    getTunnelId(): string {
        return this._tunnelId;
    }

    getCallbackFunction(): CallbackFunction {
        return this._callbackFunction;
    }

}