import STTunnel from "./STTunnel";
import ReadOnlyMessage from "../Messages/ReadOnlyMessage";
import ConditionalTunnelInterface from "../interfaces/ConditionalTunnelInterface";
import {MatcherFunction} from "../types/MatcherFunction";
import {ProcessorFunction} from "../types/ProcessorFunction";
import {PreProcessorFunction} from "../types/PreProcessorFunction";

export class ConditionalTunnel<T> extends STTunnel<T> implements ConditionalTunnelInterface<T> {
    private readonly _matchFunction: MatcherFunction<T>;

    /**
     *
     * @param processor: ProcessorFunction
     * @param matchFunction: MatcherFunction
     * @param tunnelId: string
     * @param preProcessor: PreProcessorFunction
     * @param withWorker: boolean
     */
    constructor(processor: ProcessorFunction<T>,  matchFunction: MatcherFunction<T>, tunnelId: string, preProcessor?: PreProcessorFunction<T>, withWorker?: boolean) {
        super(processor,tunnelId,preProcessor,withWorker);

        this._matchFunction = matchFunction;
    }

    /**
     *
     * @param messageToMatch: ReadOnlyMessage
     */
    match(messageToMatch: ReadOnlyMessage<T>): boolean {
        return this._matchFunction(messageToMatch);
    }

}

export default ConditionalTunnel;
