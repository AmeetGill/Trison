import STTunnel from "./STTunnel";
import ReadOnlyMessage from "../Messages/ReadOnlyMessage";
import ConditionalTunnelInterface from "../interfaces/ConditionalTunnelInterface";
import {MatcherFunction} from "../types/MatcherFunction";
import {ProcessorFunction} from "../types/ProcessorFunction";

export default class ConditionalTunnel extends STTunnel implements ConditionalTunnelInterface {
    private readonly _matchFunction: MatcherFunction;

    constructor(processor: ProcessorFunction,  matchFunction: MatcherFunction, tunnelId: string, preProcessor?: ProcessorFunction) {
        super(processor,tunnelId,preProcessor);

        if(matchFunction != undefined)
            this._matchFunction = matchFunction;
    }

    match(messageToMatch: ReadOnlyMessage): boolean {
        if(this._matchFunction == undefined){
            return Math.random() > 0.5;
        }
        return this._matchFunction(messageToMatch);
    }

}