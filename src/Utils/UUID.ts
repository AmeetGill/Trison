import {v4 as uuid} from "uuid";

export default class UUID {
    static generate(): string{
        return uuid();
    }
}