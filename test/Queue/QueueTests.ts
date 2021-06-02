import ReadOnlyMessage from "../../src/Messages/ReadOnlyMessage";
import Message from "../../src/Messages/Message";
import {describe,it} from "mocha"
import * as chai from "chai";
import chaiExclude from 'chai-exclude';
import Queue from "../../src/Queue";
import STTunnel from "../../src/tunnels/STTunnel";
import {createSandbox} from "sinon";
import Tunnel from "../../src/interfaces/Tunnel";
import {NO_TUNNEL_FOUND, NO_TUNNEL_FOUND_WITH_ID_MESSAGE} from "../../src/Utils/const";

chai.use(chaiExclude);
let sandbox = createSandbox()
let expect = chai.expect;

let data = {
    userId: "lk3kj3kj3kj3k3jk3j",
    text: "Hello Testing"
}


let processorFunction = async (message: ReadOnlyMessage<object>) => {
    let extractedData = message.getData();
    extractedData["processed"] = true;
    return new ReadOnlyMessage(message);

}

let preProcessorFunction = (message: ReadOnlyMessage<object>) => {
    let extractedData: object = message.getData();
    extractedData["processed"] = true;
    return new ReadOnlyMessage(message);
}

let matcherFunction1 = (message: ReadOnlyMessage<object>) => {
    let data = message.getData();
    return data && data["tunnel"] && data["tunnel"] === "tunnel1";
}

export default () => {
    describe('test containsTunnel ', function() {
        it('should return true if tunnel is present in the queue ', function() {

            let newMultiLevelQueue = new Queue();

            let tunnelCreated = newMultiLevelQueue.createSTTunnelWithId(
                processorFunction,
                "uuid",
                false
            );

            let expectedTunnel: Tunnel<object> = new STTunnel(
                processorFunction,
                "uuid"
            );

            expect(tunnelCreated).to.deep.equal(expectedTunnel)
            expect(newMultiLevelQueue.containsTunnel(tunnelCreated)).to.be.true;
            expect(newMultiLevelQueue.containsTunnel(expectedTunnel)).to.false;

        });
    });

    describe('test offerMessage with non existent tunnel ', function() {
        it('should throw error if tunnel is not present in the queue ', function() {

            let newMultiLevelQueue = new Queue();

            let tunnelCreated = newMultiLevelQueue.createSTTunnelWithId(
                processorFunction,
                "uuid",
                false
            );

            let expectedTunnel: Tunnel<object> = new STTunnel(
                processorFunction,
                "uuid"
            );

            expect(tunnelCreated).to.deep.equal(expectedTunnel)
            let writeableMessage = new Message(
                {...data},
                () => {},
                2
            );
            expect(() => {
                newMultiLevelQueue.offerMessage(
                    writeableMessage,
                    expectedTunnel
                )
            }).to.throw(Error).with.property("message",NO_TUNNEL_FOUND)

            expect(() => {
                newMultiLevelQueue.offerMessage(
                    writeableMessage,
                    tunnelCreated
                )
            }).to.not.throw;

        });
    });

    describe('test offerMessage with tunnel Id ', function() {
        it('should throw error if tunnel is not present in the queue ', function() {

            let newMultiLevelQueue = new Queue();

            newMultiLevelQueue.createSTTunnelWithId(
                processorFunction,
                "uuid",
                false
            );

            let writeableMessage = new Message(
                {...data},
                () => {},
                2
            );
            expect(() => {
                newMultiLevelQueue.offerMessageForTunnelId(
                    writeableMessage,
                    "expectedTunnel"
                )
            }).to.throw(Error).with.property("message",NO_TUNNEL_FOUND)

            let readOnlyMessage = newMultiLevelQueue.offerMessageForTunnelId(
                writeableMessage,
                "uuid"
            )

            expect(readOnlyMessage).excluding(["_messageId","_callbackFunction"]).to.deep.equals(writeableMessage.createNewReadOnlyMessage())

        });
    });

    describe('test createTunnelsWithPreprocessor with tunnel Id ', function() {
        it('should preprocess a message if preprocessor is provided to the tunnel ', function () {

            let newMultiLevelQueue = new Queue();

            let tunnel = newMultiLevelQueue.createSTTunnelWithPreProcessor(
                processorFunction,
                "uuid",
                preProcessorFunction,
                false
            );

            let message = new Message(
                {...data},
                () => {
                },
                2
            )
            newMultiLevelQueue.offerMessageForTunnelId(message, "uuid");
            let expectedPreProcessed = preProcessorFunction(message.createNewReadOnlyMessage());
            let polledMessage = newMultiLevelQueue.poll(tunnel.getTunnelId());

            expect(polledMessage).excluding("_callbackFunction").to.deep.equals(expectedPreProcessed);
            expect(polledMessage).excluding("_callbackFunction").to.not.deep.equals(message.createNewReadOnlyMessage());


        });
    });

    describe('test createConditionalTunnelsWithPreprocessor with tunnel Id ', function() {
        it('should preprocess a message if preprocessor is provided to the conditional tunnel ', function() {

            let newMultiLevelQueue = new Queue();

            let tunnel = newMultiLevelQueue.createConditionalTunnelWithPreProcessor(
                matcherFunction1,
                processorFunction,
                preProcessorFunction,
                false
            );

            let message = new Message(
                {...data},
                () => {},
                2
            )
            newMultiLevelQueue.offerMessageForTunnelId(message,tunnel.getTunnelId());
            let expectedPreProcessed = preProcessorFunction(message.createNewReadOnlyMessage());
            let polledMessage = newMultiLevelQueue.poll(tunnel.getTunnelId());

            expect(polledMessage).excluding("_callbackFunction").to.deep.equals(expectedPreProcessed);
            expect(polledMessage).excluding("_callbackFunction").to.not.equals(message.createNewReadOnlyMessage());

        });
    });

    describe('test remove tunnel with tunnel Id ', function() {
        it('should remove a tunnel from Queue ', function() {

            let newMultiLevelQueue = new Queue();

            let tunnel = newMultiLevelQueue.createSTTunnelWithoutId(
                processorFunction,
                false
            );

           expect(newMultiLevelQueue.containsTunnel(tunnel)).to.be.true;
           expect(newMultiLevelQueue.containsTunnelWithId(tunnel.getTunnelId())).to.be.true;

            newMultiLevelQueue.removeTunnel(tunnel.getTunnelId());

            expect(newMultiLevelQueue.containsTunnel(tunnel)).to.be.false;
            expect(newMultiLevelQueue.containsTunnelWithId(tunnel.getTunnelId())).to.be.false;

        });
    });

    describe('test auto create tunnel ', function() {
        it('should create a tunnel with if tunnel doesnt exist in the Queue ', function() {

            let newMultiLevelQueue = new Queue(
                true,
                false,
                processorFunction
            );

            let message = new Message(
                {...data},
                () => {},
                2
            );

            newMultiLevelQueue.offerMessageForTunnelId(
                message,
                "expectedTunnel"
            )

            expect(newMultiLevelQueue.containsTunnelWithId("expectedTunnel")).to.be.true;

            let messagePolled = newMultiLevelQueue.poll("expectedTunnel");

            expect(messagePolled).excluding("_callbackFunction").to.deep.equals(message.createNewReadOnlyMessage());


        });
    });

};
