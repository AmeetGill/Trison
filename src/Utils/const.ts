import {v4 as uuid} from "uuid";
export let DUPLICATE_TUNNEL_MESSAGE = "Tunnel with id already exists"
export let NO_TUNNEL_FOUND_WITH_ID_MESSAGE = "Not able to find the tunnel"
export let NO_CONDITIONAL_TUNNEL_FOUND_MESSAGE = "No matching tunnel found"
export let REQUIRED_PROPERTY_NOT_FOUND = "Required property not found"
export let UNDEFINED_MESSAGE = "Cannot add undefined values in tunnel"
export let NO_MESSAGE_FOUND_WITH_ID = "Cannot find message with given messageId"
export let getUniqueId = () => uuid()