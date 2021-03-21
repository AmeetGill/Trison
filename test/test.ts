import ReadOnlyMessage from "../src/Messages/ReadOnlyMessage";
import WriteableMessage from "../src/Messages/WriteableMessage";
import {describe,it} from "mocha"
import {expect} from "chai";
import Queue from "../src/Queue";
import STTunnel from "../src/tunnels/STTunnel";
import {stub,mock} from "sinon";
import Tunnel from "../src/interfaces/Tunnel";
import {DUPLICATE_TUNNEL_MESSAGE} from "../src/Utils/const";

let data = {
    userId: "lk3kj3kj3kj3k3jk3j",
    text: "Hello Testing"
}


let processorFunction = (message: ReadOnlyMessage) => {
    let extractedData = message.getData();
    extractedData["processed"] = true;
    return new ReadOnlyMessage(
        message.getCallbackFunction,
        extractedData,
        message.getPriority(),
        message.getTunnelId()
    );

}

describe('STTunnel should behave like simple queue', function() {
    describe('test createSTTunnelWithoutId ', function() {
        it('should be able to ', function() {
            stub(Queue).getUniqueTunnelId.returns("uuid")

            let newMultiLevelQueue = new Queue();

            let tunnelCreated = newMultiLevelQueue.createSTTunnelWithoutId(
                processorFunction
            );

            let expectedTunnel: Tunnel = new STTunnel(
                processorFunction,
              "uuid"
            );

            expect(tunnelCreated).to.deep.equal(expectedTunnel)
            expect(newMultiLevelQueue.containsTunnelWithId("uuid")).to.true;
            expect(newMultiLevelQueue.containsTunnelWithId("uuid1")).to.false;

        });
    });

    describe('test createSTTunnelWithId ', function() {
        it('should be able to ', function() {
            let myUUID = "myUUID"
            let newMultiLevelQueue = new Queue();

            let tunnelCreated = newMultiLevelQueue.createSTTunnelWithId(
                processorFunction,
                myUUID
            );

            let expectedTunnel: Tunnel = new STTunnel(
                processorFunction,
                myUUID
            );

            expect(tunnelCreated).to.deep.equal(expectedTunnel)
            expect(newMultiLevelQueue.containsTunnelWithId(myUUID)).to.true;
            expect(newMultiLevelQueue.containsTunnelWithId("uuid1")).to.false;

        });
    });

    describe('test duplicates using createSTTunnelWithId ', function() {
        it('should be able to ', function() {
            let myUUID = "myUUID"

            let newMultiLevelQueue = new Queue();

            let tunnelCreated = newMultiLevelQueue.createSTTunnelWithId(
                processorFunction,
                myUUID
            );

            let expectedTunnel: Tunnel = new STTunnel(
                processorFunction,
                myUUID
            );

            expect(tunnelCreated).to.deep.equal(expectedTunnel)
            expect(newMultiLevelQueue.containsTunnelWithId(myUUID)).to.true;
            expect(newMultiLevelQueue.containsTunnelWithId("uuid1")).to.false;

            expect(() => newMultiLevelQueue.createSTTunnelWithId(
                processorFunction,
                myUUID
            )).to.throw(Error).with.property("message",DUPLICATE_TUNNEL_MESSAGE)

            let newUUID = "myUUID2";

            newMultiLevelQueue.createSTTunnelWithId(
                processorFunction,
                newUUID
            );

            expect(newMultiLevelQueue.containsTunnelWithId(newUUID)).to.true;

        });
    });

});
