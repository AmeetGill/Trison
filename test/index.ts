import ConditionalTests from "./Tunnels/ConditionalTunnel";
import STTunnelTests from "./Tunnels/STTunnel";
import MessageTests from "./Messages/MessageTests";
import {describe} from "mocha";
import {createSandbox} from "sinon";

describe("Pistol Tests", () => {
    let sandbox = createSandbox();
    beforeEach(() => {
        sandbox.restore()
    })
    describe('Test ConditionalTunnel', ConditionalTests);
    describe('Test STTunnel', STTunnelTests);
    describe('Test Messages', MessageTests)
})