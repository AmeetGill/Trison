import ReadOnlyMessage from "../Messages/ReadOnlyMessage";
export type PreProcessorFunction<T> = (readOnlyMessage: ReadOnlyMessage<T>) => ReadOnlyMessage<T>;

