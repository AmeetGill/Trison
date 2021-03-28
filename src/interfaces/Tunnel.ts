import Message from "../Messages/Message";
import ReadOnlyMessage from "../Messages/ReadOnlyMessage";
import {ProcessorFunction} from "../types/ProcessorFunction";

export default interface Tunnel {

    addMessage(message: Message): ReadOnlyMessage;

    pollMessage(): ReadOnlyMessage;

    addPreProcessor(fn: ProcessorFunction);

    addProcessor(fn: ProcessorFunction);

    getLength(): number;

    getTunnelId(): string;

    getProcessorFunction(): ProcessorFunction;

    containsMessageWithId(messageId: string): boolean;

    getMessagesWithId(messageId: string): ReadOnlyMessage[];

    isEmpty(): boolean;

}