import ReadOnlyMessage from "../Messages/ReadOnlyMessage";
import WriteableMessage from "../Messages/WriteableMessage";
import {ProcessorFunction} from "../types/ProcessorFunction";
import Tunnel from "../interfaces/Tunnel";
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
                throw new Error("Required properties not defined")
            } else {
                message.setTunnelId(this.tunnelId);
                let readOnlyMessage: ReadOnlyMessage = message.createReadOnlyMessage();
                this._messages.push(readOnlyMessage);
                return readOnlyMessage;
            }
        } else {
            throw new Error(" Cannot add undefined values in tunnel")
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

}