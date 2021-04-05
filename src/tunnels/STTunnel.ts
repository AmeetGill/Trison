import ReadOnlyMessage from "../Messages/ReadOnlyMessage";
import Message from "../Messages/Message";
import {ProcessorFunction} from "../types/ProcessorFunction";
import Tunnel from "../interfaces/Tunnel";
import {EMPTY_TUNNEL, NO_MESSAGE_FOUND_WITH_ID, REQUIRED_PROPERTY_NOT_FOUND, UNDEFINED_MESSAGE} from "../Utils/const";
import Worker from "../Workers/Worker";
export default class STTunnel implements Tunnel {
    private readonly tunnelId: string;
    private readonly _messages: ReadOnlyMessage[] = [];
    private _preProcessor: ProcessorFunction;
    private _processor: ProcessorFunction;
    private _worker: Worker;
    private readonly haveWorker: boolean;

    constructor(processor: ProcessorFunction, tunnelId: string, preProcessor?: ProcessorFunction, withWorker?: boolean) {

        this.addPreProcessor(preProcessor);

        this.tunnelId = tunnelId;

        this.addProcessor(processor);
        this.haveWorker = withWorker != undefined && withWorker === true;
        if(this.haveWorker) {
            this._worker = new Worker();
        }

    }

    getTunnelId(): string {
        return this.tunnelId;
    }

    private processMessage() {

        this._worker.processNextMessage(this).then(r =>{
            this.processMessage()
        }).catch(err =>{
            // console.log("err", err)
        });

    }

    private addedMessage() {
        if(this.haveWorker)
            this.processMessage();
    }

    addMessage(message: Message): ReadOnlyMessage {
        if(message != undefined){
            if(message.getCallbackFunction() == undefined || message.getData() == undefined){
                throw new Error(REQUIRED_PROPERTY_NOT_FOUND);
            } else {
                message.setTunnelId(this.tunnelId);
                let readOnlyMessage: ReadOnlyMessage = message.createNewReadOnlyMessage();
                if(this._preProcessor != undefined)
                    readOnlyMessage = this.preProcessMessage(readOnlyMessage);
                this._messages.push(readOnlyMessage);
                this.addedMessage();
                return readOnlyMessage.clone();
            }
        } else {
            throw new Error(UNDEFINED_MESSAGE);
        }
    }

    private preProcessMessage(message: ReadOnlyMessage): ReadOnlyMessage {
        return this._preProcessor(message);
    }

    getProcessorFunction(): ProcessorFunction{
        return this._processor;
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
        // console.log("polling message",this.getTunnelId())
        if(this.getLength() > 0){
            return this._messages.shift();
        }

        throw new Error(EMPTY_TUNNEL);

    }


    containsMessageWithId(readonlyMessageId: string): boolean {
        for(let message of this._messages){
            if(message.getMessageId() === readonlyMessageId){
                return true;
            }
        }
        return false;
    }

    getMessagesWithId(messageId: string): ReadOnlyMessage[] {
        let matchedMessages: ReadOnlyMessage[] = [];
        for(let message of this._messages){
            if(message.getMessageId() === messageId){
                matchedMessages.push(message.clone());
            }
        }
        if(matchedMessages.length > 0)
            return matchedMessages;
        throw new Error(NO_MESSAGE_FOUND_WITH_ID);
    }

    isEmpty(): boolean {
        return this.getLength() === 0;
    }

}