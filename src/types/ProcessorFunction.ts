import ReadOnlyMessage from "../Messages/ReadOnlyMessage";
export type ProcessorFunction<T> = (readOnlyMessage: ReadOnlyMessage<T>) => Promise<ReadOnlyMessage<T>>;

