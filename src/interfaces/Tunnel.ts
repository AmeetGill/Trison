import Message from "../Messages/Message";
import ReadOnlyMessage from "../Messages/ReadOnlyMessage";
import {ProcessorFunction} from "../types/ProcessorFunction";
import {PreProcessorFunction} from "../types/PreProcessorFunction";

export interface Tunnel<T> {

    addMessage(message: Message<T>): ReadOnlyMessage<T>;

    pollMessage(): ReadOnlyMessage<T>;

    addPreProcessor(fn: PreProcessorFunction);

    addProcessor(fn: ProcessorFunction);

    getLength(): number;

    getTunnelId(): string;

    getProcessorFunction(): ProcessorFunction;

    containsMessageWithId(messageId: string): boolean;

    getMessagesWithId(messageId: string): ReadOnlyMessage<T>[];

    isEmpty(): boolean;

    dispose();

}

export default Tunnel;
