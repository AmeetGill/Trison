import ReadOnlyMessage from "../Messages/ReadOnlyMessage";
export type ProcessorFunction = (readOnlyMessage: ReadOnlyMessage) => ReadOnlyMessage;

