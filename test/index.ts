import ConditionalTests from "./Tunnels/ConditionalTunnel";
import STTunnelTests from "./Tunnels/STTunnel";
import MessageTests from "./Messages/MessageTests";
import QueueTests from "./Queue/QueueTests"
import {describe} from "mocha";

describe("Pistol Tests", () => {
    describe('Test ConditionalTunnel', ConditionalTests);
    describe('Test STTunnel', STTunnelTests);
    describe('Test Messages', MessageTests)
    describe('Test Queue',QueueTests)
})