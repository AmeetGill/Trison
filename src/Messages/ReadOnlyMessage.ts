import {CallbackFunction} from "../types/CallbackFunction";
import * as _ from 'lodash';
import Message from "./Message";

export class ReadOnlyMessage<T> {
    private readonly _data: T;
    private readonly _callbackFunction: CallbackFunction<T>;
    private readonly _priority: number;
    private readonly _tunnelId: string;
    private readonly _messageId: string;

    /**
     *
     * @param message: Message| ReadOnlyMessage
     */
    constructor(message: Message<T> | ReadOnlyMessage<T>) {
        this._data = _.cloneDeep<T>(message.getData());
        this._callbackFunction = message.getCallbackFunction();
        this._priority = message.getPriority();
        this._tunnelId = message.getTunnelId();
        this._messageId = message.getMessageId();

    }

    getCallbackFunction(): CallbackFunction<T> {
        return this._callbackFunction;
    }

    clone(): ReadOnlyMessage<T>{
        return new ReadOnlyMessage(this);
    }

    // provide a copy of the data
    getData(): T {
        // return _.cloneDeep<object>(this._data);
        return this._data;
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

    /**
     *
     * Compare two messages field excluding CallbackFunction
     *
     * @param readonlyMessage
     */
    equals(readonlyMessage: ReadOnlyMessage<T>): boolean {
        return readonlyMessage.getTunnelId() === this.getTunnelId()
                    && readonlyMessage.getPriority() === this.getPriority()
                    && readonlyMessage.getMessageId() == this.getMessageId()
                    && _.isEqual(readonlyMessage._data,this.getData());
    }


}

export default ReadOnlyMessage;
