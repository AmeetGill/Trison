import ReadOnlyMessage from "../src/Messages/ReadOnlyMessage";
import WriteableMessage from "../src/Messages/WriteableMessage";
import {describe,it} from "mocha"
import * as chai from "chai";
import chaiExclude from 'chai-exclude';
import Queue from "../src/Queue";
import STTunnel from "../src/tunnels/STTunnel";
import {stub,mock} from "sinon";
import Tunnel from "../src/interfaces/Tunnel";
import {DUPLICATE_TUNNEL_MESSAGE, NO_MESSAGE_FOUND_WITH_ID} from "../src/Utils/const";

chai.use(chaiExclude);

let expect = chai.expect;

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
        message.getTunnelId(),
        message.getMessageId()
    );

}

describe('STTunnel should behave like simple queue', function() {
    describe('test createSTTunnelWithoutId ', function() {
        it('should be able to ', function() {
            stub(Queue).getUniqueId.returns("uuid")

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

    describe('test message pushing using createSTTunnel ', function() {
        it('should be able to add message in single STTunnel', function() {
            let myUUID = "myUUID"
            let callbackFunction = () => {};
            let writeableMessage = new WriteableMessage(
                {...data},
                callbackFunction,
                2
            );

            let multiLevelQueue = new Queue();

            let tunnelCreated = multiLevelQueue.createSTTunnelWithId(
                processorFunction,
                myUUID
            );

            let expectedMessage = new ReadOnlyMessage(
                callbackFunction,
                {...data},
                2,
                tunnelCreated.getTunnelId(),
                writeableMessage.getMessageId()
            )

            let readOnlyMessage = multiLevelQueue.offerMessage(
                writeableMessage,
                tunnelCreated
            );

            expect(readOnlyMessage).excluding("_callbackFunction").to.deep.equals(expectedMessage);
            expect(tunnelCreated.containsMessageWithId(expectedMessage.getMessageId())).to.be.true;
            expect(tunnelCreated.containsMessageWithId(expectedMessage.getMessageId()+"x")).to.be.false;
            expect(tunnelCreated.getMessageCopyWithId(expectedMessage.getMessageId()))
                .excluding("_callbackFunction")
                .to.deep.equal(expectedMessage);
            expect(() => tunnelCreated.getMessageCopyWithId(expectedMessage.getMessageId()+"x"))
                .to.throw(Error).with.property("message",NO_MESSAGE_FOUND_WITH_ID);

            let polledMessage = tunnelCreated.pollMessage();
            expect(polledMessage).excluding("_callbackFunction").to.deep.equals(expectedMessage);
            expect(tunnelCreated.isEmpty()).to.be.true


        });
    });

});
