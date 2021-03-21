import { v4 as uuid } from "uuid";
import STTunnel from "./tunnels/STTunnel";
import ConditionalTunnel from "./tunnels/ConditionalTunnel";
import ReadOnlyMessage from "./Messages/ReadOnlyMessage";
import WriteableMessage from "./Messages/WriteableMessage";
import Tunnel from "./interfaces/Tunnel";
import {ProcessorFunction} from "./types/ProcessorFunction";
import {MatcherFunction} from "./types/MatcherFunction";
import {DUPLICATE_TUNNEL_MESSAGE, NO_CONDITIONAL_TUNNEL_FOUND_MESSAGE, NO_TUNNEL_FOUND_WITH_ID_MESSAGE} from "./Utils/const";


export default class Queue{
    private readonly stTunnels: STTunnel[] = [];
    private readonly conditionalTunnels: ConditionalTunnel[] = [];

    constructor() {}


    offerMessage(message: WriteableMessage, tunnel: Tunnel): ReadOnlyMessage {
        if(!this.containsTunnel(tunnel)) {
            throw new Error(NO_TUNNEL_FOUND_WITH_ID_MESSAGE);
        }
        return tunnel.addMessage(message);
    }

    // will match with conditional tunnels
    // force push to push a message even if no tunnel is not found, create a separate tunnel for unwatch messages;
    offer(message: WriteableMessage): ReadOnlyMessage {
        let readOnlyMessage: ReadOnlyMessage =message.createReadOnlyMessage();
        let tunnel: Tunnel = this.findMatchingTunnel(readOnlyMessage);

        if(tunnel != undefined){
            return this.offerMessage(message,tunnel);
        }

        throw new Error(NO_CONDITIONAL_TUNNEL_FOUND_MESSAGE);

    }

    private findMatchingTunnel(message: ReadOnlyMessage): Tunnel {
        // need to handle synchronization
        // return the first matching tunnel
        for(let tunnel of this.conditionalTunnels) {
            if(tunnel.match(message)){
                return tunnel;
            }
        }
        return undefined;

    }

    containsTunnel(tunnelToFind: Tunnel): boolean {

        return this.containsTunnelWithId(tunnelToFind.getTunnelId())

    }

    containsTunnelWithId(tunnelId: string): boolean {

        console.log("checking tunnelId" + tunnelId + "from " , [...this.conditionalTunnels,...this.stTunnels])
        for(let tunnel of [...this.conditionalTunnels,...this.stTunnels]){

            if(tunnel.getTunnelId() === tunnelId){
                return true;
            }
        }

        return false;
    }


    createSTTunnelWithId(processorFunction: ProcessorFunction, tunnelId: string): Tunnel {
        if(this.containsTunnelWithId(tunnelId)){
            throw new Error(DUPLICATE_TUNNEL_MESSAGE);
        }
        console.log("creating tunning with id "+tunnelId);

        let newSTTunnel: STTunnel= new STTunnel(
                processorFunction,
                tunnelId,
            );
        console.log("created tunning with id ",newSTTunnel);

        this.stTunnels.push(newSTTunnel);
        return newSTTunnel;
    }

    static getUniqueTunnelId(): string {
        return uuid;
    }

    createSTTunnelWithoutId(processorFunction: ProcessorFunction ): Tunnel {
        let tunnelId = Queue.getUniqueTunnelId();
        return this.createSTTunnelWithId(processorFunction,tunnelId);
    }

    private getTunnelFromId(tunnelId: string): Tunnel {
        // this function assume tunnel exists
        for(let tunnel of [...this.conditionalTunnels,...this.stTunnels]){
            if(tunnel.getTunnelId() === tunnelId){
                return tunnel;
            }
        }

        throw new Error(NO_TUNNEL_FOUND_WITH_ID_MESSAGE);
    }

    createSTTunnelWithPreProcessor(processorFunction: ProcessorFunction, tunnelId: string, preProcessorFunction: ProcessorFunction): Tunnel {
        if(this.containsTunnelWithId(tunnelId)){
            throw new Error(DUPLICATE_TUNNEL_MESSAGE);
        }
        let newSTTunnel: STTunnel = new STTunnel(
            processorFunction,
            tunnelId,
            processorFunction
        )
        this.stTunnels.push(newSTTunnel);
        // need to think about should return whole tunnel
        return newSTTunnel;
    }

    createConditionalTunnel(matchFunction: MatcherFunction, processorFunction: ProcessorFunction): Tunnel {
        let tunnelId = Queue.getUniqueTunnelId();
        let conditionalTunnel: ConditionalTunnel = new ConditionalTunnel(
            processorFunction,
            matchFunction,
            tunnelId
        );
        this.conditionalTunnels.push(conditionalTunnel);
        return conditionalTunnel;
    }

    createConditionalTunnelWithPreProcessor(matchFunction: MatcherFunction, processorFunction: ProcessorFunction, preProcessorFunction: ProcessorFunction): Tunnel {
        let tunnelId = Queue.getUniqueTunnelId();
        let conditionalTunnel: ConditionalTunnel = new ConditionalTunnel(
            processorFunction,
            matchFunction,
            tunnelId,
            preProcessorFunction
        );
        this.conditionalTunnels.push(conditionalTunnel);
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