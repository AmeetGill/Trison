import ReadOnlyMessage from "../Messages/ReadOnlyMessage";
import Tunnel from "./Tunnel";
export interface ConditionalTunnelInterface<T> extends Tunnel<T>{

    // when message is passed to thus function it will check whether message should be added to this tunnel or not
    match(messageToMatch: ReadOnlyMessage<T>): boolean;


}

export default ConditionalTunnelInterface;
