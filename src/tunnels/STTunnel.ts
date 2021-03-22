import ReadOnlyMessage from "../Messages/ReadOnlyMessage";
import WriteableMessage from "../Messages/WriteableMessage";
import {ProcessorFunction} from "../types/ProcessorFunction";
import Tunnel from "../interfaces/Tunnel";
import {NO_MESSAGE_FOUND_WITH_ID, REQUIRED_PROPERTY_NOT_FOUND, UNDEFINED_MESSAGE} from "../Utils/const";
export default class STTunnel implements Tunnel {
    private readonly tunnelId: string;
    private _messages: ReadOnlyMessage[] = [];
    private _preProcessor: ProcessorFunction;
    private _processor: ProcessorFunction;

    constructor(processor: ProcessorFunction, tunnelId: string, preProcessor?: ProcessorFunction) {

        this.addPreProcessor(preProcessor);

        this.tunnelId = tunnelId;

        this.addProcessor(processor);

    }

    getTunnelId(): string {
        return this.tunnelId;
    }

    addMessage(message: WriteableMessage): ReadOnlyMessage {
        if(message != undefined){
            if(message.getCallbackFunction() == undefined || message.getData() == undefined){
                throw new Error(REQUIRED_PROPERTY_NOT_FOUND);
            } else {
                message.setTunnelId(this.tunnelId);
                let readOnlyMessage: ReadOnlyMessage = message.createReadOnlyMessage();
                this._messages.push(readOnlyMessage);
                return readOnlyMessage;
            }
        } else {
            throw new Error(UNDEFINED_MESSAGE);
        }
    }

    addPreProcessor(fn: ProcessorFunction) {
        if(fn != undefined)
            this._preProcessor = fn;
    }

    addProcessor(fn: ProcessorFunction) {
        if(fn != undefined) {
            if(this._processor == undefined)
                this._processor = fn;
            else
                throw new Error(
                    "Processor already defined for tunnel"
                )
        }
    }

    getLength(): number {
        if(this._messages == undefined)
            return 0;
        else
            return this._messages.length;
    }

    pollMessage(): ReadOnlyMessage {
        if(this.getLength() > 0){
            return this._messages.shift();
        }

        throw new Error("Empty tunnel");

    }

    // need to handle synchronization
    // slow
    containsMessage(readonlyMessage: ReadOnlyMessage): boolean {
        for(let message of this._messages){
            if(message.equals(readonlyMessage)){
               return true;
            }
        }
        return false;
    }

    containsMessageWithId(readonlyMessageId: string): boolean {
        for(let message of this._messages){
            if(message.getMessageId() === readonlyMessageId){
                return true;
            }
        }
        return false;
    }

    getMessageCopyWithId(readonlyMessageId: string): ReadOnlyMessage {
        for(let message of this._messages){
            if(message.getMessageId() === readonlyMessageId){
                return message.clone();
            }
        }
        throw new Error(NO_MESSAGE_FOUND_WITH_ID);
    }

    isEmpty(): boolean {
        return this.getLength() === 0;
    }

}