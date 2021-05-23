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

    /**
     *
     * @param data: object
     * @param callbackFunction: CallbackFunction
     * @param priority: number
     */
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

        if(priority != undefined)
            this._priority = priority;
        else
            throw new Error(INVALID_MESSAGE_PROPERTY+ERROR_DELIM+INVALID_MESSAGE_PRIORITY);

        this._messageId = UUID.generate();
    }



    createNewReadOnlyMessage() {
        return new ReadOnlyMessage(this);
    }

    // this will assign a new message id
     clone = {
            complete : () => {
                return new Message(
                    _.cloneDeep<object>(this.getData()),
                    this.getCallbackFunction(),
                    this.getPriority()
                )
            },
            with: {
                different: {
                    callbackFunction : (newCallbackFunction: CallbackFunction) => {
                        if(newCallbackFunction == undefined)
                            throw new Error(INVALID_MESSAGE_CALLBACK)

                        return new Message(
                            _.cloneDeep<object>(this.getData()),
                            newCallbackFunction,
                            this.getPriority()
                        )
                    },
                    priority: (newPriority: number) => {
                        return new Message(
                            _.cloneDeep<object>(this.getData()),
                            this.getCallbackFunction(),
                            newPriority
                        )
                    },
                    data: (newData: object) => {
                        return new Message(
                            _.cloneDeep<object>(newData),
                            this.getCallbackFunction(),
                            this.getPriority()
                        )
                    }
                }
            }
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

    /**
     *
     * Compare two messages field excluding CallbackFunction
     *
     * @param writeableMessage: Message
     */
    equals(writeableMessage: Message): boolean {
        return  writeableMessage.getPriority() == this.getPriority()
                        && (writeableMessage.getTunnelId() ? writeableMessage.getTunnelId() === this.getTunnelId() : true)
                        && writeableMessage.getMessageId() === this.getMessageId()
                        && _.isEqual(writeableMessage.getData(),this.getData());
    }
}
