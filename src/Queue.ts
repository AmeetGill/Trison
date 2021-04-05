import STTunnel from "./tunnels/STTunnel";
import ConditionalTunnel from "./tunnels/ConditionalTunnel";
import ReadOnlyMessage from "./Messages/ReadOnlyMessage";
import Message from "./Messages/Message";
import Tunnel from "./interfaces/Tunnel";
import {ProcessorFunction} from "./types/ProcessorFunction";
import {MatcherFunction} from "./types/MatcherFunction";
import {DUPLICATE_TUNNEL_MESSAGE, NO_CONDITIONAL_TUNNEL_FOUND_MESSAGE, NO_TUNNEL_FOUND_WITH_ID_MESSAGE} from "./Utils/const";
import UUID from "./Utils/UUID";


export default class Queue{
    private readonly stTunnels: Map<string,STTunnel> = new Map<string,STTunnel>();
    private readonly conditionalTunnels: Map<string,ConditionalTunnel> = new Map<string,ConditionalTunnel>();
    private readonly autoCreateTunnels: boolean = false;
    private readonly createWorkerForAutoCreatedTunnels: boolean = false;
    private readonly autoCreateProcessorFunction: ProcessorFunction;

    constructor(autoCreateTunnels?: boolean, createWorkerForAutoCreatedTunnels?: boolean, autoCreateProcessorFunction?: ProcessorFunction) {
        this.autoCreateTunnels = autoCreateTunnels;
        this.createWorkerForAutoCreatedTunnels = createWorkerForAutoCreatedTunnels;
        if(autoCreateTunnels){
            if(autoCreateProcessorFunction == undefined){
                throw new Error("Cannot create tunnels without processor function")
            } else {
                this.autoCreateProcessorFunction = autoCreateProcessorFunction;
            }
        }
    }


    offerMessage(message: Message, tunnel: Tunnel): ReadOnlyMessage {
        if(!this.containsTunnel(tunnel)) {
            throw new Error(NO_TUNNEL_FOUND_WITH_ID_MESSAGE);
        }
        return tunnel.addMessage(message);
    }

    removeTunnel(tunnelId: string) {
        if(!this.containsTunnelWithId(tunnelId)){
            throw new Error(NO_TUNNEL_FOUND_WITH_ID_MESSAGE);
        }

        this.stTunnels.delete(tunnelId);
        this.conditionalTunnels.delete(tunnelId);

    }

    offerMessageForTunnelId(message: Message, tunnelId: string): ReadOnlyMessage {
        if(!this.containsTunnelWithId(tunnelId)) {
            if(!this.autoCreateTunnels)
                throw new Error(NO_TUNNEL_FOUND_WITH_ID_MESSAGE);
            else {
                this.createSTTunnelWithId(
                    this.autoCreateProcessorFunction,
                    tunnelId,
                    this.createWorkerForAutoCreatedTunnels
                )
            }
        }
        let tunnel = this.getTunnelFromId(tunnelId);
        return tunnel.addMessage(message);
    }

    // will match with conditional tunnels
    // force push to push a message even if no tunnel is not found, create a separate tunnel for unwatch messages;
    offer(message: Message): ReadOnlyMessage {
        let readOnlyMessage: ReadOnlyMessage = message.createNewReadOnlyMessage();
        let tunnel: Tunnel = this.findMatchingTunnel(readOnlyMessage);

        if(tunnel != undefined){
            return this.offerMessage(message,tunnel);
        }

        throw new Error(NO_CONDITIONAL_TUNNEL_FOUND_MESSAGE);

    }

    private findMatchingTunnel(message: ReadOnlyMessage): Tunnel {
        // need to handle synchronization
        // return the first matching tunnel
        let entryMapIterator = this.conditionalTunnels.values();
        let entryResult = entryMapIterator.next();
        while(!entryResult.done){
            let tunnel = entryResult.value;
            if(tunnel.match(message)){
                return tunnel;
            }
            entryResult = entryMapIterator.next();
        }

        return undefined;

    }

    containsTunnel(tunnelToFind: Tunnel): boolean {
        let entryMapIterator = this.conditionalTunnels.values();
        let entryResult = entryMapIterator.next();
        while(!entryResult.done){
            let tunnel = entryResult.value;
            if(tunnelToFind === tunnel)
                return true;
            entryResult = entryMapIterator.next();
        }

        let entryMapIteratorST = this.stTunnels.values();
        let entryResultST = entryMapIteratorST.next();
        while(!entryResultST.done){
            let tunnel = entryResultST.value;
            if(tunnelToFind === tunnel)
                return true;
            entryResultST = entryMapIteratorST.next();
        }
        return false;
    }

    containsTunnelWithId(tunnelId: string): boolean {

        // console.log("checking tunnelId" + tunnelId + "from " , [...this.conditionalTunnels,...this.stTunnels])
        return this.stTunnels.has(tunnelId) || this.conditionalTunnels.has(tunnelId);
    }


    createSTTunnelWithId(processorFunction: ProcessorFunction, tunnelId: string, withWorker: boolean): Tunnel {
        if(this.containsTunnelWithId(tunnelId)){
            throw new Error(DUPLICATE_TUNNEL_MESSAGE);
        }

        let newSTTunnel: STTunnel= new STTunnel(
                processorFunction,
                tunnelId,
                undefined,
                withWorker
            );

        this.stTunnels.set(tunnelId,newSTTunnel);
        return newSTTunnel;
    }

    createSTTunnelWithoutId(processorFunction: ProcessorFunction, withWorker: boolean): Tunnel {
        let tunnelId = UUID.generate();
        return this.createSTTunnelWithId(processorFunction,tunnelId,withWorker);
    }

    private getTunnelFromId(tunnelId: string): Tunnel {
        // this function assume tunnel exists
        if(this.conditionalTunnels.has(tunnelId)){
            return this.conditionalTunnels.get(tunnelId);
        }

        if(this.stTunnels.has(tunnelId)){
            return this.stTunnels.get(tunnelId);
        }

        throw new Error(NO_TUNNEL_FOUND_WITH_ID_MESSAGE);
    }

    createSTTunnelWithPreProcessor(processorFunction: ProcessorFunction, tunnelId: string, preProcessorFunction: ProcessorFunction, withWorker: boolean): Tunnel {
        if(this.containsTunnelWithId(tunnelId)){
            throw new Error(DUPLICATE_TUNNEL_MESSAGE);
        }
        let newSTTunnel: STTunnel = new STTunnel(
            processorFunction,
            tunnelId,
            preProcessorFunction,
            withWorker
        )
        this.stTunnels.set(tunnelId,newSTTunnel);
        // need to think about should return whole tunnel
        return newSTTunnel;
    }

    createConditionalTunnel(matchFunction: MatcherFunction, processorFunction: ProcessorFunction, withWorker: boolean): Tunnel {
        let tunnelId = UUID.generate();
        let conditionalTunnel: ConditionalTunnel = new ConditionalTunnel(
            processorFunction,
            matchFunction,
            tunnelId,
            undefined,
            withWorker
        );
        this.conditionalTunnels.set(tunnelId,conditionalTunnel);
        return conditionalTunnel;
    }

    createConditionalTunnelWithPreProcessor(matchFunction: MatcherFunction, processorFunction: ProcessorFunction, preProcessorFunction: ProcessorFunction, withWorker: boolean): Tunnel {
        let tunnelId = UUID.generate();
        let conditionalTunnel: ConditionalTunnel = new ConditionalTunnel(
            processorFunction,
            matchFunction,
            tunnelId,
            preProcessorFunction,
            withWorker
        );
        this.conditionalTunnels.set(tunnelId,conditionalTunnel);
        return conditionalTunnel;
    }

    poll(tunnelId: string): ReadOnlyMessage  {
        if(!this.containsTunnelWithId(tunnelId)){
            throw new Error(NO_TUNNEL_FOUND_WITH_ID_MESSAGE);
        }

        let tunnel: Tunnel = this.getTunnelFromId(tunnelId);

        return tunnel.pollMessage();

    }

}