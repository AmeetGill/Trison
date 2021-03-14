class PriorityTunnel extends STTunnel implements PriorityTunnelInterface {
    private tunnelPriority: number
    public readonly tunnelId: string;

    constructor(processor: ProcessorFunction, tunnelId: string)
    constructor(processor: ProcessorFunction, tunnelId: string, preProcessor?: ProcessorFunction) {
        super(processor,tunnelId,preProcessor);

    }


    assignPriority(priority: number) {
    }

}