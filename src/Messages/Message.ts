import ReadOnlyMessage from "./ReadOnlyMessage";
import {CallbackFunction} from "../types/CallbackFunction";
import * as _ from "lodash";
import {
    ERROR_DELIM, INVALID_MESSAGE_CALLBACK,
    INVALID_MESSAGE_DATA,
    INVALID_MESSAGE_PRIORITY,
    INVALID_MESSAGE_PROPERTY,
    INVALID_TUNNEL_ID, REQUIRED_ARGUMENTS_NOTFOUND
} from "../Utils/const";
import UUID from "../Utils/UUID";

export default class Message {

    //to which tunnel message is assigned
    private _tunnelId: string;

    //data
    private readonly _data: object;
    private readonly _callbackFunction: CallbackFunction;
    private readonly _priority: number;
    private readonly _messageId: string;

    constructor(data: object, callbackFunction: CallbackFunction, priority: number) {

        if( data != undefined)
            this._data = _.cloneDeep<object>(data);
        else
            throw new Error(INVALID_MESSAGE_PROPERTY+ ERROR_DELIM +INVALID_MESSAGE_DATA);

        if(callbackFunction != undefined && callbackFunction) {
            // if( )
            this._callbackFunction = callbackFunction;
        } else
            throw new Error(INVALID_MESSAGE_PROPERTY+ ERROR_DELIM + INVALID_MESSAGE_CALLBACK);

        if(priority != undefined && (priority >= 1 && priority <=  100))
            this._priority = priority;
        else
            throw new Error(INVALID_MESSAGE_PROPERTY+ERROR_DELIM+INVALID_MESSAGE_PRIORITY);

        this._messageId = UUID.generate();
    }



    createNewReadOnlyMessage() {
        return new ReadOnlyMessage(this);
    }

    // this will assign a new message id
    clone(): Message{
        return new Message(
            _.cloneDeep<object>(this.getData()),
            this.getCallbackFunction,
            this.getPriority()
        );
    }

    getData(): object {
        return this._data;
    }

    setTunnelId(tunnelId: string){
        if(tunnelId != undefined)
            this._tunnelId = tunnelId;
        else
            throw new Error(INVALID_TUNNEL_ID);
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

    equals(writeableMessage: Message): boolean {
        return  writeableMessage.getPriority() == this.getPriority()
                        && (writeableMessage.getTunnelId() ? writeableMessage.getTunnelId() === this.getTunnelId() : true)
                        && _.isEqual(writeableMessage.getData(),this.getData());
    }
}