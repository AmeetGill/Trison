import ReadOnlyMessage from "../Messages/ReadOnlyMessage";
import Tunnel from "../interfaces/Tunnel";
import {ProcessorFunction} from "../types/ProcessorFunction";
import {CURRENTLY_PROCESSING} from "../Utils/const";

export default  class Worker {

    private _currentlyProcessing = false;

    constructor(){}

    /**
     *
     * @param message: ReadOnlyMessage
     * @param processorFunction: ProcessorFunction
     * @private
     */
    private async processMessage(message: ReadOnlyMessage, processorFunction: ProcessorFunction): Promise<ReadOnlyMessage> {
        try{
            let callbackFunction = message.getCallbackFunction();
            let processedMessage = await processorFunction(message);
            callbackFunction(processedMessage);
            return processedMessage;
        }catch (err){
            throw new Error("Error while Processing the message");
        }
    }


    /**
     *
     * @param tunnel: Tunnel
     */
    async processNextMessage(tunnel: Tunnel){

        if(this._currentlyProcessing){
            throw new Error(CURRENTLY_PROCESSING);
        }

        this._currentlyProcessing = true;

        try {
            let readOnlyMessage = tunnel.pollMessage();
            let processorFunction = tunnel.getProcessorFunction();
            await this.processMessage(readOnlyMessage, processorFunction);
        }catch (err) {
            throw new Error(err);
        } finally {
            this._currentlyProcessing = false;
        }

    }


}
