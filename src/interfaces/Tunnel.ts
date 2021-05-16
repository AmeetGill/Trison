import Message from "../Messages/Message";
import ReadOnlyMessage from "../Messages/ReadOnlyMessage";
import {ProcessorFunction} from "../types/ProcessorFunction";
import {PreProcessorFunction} from "../types/PreProcessorFunction";

export default interface Tunnel {

    addMessage(message: Message): ReadOnlyMessage;

    pollMessage(): ReadOnlyMessage;

    addPreProcessor(fn: PreProcessorFunction);

    addProcessor(fn: ProcessorFunction);

    getLength(): number;

    getTunnelId(): string;

    getProcessorFunction(): ProcessorFunction;

    containsMessageWithId(messageId: string): boolean;

    getMessagesWithId(messageId: string): ReadOnlyMessage[];

    isEmpty(): boolean;

    dispose();

}
