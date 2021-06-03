import ReadOnlyMessage from "../Messages/ReadOnlyMessage";
export type MatcherFunction<T> = (readOnyMessage: ReadOnlyMessage<T>) => boolean;
