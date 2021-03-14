class STTunnel implements Tunnel {
    tunnelId: string;
    private _messages: [Message];
    private _preProcessor: ProcessorFunction;
    private _processor: ProcessorFunction;

    constructor(processor: ProcessorFunction, tunnelId: string, preProcessor: ProcessorFunction)
    constructor(processor: ProcessorFunction, tunnelId: string, preProcessor?: ProcessorFunction) {

        this.addPreProcessor(preProcessor);

        this.tunnelId = tunnelId;

        this.addProcessor(processor);

    }

    addMessage(message: Message): Tunnel {
        if(message != undefined){
            if(message.callbackFunction == undefined || message.data == undefined){
                new Error("Required properties not defined")
            } else {
                message.setTunnelId(this.tunnelId);
                this._messages.push(message);
                return this;
            }
        } else {
            new Error(" Cannot add undefined values in tunnel")
        }
    }

    addPreProcessor(fn: ProcessorFunction) {
        if(fn != undefined)
            this._preProcessor = fn;
    }

    addProcessor(fn: ProcessorFunction) {
        if(fn != undefined) {
            if(this._processor == undefined)
                this._processor = fn;
            else
                return Error(
                    "Processor already defined for tunnel"
                )
        }
    }

    getLength(): number {
        if(this._messages == undefined)
            return 0;
        else
            return this._messages.length;
    }

    pollMessage(): Message {
        if(this.getLength() > 0){
            return this._messages.shift();
        } else {
            return undefined;
        }
    }

}