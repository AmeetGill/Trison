import ReadOnlyMessage from "../../src/Messages/ReadOnlyMessage";
import Message from "../../src/Messages/Message";
import {describe,it} from "mocha"
import * as chai from "chai";
import chaiExclude from 'chai-exclude';
import Queue from "../../src/Queue";
import STTunnel from "../../src/tunnels/STTunnel";
import {createSandbox} from "sinon";
import Tunnel from "../../src/interfaces/Tunnel";
import {
    DUPLICATE_TUNNEL_MESSAGE,
    EMPTY_TUNNEL,
    NO_MESSAGE_FOUND_WITH_ID,
    UNDEFINED_MESSAGE
} from "../../src/Utils/const";
import UUID from "../../src/Utils/UUID";

chai.use(chaiExclude);
let sandbox = createSandbox()
let expect = chai.expect;

let data = {
    userId: "lk3kj3kj3kj3k3jk3j",
    text: "Hello Testing"
}


let processorFunction = (message: ReadOnlyMessage) => {
    let extractedData = message.getData();
    extractedData["processed"] = true;
    return new ReadOnlyMessage(message);

}

export default () => {
    describe('test createSTTunnelWithoutId ', function() {
        it('should be able to ', function() {
            let stubbed = sandbox.stub(UUID).generate.returns("uuid")

            let newMultiLevelQueue = new Queue();

            let tunnelCreated = newMultiLevelQueue.createSTTunnelWithoutId(
                processorFunction,
                false
            );

            let expectedTunnel: Tunnel = new STTunnel(
                processorFunction,
              "uuid"
            );

            expect(tunnelCreated).to.deep.equal(expectedTunnel)
            expect(newMultiLevelQueue.containsTunnelWithId("uuid")).to.true;
            expect(newMultiLevelQueue.containsTunnelWithId("uuid1")).to.false;

            stubbed.restore();

        });
    });

    describe('test addMessage for undefined message ', function() {
        it('should throw error if undefined message is passed', function() {

            let newMultiLevelQueue = new Queue();

            let tunnelCreated = newMultiLevelQueue.createSTTunnelWithoutId(
                processorFunction,
                false
            );

            expect(() => tunnelCreated.addMessage(undefined)).to.throw(Error).with.property("message",UNDEFINED_MESSAGE)

        });
    });

    describe('test empty tunnel poll message ', function() {
        it('should throw error if polling is done on empty tunnel', function() {

            let newMultiLevelQueue = new Queue();

            let tunnelCreated = newMultiLevelQueue.createSTTunnelWithoutId(
                processorFunction,
                false
            );

            expect(() => tunnelCreated.pollMessage()).to.throw(Error).with.property("message",EMPTY_TUNNEL)

        });
    });

    describe('test createSTTunnelWithId ', function() {
        it('should be able to ', function() {
            let myUUID = "myUUID"
            let newMultiLevelQueue = new Queue();

            let tunnelCreated = newMultiLevelQueue.createSTTunnelWithId(
                processorFunction,
                myUUID,
                false
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
                myUUID,
                false
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
                myUUID,
                false
            )).to.throw(Error).with.property("message",DUPLICATE_TUNNEL_MESSAGE)

            let newUUID = "myUUID2";

            newMultiLevelQueue.createSTTunnelWithId(
                processorFunction,
                newUUID,
                false
            );

            expect(newMultiLevelQueue.containsTunnelWithId(newUUID)).to.true;

        });
    });

    describe('test message pushing using createSTTunnel ', function() {
        it('should be able to add message in single STTunnel', function() {
            let myUUID = "myUUID"
            let callbackFunction = () => {};
            let writeableMessage = new Message(
                {...data},
                callbackFunction,
                2
            );

            let expectedMessage1 = new Message(
                {...data},
                callbackFunction,
                2
            );


            let multiLevelQueue = new Queue();

            let tunnelCreated = multiLevelQueue.createSTTunnelWithId(
                processorFunction,
                myUUID,
                false
            );

            expectedMessage1.setTunnelId(tunnelCreated.getTunnelId());

            let expectedMessage = expectedMessage1.createNewReadOnlyMessage()

            let readOnlyMessage = multiLevelQueue.offerMessage(
                writeableMessage,
                tunnelCreated
            );

            expect(readOnlyMessage).excluding(["_callbackFunction","_messageId"]).to.deep.equals(expectedMessage);
            expect(tunnelCreated.containsMessageWithId(readOnlyMessage.getMessageId())).to.be.true;
            expect(tunnelCreated.getMessagesWithId(readOnlyMessage.getMessageId()))
                .excluding(["_callbackFunction","_messageId"])
                .to.deep.equal([expectedMessage]);
            expect(() => tunnelCreated.getMessagesWithId(expectedMessage.getMessageId() + "x"))
                .to.throw(Error).with.property("message",NO_MESSAGE_FOUND_WITH_ID);

            let polledMessage = tunnelCreated.pollMessage();
            expect(polledMessage).excluding(["_callbackFunction","_messageId"]).to.deep.equals(expectedMessage);
            expect(tunnelCreated.isEmpty()).to.be.true


        });
    });

    describe('test message immutability using createSTTunnel ', function() {
        it('should not be able to add message in single STTunnel', function() {
            let myUUID = "myUUID"
            let callbackFunction = () => {};
            let writeableMessage = new Message(
                {...data},
                callbackFunction,
                2
            );

            let expectedMessage1 = new Message(
                {...data},
                callbackFunction,
                2
            );


            let multiLevelQueue = new Queue();

            let tunnelCreated = multiLevelQueue.createSTTunnelWithId(
                processorFunction,
                myUUID,
                false
            );

            expectedMessage1.setTunnelId(tunnelCreated.getTunnelId());

            let expectedMessage = expectedMessage1.createNewReadOnlyMessage()

            let readOnlyMessage = multiLevelQueue.offerMessage(
                writeableMessage,
                tunnelCreated
            );

            readOnlyMessage.getData()["changes"] = true;

            expect(readOnlyMessage).excluding(["_callbackFunction","_messageId"]).to.not.deep.equals(expectedMessage);

            let polledMessage = tunnelCreated.pollMessage();
            expect(polledMessage).excluding(["_callbackFunction","_messageId"]).to.deep.equals(expectedMessage);
            expect(tunnelCreated.isEmpty()).to.be.true


        });
    });

    describe('test message pushing using createSTTunnel ', function() {
        it('should be able to add same message again in single STTunnel', function() {
            let myUUID = "myUUID"
            let callbackFunction = () => {};
            let writeableMessage = new Message(
                {...data},
                callbackFunction,
                2
            );

            let expectedMessage1 = new Message(
                {...data},
                callbackFunction,
                2
            );


            let multiLevelQueue = new Queue();

            let tunnelCreated = multiLevelQueue.createSTTunnelWithId(
                processorFunction,
                myUUID,
                false
            );

            expectedMessage1.setTunnelId(tunnelCreated.getTunnelId());

            let expectedMessage = expectedMessage1.createNewReadOnlyMessage()

            let readOnlyMessage = multiLevelQueue.offerMessage(
                writeableMessage,
                tunnelCreated
            );

            multiLevelQueue.offerMessage(
                writeableMessage,
                tunnelCreated
            );

            expect(readOnlyMessage).excluding(["_callbackFunction","_messageId"]).to.deep.equals(expectedMessage);
            expect(tunnelCreated.containsMessageWithId(readOnlyMessage.getMessageId())).to.be.true;
            expect(tunnelCreated.getMessagesWithId(readOnlyMessage.getMessageId()))
                .excluding(["_callbackFunction","_messageId"])
                .to.deep.equal([expectedMessage,expectedMessage]);
            expect(() => tunnelCreated.getMessagesWithId(expectedMessage.getMessageId() + "x"))
                .to.throw(Error).with.property("message",NO_MESSAGE_FOUND_WITH_ID);

            let polledMessage = tunnelCreated.pollMessage();
            let polledMessage2 = tunnelCreated.pollMessage();
            expect(polledMessage).excluding(["_callbackFunction","_messageId"]).to.deep.equals(expectedMessage);
            expect(polledMessage2).excluding(["_callbackFunction","_messageId"]).to.deep.equals(expectedMessage);
            expect(tunnelCreated.isEmpty()).to.be.true


        });
    });

};
