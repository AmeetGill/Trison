class ConditionalTunnel extends STTunnel implements ConditionalTunnelInterface {
    private readonly _matchFunction: MatcherFunction;

    public readonly tunnelId: string;

    constructor(processor: ProcessorFunction, tunnelId: string)
    constructor(processor: ProcessorFunction, tunnelId: string, preProcessor?: ProcessorFunction)
    constructor(processor: ProcessorFunction, tunnelId: string, preProcessor?: ProcessorFunction, matchFunction?: MatcherFunction) {
        super(processor,tunnelId,preProcessor);

        if(matchFunction != undefined)
            this._matchFunction = matchFunction;
    }

    match(messageToMatch: Message): boolean {
        if(this._matchFunction == undefined){
            return Math.random() > 0.5;
        }
        return this._matchFunction(messageToMatch);
    }

}