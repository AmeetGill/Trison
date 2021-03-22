import WriteableMessage from "../Messages/WriteableMessage";
import ReadOnlyMessage from "../Messages/ReadOnlyMessage";
import {ProcessorFunction} from "../types/ProcessorFunction";

export default interface Tunnel {

    addMessage(message: WriteableMessage): ReadOnlyMessage;

    pollMessage(): ReadOnlyMessage;

    addPreProcessor(fn: ProcessorFunction);

    addProcessor(fn: ProcessorFunction);

    getLength(): number;

    getTunnelId(): string;

    containsMessageWithId(messageId: string): boolean;

    getMessageCopyWithId(messageId: string): ReadOnlyMessage;

    isEmpty(): boolean;

}