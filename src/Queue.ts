import { v4 as uuid } from "uuid";

class Queue{
    private stTunnels: [STTunnel];
    private conditionalTunnels: [ConditionalTunnel];

    constructor() {}

    offerMessage(message: WriteableMessage, tunnel: Tunnel): ReadOnlyMessage {
        if(!this.containsTunnel(tunnel)) {
            throw new Error("Not able to find the tunnel");
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

        throw new Error(" No matching tunnel found, pass forcePush param if still want to add this message");

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

        for(let tunnel of [...this.conditionalTunnels,...this.stTunnels]){
            if(tunnel.getTunnelId() === tunnelToFind.getTunnelId()){
                return true;
            }
        }

        return false;
    }

    containsTunnelId(tunnelIdToFind: string): boolean {

        for(let tunnel of [...this.conditionalTunnels,...this.stTunnels]){
            if(tunnel.getTunnelId() === tunnelIdToFind){
                return true;
            }
        }

        return false;
    }

    addSTTunnelWithId(processorFunction: ProcessorFunction, tunnelId: string): Tunnel {
        let newSTTunnel: STTunnel= new STTunnel(
                processorFunction,
                tunnelId,
            );

        this.stTunnels.push(newSTTunnel);
        return newSTTunnel;
    }

    addSTTunnelWithoutId(processorFunction: ProcessorFunction ): Tunnel {
        let tunnelId = uuid();
        return this.addSTTunnelWithId(processorFunction,tunnelId);
    }

    private getTunnelFromId(tunnelId: string): Tunnel {
        // this function assume tunnel exists
        for(let tunnel of [...this.conditionalTunnels,...this.stTunnels]){
            if(tunnel.getTunnelId() === tunnelId){
                return tunnel;
            }
        }

        throw new Error("No tunnels found with given id");
    }

    createSTTunnelWithPreProcessor(processorFunction: ProcessorFunction, tunnelId: string, preProcessorFunction: ProcessorFunction): Tunnel {
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
        let tunnelId = uuid();
        let conditionalTunnel: ConditionalTunnel = new ConditionalTunnel(
            processorFunction,
            matchFunction,
            tunnelId
        );
        this.conditionalTunnels.push(conditionalTunnel);
        return conditionalTunnel;
    }

    createConditionalTunnelWithPreProcessor(matchFunction: MatcherFunction, tunnelId: string, processorFunction: ProcessorFunction, preProcessorFunction: ProcessorFunction): Tunnel {
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
        if(!this.containsTunnelId(tunnelId)){
            throw new Error("No tunnel found with given tunnel Id");
        }

        let tunnel: Tunnel = this.getTunnelFromId(tunnelId);

        return tunnel.pollMessage();

    }

}