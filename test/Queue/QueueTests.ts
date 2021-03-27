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


let processorFunction = (message: ReadOnlyMessage) => {
    let extractedData = message.getData();
    extractedData["processed"] = true;
    return new ReadOnlyMessage(message);

}

export default () => {
    describe('test containsTunnel ', function() {
        it('should return true if tunnel is present in the queue ', function() {

            let newMultiLevelQueue = new Queue();

            let tunnelCreated = newMultiLevelQueue.createSTTunnelWithId(
                processorFunction,
                "uuid"
            );

            let expectedTunnel: Tunnel = new STTunnel(
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
                "uuid"
            );

            let expectedTunnel: Tunnel = new STTunnel(
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
                "uuid"
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
        it('should throw error if tunnel is not present in the queue ', function() {

            let newMultiLevelQueue = new Queue();

            newMultiLevelQueue.createSTTunnelWithId(
                processorFunction,
                "uuid"
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

};
