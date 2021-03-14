interface Tunnel {

    // unique tunnelId in queue
    tunnelId: string;

    addMessage(message: Message): Tunnel;

    pollMessage(): Message;

    addPreProcessor(fn: ProcessorFunction);

    addProcessor(fn: ProcessorFunction);

    getLength(): number;

}