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


export class Queue<T>{
    private readonly stTunnels: Map<string,STTunnel<T>> = new Map<string,STTunnel<T>>();
    private readonly conditionalTunnels: Map<string,ConditionalTunnel<T>> = new Map<string,ConditionalTunnel<T>>();
    private readonly autoCreateTunnels: boolean = false;
    private readonly createWorkerForAutoCreatedTunnels: boolean = false;
    private readonly autoCreateProcessorFunction: ProcessorFunction<T>;

    /**
     *
     * @param autoCreateTunnels: boolean
     * @param createWorkerForAutoCreatedTunnels: boolean
     * @param autoCreateProcessorFunction: boolean
     */
    constructor(autoCreateTunnels?: boolean, createWorkerForAutoCreatedTunnels?: boolean, autoCreateProcessorFunction?: ProcessorFunction<T>) {
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
    offerMessage(message: Message<T>, tunnel: Tunnel<T>): ReadOnlyMessage<T> {
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
    offerMessageForTunnelId(message: Message<T>, tunnelId: string): ReadOnlyMessage<T> {
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
    offer(message: Message<T>): ReadOnlyMessage<T> {
        let readOnlyMessage: ReadOnlyMessage<T> = message.createNewReadOnlyMessage();
        let tunnel: Tunnel<T> = this.findMatchingTunnel(readOnlyMessage);

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
    private findMatchingTunnel(message: ReadOnlyMessage<T>): Tunnel<T> {
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
    containsTunnel(tunnelToFind: Tunnel<T>): boolean {
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
    createSTTunnelWithId(processorFunction: ProcessorFunction<T>, tunnelId: string, withWorker: boolean): Tunnel<T> {
        if(this.containsTunnelWithId(tunnelId)){
            throw new Error(DUPLICATE_TUNNEL_MESSAGE);
        }

        let newSTTunnel: STTunnel<T>= new STTunnel(
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
    createSTTunnelWithoutId(processorFunction: ProcessorFunction<T>, withWorker: boolean): Tunnel<T> {
        let tunnelId = UUID.generate();
        return this.createSTTunnelWithId(processorFunction,tunnelId,withWorker);
    }

    /**
     *
     * @param tunnelId: string
     * @private
     */
    private getTunnelFromId(tunnelId: string): Tunnel<T> {
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
    createSTTunnelWithPreProcessor(processorFunction: ProcessorFunction<T>, tunnelId: string, preProcessorFunction: PreProcessorFunction<T>, withWorker: boolean): Tunnel<T> {
        if(this.containsTunnelWithId(tunnelId)){
            throw new Error(DUPLICATE_TUNNEL_MESSAGE);
        }
        let newSTTunnel: STTunnel<T> = new STTunnel(
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
    createConditionalTunnel(matchFunction: MatcherFunction<T>, processorFunction: ProcessorFunction<T>, withWorker: boolean): Tunnel<T> {
        let tunnelId = UUID.generate();
        let conditionalTunnel: ConditionalTunnel<T> = new ConditionalTunnel(
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
    createConditionalTunnelWithPreProcessor(matchFunction: MatcherFunction<T>, processorFunction: ProcessorFunction<T>, preProcessorFunction: PreProcessorFunction<T>, withWorker: boolean): Tunnel<T> {
        let tunnelId = UUID.generate();
        let conditionalTunnel: ConditionalTunnel<T> = new ConditionalTunnel(
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
    poll(tunnelId: string): ReadOnlyMessage<T>  {
        if(!this.containsTunnelWithId(tunnelId)){
            throw new Error(NO_TUNNEL_FOUND_WITH_ID_MESSAGE);
        }

        let tunnel: Tunnel<T> = this.getTunnelFromId(tunnelId);

        return tunnel.pollMessage();

    }

}

export default Queue;
