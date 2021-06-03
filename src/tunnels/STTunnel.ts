import ReadOnlyMessage from "../Messages/ReadOnlyMessage";
import Message from "../Messages/Message";
import {ProcessorFunction} from "../types/ProcessorFunction";
import {PreProcessorFunction} from "../types/PreProcessorFunction";
import Tunnel from "../interfaces/Tunnel";
import {EMPTY_TUNNEL, NO_MESSAGE_FOUND_WITH_ID, REQUIRED_PROPERTY_NOT_FOUND, UNDEFINED_MESSAGE} from "../Utils/const";
import Worker from "../Workers/Worker";
export class STTunnel<T> implements Tunnel<T> {
    private readonly tunnelId: string;
    private readonly _messages: ReadOnlyMessage<T>[] = [];
    private _preProcessor: PreProcessorFunction<T>
    private _processor: ProcessorFunction<T>;
    private _worker: Worker<T>;
    private readonly haveWorker: boolean;

    /**
     *
     * @param processor: ProcessorFunction
     * @param tunnelId: string
     * @param preProcessor: PreProcessorFunction
     * @param withWorker: boolean
     */
    constructor(processor: ProcessorFunction<T>, tunnelId: string, preProcessor?: PreProcessorFunction<T>, withWorker?: boolean) {

        this.addPreProcessor(preProcessor);

        this.tunnelId = tunnelId;

        this.addProcessor(processor);
        this.haveWorker = withWorker != undefined && withWorker === true;
        if(this.haveWorker) {
            this._worker = new Worker();
        }

    }

    /**
     *  @return tunnelId: string
     */
    getTunnelId(): string {
        return this.tunnelId;
    }

    /**
     *
     * Process message using worker
     *
     * @private
     */
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

    /**
     *
     * Add message in this tunnel
     *
     * @param message: Message
     */
    addMessage(message: Message<T>): ReadOnlyMessage<T> {
        if(message != undefined){
            if(message.getCallbackFunction() == undefined || message.getData() == undefined){
                throw new Error(REQUIRED_PROPERTY_NOT_FOUND);
            } else {
                message.setTunnelId(this.tunnelId);
                let readOnlyMessage: ReadOnlyMessage<T> = message.createNewReadOnlyMessage();
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

    /**
     *
     * @param message: ReadOnlyMessage
     * @private
     */
    private preProcessMessage(message: ReadOnlyMessage<T>): ReadOnlyMessage<T> {
        return this._preProcessor(message);
    }

    /**
     *
     * Get processor Function of this tunnel
     *
     */
    getProcessorFunction(): ProcessorFunction<T>{
        return this._processor;
    }

    /**
     * To change the existing PreProcessor
     *
     * @param fn: PreProcessorFunction
     */
    addPreProcessor(fn: PreProcessorFunction<T>) {
        if(fn != undefined)
            this._preProcessor = fn;
    }

    /**
     *
     * Change Processor function if already not defined
     *
     * @param fn
     */
    addProcessor(fn: ProcessorFunction<T>) {
        if(fn != undefined) {
            if(this._processor == undefined)
                this._processor = fn;
            else
                throw new Error(
                    "Processor already defined for tunnel"
                )
        }
    }

    /**
     *
     * @return Number of messages in tunnel
     *
     */
    getLength(): number {
        if(this._messages == undefined)
            return 0;
        else
            return this._messages.length;
    }

    /**
     * Poll message
     *
     * @return ReadOnlyMessage
     *
     */
    pollMessage(): ReadOnlyMessage<T> {
        // console.log("polling message",this.getTunnelId())
        if(this.getLength() > 0){
            return this._messages.shift();
        }

        throw new Error(EMPTY_TUNNEL);

    }

    /**
     *
     * @param readonlyMessageId: string
     */
    containsMessageWithId(readonlyMessageId: string): boolean {
        for(let message of this._messages){
            if(message.getMessageId() === readonlyMessageId){
                return true;
            }
        }
        return false;
    }

    /**
     *
     * Get messages matching a messageId
     *
     * @param messageId: string
     */
    getMessagesWithId(messageId: string): ReadOnlyMessage<T>[] {
        let matchedMessages: ReadOnlyMessage<T>[] = [];
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

    dispose() {
        delete this._worker;
    }

}

export default STTunnel;
