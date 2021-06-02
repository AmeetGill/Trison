import ReadOnlyMessage from "../Messages/ReadOnlyMessage";
export type CallbackFunction<T> = (message: ReadOnlyMessage<T>) => any;
