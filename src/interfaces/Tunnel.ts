interface Tunnel {

    addMessage(message: WriteableMessage): ReadOnlyMessage;

    pollMessage(): ReadOnlyMessage;

    addPreProcessor(fn: ProcessorFunction);

    addProcessor(fn: ProcessorFunction);

    getLength(): number;

    getTunnelId(): string;

}