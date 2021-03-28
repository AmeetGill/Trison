import ReadOnlyMessage from "../Messages/ReadOnlyMessage";
import Tunnel from "../interfaces/Tunnel";
import {ProcessorFunction} from "../types/ProcessorFunction";
import {CURRENTLY_PROCESSING, WORKER_CANNOT_ACCESS_THE_TUNNEL} from "../Utils/const";

export default  class Worker {

    private readonly _locks: Set<string>;
    private _map: Map<string,Tunnel>;

    constructor(tunnels: Tunnel[]){
        this._locks = new Set<string>();
        this._map = new Map<string,Tunnel>();
        tunnels.forEach(tunnel => {
            this._map.set(tunnel.getTunnelId(),tunnel)
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


    private async processNextMessage(tunnelId: string){
        if(!this._map.has(tunnelId)){
            throw new Error(WORKER_CANNOT_ACCESS_THE_TUNNEL)
        }

        if(this._locks.has(tunnelId)){
            throw new Error(CURRENTLY_PROCESSING);
        }
        console.log("processing messages of tunnel",tunnelId)

        console.log(" Acquiring lock")

        this._locks.add(tunnelId);

        let tunnel = this._map.get(tunnelId);

        try {
            let readOnlyMessage = tunnel.pollMessage();
            let processorFunction = tunnel.getProcessorFunction();
            await this.processMessage(readOnlyMessage, processorFunction);
        }catch (err) {
            throw new Error(err);
        } finally {
            console.log(" removing lock",tunnelId)
            this._locks.delete(tunnelId)
            console.log("locks after removing",this._locks)
        }

    }

    dispatchAction() {
        // need to add clear interval , like typing
        console.log("Starting dispatcher")
        // setTimeout(() => {
            let iterator = this._map.keys();
            let integratorResult = iterator.next();
            while (!integratorResult.done) {
                let tunnelId = integratorResult.value;
                this.processNextMessage(tunnelId).then(r => {
                    console.log("Processing complete")
                }).catch(e => {
                    // console.error("Error occured", e.message)
                });
                integratorResult = iterator.next();
            }

        //     }
        // },100)
    }


}