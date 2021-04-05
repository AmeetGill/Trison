import ReadOnlyMessage from "../Messages/ReadOnlyMessage";
import Tunnel from "../interfaces/Tunnel";
import {ProcessorFunction} from "../types/ProcessorFunction";
import {CURRENTLY_PROCESSING} from "../Utils/const";

export default  class Worker {

    private _currentlyProcessing = false;

    constructor(){}

    private processMessage(message: ReadOnlyMessage, processorFunction: ProcessorFunction): Promise<ReadOnlyMessage> {
        return new Promise<ReadOnlyMessage> (
            (resolve, reject) => {
                try{
                    let callbackFunction = message.getCallbackFunction();
                    let processedMessage = processorFunction(message);
                    callbackFunction(processedMessage);
                    resolve(processedMessage);
                }catch (err){
                    reject(err);
                }
            }
        )
    }


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