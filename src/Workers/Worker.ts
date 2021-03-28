import ReadOnlyMessage from "../Messages/ReadOnlyMessage";
import Tunnel from "../interfaces/Tunnel";
import {ProcessorFunction} from "../types/ProcessorFunction";
import {CURRENTLY_PROCESSING, WORKER_CANNOT_ACCESS_THE_TUNNEL} from "../Utils/const";

export default  class Worker {

    private readonly _tunnels: Tunnel[] = [];
    private currentlyProcessing: boolean = false;
    private map: Map<string,Tunnel>;

    Worker(tunnels: Tunnel[]){
        tunnels.forEach(tunnel => {
            this.map.set(tunnel.getTunnelId(),tunnel)
        })
    }

    private processMessage(message: ReadOnlyMessage, processorFunction: ProcessorFunction): Promise<ReadOnlyMessage> {
        return new Promise<ReadOnlyMessage> (
            (resolve, reject) => {
                try{
                    let processedMessage = processorFunction(message);
                    message.getCallbackFunction()(processedMessage);
                    resolve(processedMessage);
                }catch (err){
                    reject(err);
                }
            }
        )
    }


    async processNextMessage(tunnelId: string){

        if(!this.map.has(tunnelId)){
            throw new Error(WORKER_CANNOT_ACCESS_THE_TUNNEL)
        }

        if(this.currentlyProcessing){
            throw new Error(CURRENTLY_PROCESSING);
        }

        this.currentlyProcessing = true;

        let tunnel = this.map.get(tunnelId);

        let readOnlyMessage = tunnel.pollMessage();
        let processorFunction = tunnel.getProcessorFunction();
        try {
            await this.processMessage(readOnlyMessage, processorFunction);
        }catch (err) {
            throw new Error(err);
        } finally {
            this.currentlyProcessing = false;
        }

    }

}