import ReadOnlyMessage from "./ReadOnlyMessage";
import {CallbackFunction} from "../types/CallbackFunction";
import * as _ from "lodash";
import { v4 as uuid} from "uuid";

export default class WriteableMessage{
    //to which tunnel message is assigned
    private _tunnelId: string;

    //data
    private readonly _data: object;
    private readonly _callbackFunction: CallbackFunction;
    private readonly _priority: number;
    private readonly _messageId: string;

    constructor(data: object, callbackFunction: CallbackFunction, priority?: number) {
        this._data = _.cloneDeep<object>(data);
        this._callbackFunction = callbackFunction;
        this._priority = priority;
        this._messageId = uuid();
    }

    createReadOnlyMessage() {
        return new ReadOnlyMessage(
            this.getCallbackFunction,
            _.cloneDeep<object>(this.getData()),
            this.getPriority(),
            this.getTunnelId(),
            this._messageId
        );
    }

    // this will assign a new message id
    clone(): WriteableMessage{
        return new WriteableMessage(
            _.cloneDeep<object>(this.getData()),
            this.getCallbackFunction,
            this.getPriority()
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

    getMessageId(): string {
        return this._messageId;
    }

    equals(writeableMessage: WriteableMessage): boolean {
        return  writeableMessage.getPriority() == this.getPriority()
                        && (writeableMessage.getTunnelId() ? writeableMessage.getTunnelId() === this.getTunnelId() : true)
                        && _.isEqual(writeableMessage.getData(),this.getData());
    }
}