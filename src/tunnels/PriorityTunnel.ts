import STTunnel from "./STTunnel";
import PriorityTunnelInterface from "../interfaces/PriorityTunnelInterface";
import {ProcessorFunction} from "../types/ProcessorFunction";

export class PriorityTunnel extends STTunnel implements PriorityTunnelInterface {
    private tunnelPriority: number

    constructor(processor: ProcessorFunction, tunnelId: string)
    constructor(processor: ProcessorFunction, tunnelId: string, preProcessor?: ProcessorFunction) {
        super(processor,tunnelId,preProcessor);

    }


    assignPriority(priority: number) {
    }

}