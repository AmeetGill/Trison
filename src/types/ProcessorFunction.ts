import ReadOnlyMessage from "../Messages/ReadOnlyMessage";
export type ProcessorFunction = (readOnlyMessage: ReadOnlyMessage) => Promise<ReadOnlyMessage>;

