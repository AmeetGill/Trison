import STTunnel from "./tunnels/STTunnel";
import ConditionalTunnel from "./tunnels/ConditionalTunnel";
import ReadOnlyMessage from "./Messages/ReadOnlyMessage";
import Message from "./Messages/Message";
import Tunnel from "./interfaces/Tunnel";
import {ProcessorFunction} from "./types/ProcessorFunction";
import {MatcherFunction} from "./types/MatcherFunction";
import {DUPLICATE_TUNNEL_MESSAGE, NO_CONDITIONAL_TUNNEL_FOUND_MESSAGE, NO_TUNNEL_FOUND_WITH_ID_MESSAGE} from "./Utils/const";
import UUID from "./Utils/UUID";
import {PreProcessorFunction} from "./types/PreProcessorFunction";


export class Queue{
    private readonly stTunnels: Map<string,STTunnel> = new Map<string,STTunnel>();
    private readonly conditionalTunnels: Map<string,ConditionalTunnel> = new Map<string,ConditionalTunnel>();
    private readonly autoCreateTunnels: boolean = false;
    private readonly createWorkerForAutoCreatedTunnels: boolean = false;
    private readonly autoCreateProcessorFunction: ProcessorFunction;

    /**
     *
     * @param autoCreateTunnels: boolean
     * @param createWorkerForAutoCreatedTunnels: boolean
     * @param autoCreateProcessorFunction: boolean
     */
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


    /**
     *
     * @param message: Message
     * @param tunnel: Tunnel
     */
    offerMessage(message: Message, tunnel: Tunnel): ReadOnlyMessage {
        if(!this.containsTunnel(tunnel)) {
            throw new Error(NO_TUNNEL_FOUND_WITH_ID_MESSAGE);
        }
        return tunnel.addMessage(message);
    }

    /**
     *
     * @param tunnelId: string
     */
    removeTunnel(tunnelId: string) {
        if(!this.containsTunnelWithId(tunnelId)){
            throw new Error(NO_TUNNEL_FOUND_WITH_ID_MESSAGE);
        }

        this.stTunnels.delete(tunnelId);
        this.conditionalTunnels.delete(tunnelId);

    }

    /**
     *
     * @param message: Message
     * @param tunnelId: string
     */
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
    /**
     *
     * @param message: Message
     */
    offer(message: Message): ReadOnlyMessage {
        let readOnlyMessage: ReadOnlyMessage = message.createNewReadOnlyMessage();
        let tunnel: Tunnel = this.findMatchingTunnel(readOnlyMessage);

        if(tunnel != undefined){
            return this.offerMessage(message,tunnel);
        }

        throw new Error(NO_CONDITIONAL_TUNNEL_FOUND_MESSAGE);

    }

    /**
     *
     * @param message: ReadOnlyMessage
     * @private
     */
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

    /**
     *
     * @param tunnelToFind: Tunnel
     */
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

    /**
     *
     * @param tunnelId: string
     */
    containsTunnelWithId(tunnelId: string): boolean {

        // console.log("checking tunnelId" + tunnelId + "from " , [...this.conditionalTunnels,...this.stTunnels])
        return this.stTunnels.has(tunnelId) || this.conditionalTunnels.has(tunnelId);
    }


    /**
     *
     * @param processorFunction: ProcessorFunction
     * @param tunnelId: string
     * @param withWorker: boolean
     */
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

    /**
     *
     * @param processorFunction: ProcessorFunction
     * @param withWorker: boolean
     */
    createSTTunnelWithoutId(processorFunction: ProcessorFunction, withWorker: boolean): Tunnel {
        let tunnelId = UUID.generate();
        return this.createSTTunnelWithId(processorFunction,tunnelId,withWorker);
    }

    /**
     *
     * @param tunnelId: string
     * @private
     */
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

    /**
     *
     * @param processorFunction: ProcessorFunction
     * @param tunnelId: string
     * @param preProcessorFunction: PreProcessorFunction
     * @param withWorker: boolean
     */
    createSTTunnelWithPreProcessor(processorFunction: ProcessorFunction, tunnelId: string, preProcessorFunction: PreProcessorFunction, withWorker: boolean): Tunnel {
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

    /**
     *
     * @param matchFunction: MatcherFunction
     * @param processorFunction: ProcessorFunction
     * @param withWorker: boolean
     */
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

    /**
     *
     * @param matchFunction: MatcherFunction
     * @param processorFunction: ProcessorFunction
     * @param preProcessorFunction: PreProcessorFunction
     * @param withWorker: boolean
     */
    createConditionalTunnelWithPreProcessor(matchFunction: MatcherFunction, processorFunction: ProcessorFunction, preProcessorFunction: PreProcessorFunction, withWorker: boolean): Tunnel {
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

    /**
     *
     * @param tunnelId: string
     */
    poll(tunnelId: string): ReadOnlyMessage  {
        if(!this.containsTunnelWithId(tunnelId)){
            throw new Error(NO_TUNNEL_FOUND_WITH_ID_MESSAGE);
        }

        let tunnel: Tunnel = this.getTunnelFromId(tunnelId);

        return tunnel.pollMessage();

    }

}

export default Queue;
