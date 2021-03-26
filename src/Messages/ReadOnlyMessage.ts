import {CallbackFunction} from "../types/CallbackFunction";
import * as _ from 'lodash';
import Message from "./Message";

export default class ReadOnlyMessage {
    private readonly _data: object;
    private readonly _callbackFunction: CallbackFunction;
    private readonly _priority: number;
    private readonly _tunnelId: string;
    private readonly _messageId: string;

    constructor(message: Message | ReadOnlyMessage) {
        this._data = _.cloneDeep<object>(message.getData());
        this._callbackFunction = message.getCallbackFunction();
        this._priority = message.getPriority();
        this._tunnelId = message.getTunnelId();
        this._messageId = message.getMessageId();
    }

    getCallbackFunction(): CallbackFunction {
        return this._callbackFunction;
    }

    clone(): ReadOnlyMessage{
        return new ReadOnlyMessage(this);
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
                    && readonlyMessage.getMessageId() == this.getMessageId()
                    && _.isEqual(readonlyMessage._data,this.getData());
    }


}