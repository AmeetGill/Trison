interface ConditionalTunnelInterface extends Tunnel{

    // when message is passed to thus function it will check whether message should be added to this tunnel or not
    match(messageToMatch: ReadOnlyMessage): boolean;


}