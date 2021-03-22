import {CallbackFunction} from "../types/CallbackFunction";
import * as _ from 'lodash';

export default class ReadOnlyMessage {
    private readonly _data: object;
    private readonly _callbackFunction: CallbackFunction;
    private readonly _priority: number;
    private readonly _tunnelId: string;
    private readonly _messageId: string;

    constructor(callbackFunction: CallbackFunction, data: object, priority: number, tunnelId, messageId: string ) {
        this._data = data;
        this._callbackFunction = callbackFunction;
        this._priority = priority;
        this._tunnelId = tunnelId;
        this._messageId = messageId;
    }

    clone(): ReadOnlyMessage {
        return new ReadOnlyMessage(
            this.getCallbackFunction,
            _.cloneDeep<object>(this.getData()),
            this.getPriority(),
            this.getTunnelId(),
            this.getMessageId()
        );
    }

    getCallbackFunction(): CallbackFunction {
        return this._callbackFunction;
    }

    // provide a copy of the data
    getData(): object {
        return _.cloneDeep<object>(this._data);
    }

    getPriority(): number {
        return this._priority;
    }

    getTunnelId(): string {
        return this._tunnelId;
    }

    getMessageId(): string {
        return this._messageId;
    }

    equals(readonlyMessage: ReadOnlyMessage): boolean {
        return readonlyMessage.getTunnelId() === this.getTunnelId()
                    && readonlyMessage.getPriority() === this.getPriority()
                    && readonlyMessage.getMessageId() == this.getTunnelId()
                    && _.isEqual(readonlyMessage._data,this.getData());
    }


}