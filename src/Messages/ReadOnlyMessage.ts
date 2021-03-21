import {CallbackFunction} from "../types/CallbackFunction";
import WriteableMessage from "./WriteableMessage";

export default class ReadOnlyMessage {
    private readonly _data: object;
    private readonly _callbackFunction: CallbackFunction;
    private readonly _priority: number;
    private readonly _tunnelId: string;

    constructor(callbackFunction: CallbackFunction, data: object, priority: number, tunnelId ) {
        this._data = data;
        this._callbackFunction = callbackFunction;
        this._priority = priority;
        this._tunnelId = tunnelId;
    }

    getCallbackFunction(): Function {
        return undefined;
    }

    getData(): object {
        return undefined;
    }

    getPriority(): number {
        return 0;
    }

    getTunnelId(): string {
        return "";
    }
}