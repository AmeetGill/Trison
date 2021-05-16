import STTunnel from "./STTunnel";
import ReadOnlyMessage from "../Messages/ReadOnlyMessage";
import ConditionalTunnelInterface from "../interfaces/ConditionalTunnelInterface";
import {MatcherFunction} from "../types/MatcherFunction";
import {ProcessorFunction} from "../types/ProcessorFunction";
import {PreProcessorFunction} from "../types/PreProcessorFunction";

export default class ConditionalTunnel extends STTunnel implements ConditionalTunnelInterface {
    private readonly _matchFunction: MatcherFunction;

    constructor(processor: ProcessorFunction,  matchFunction: MatcherFunction, tunnelId: string, preProcessor?: PreProcessorFunction, withWorker?: boolean) {
        super(processor,tunnelId,preProcessor,withWorker);

        this._matchFunction = matchFunction;
    }

    match(messageToMatch: ReadOnlyMessage): boolean {
        return this._matchFunction(messageToMatch);
    }

}
