import ReadOnlyMessage from "../../src/Messages/ReadOnlyMessage";
import Message from "../../src/Messages/Message";
import {describe,it} from "mocha"
import * as chai from "chai";
import chaiExclude from 'chai-exclude';
import Queue from "../../src/Queue";
import {createSandbox} from "sinon";
import Worker from "../../src/Workers/Worker";
import STTunnel from "../../src/tunnels/STTunnel";

chai.use(chaiExclude);
let sandbox = createSandbox()
let expect = chai.expect;

let data = {
    userId: "lk3kj3kj3kj3k3jk3j",
    text: "Hello Testing"
}


let processorFunction = async (message: ReadOnlyMessage) => {
    let extractedData = message.getData();
    extractedData["processed"] = true;
    return message.clone();
}

let preProcessorFunction = (message: ReadOnlyMessage) => {
    let extractedData = message.getData();
    extractedData["processed"] = true;
    return message.clone();
}
export default () => {
// export default () => {
    describe('test Workers parallel Same number of messages', function() {
        it('should process message  ', function(done) {

            let newMultiLevelQueue = new Queue();

            let processedByTunnel1: string[] = [];
            let processedByTunnel2: string[] = [];

            let tunnelCreated1 =  newMultiLevelQueue.createSTTunnelWithId(
                processorFunction,
                "tunnel1",
                true
            )

            let tunnelCreated2 = newMultiLevelQueue.createSTTunnelWithId(
                processorFunction,
                "tunnel2",
                true
            )


            let message1Tunnel1 =  new Message(
                {...data},
                (message) => {
                    processedByTunnel1.push(message.getMessageId());
                },
                2
            );

            let message2Tunnel1 = message1Tunnel1.clone.complete();

            let message1Tunnel2 = message1Tunnel1.clone.with.different.callbackFunction((message) => {
                processedByTunnel2.push(message.getMessageId())
            })

            let message2Tunnel2 = message1Tunnel2.clone.complete()

            let expectedMessageOrder1: string[] = [message1Tunnel1.getMessageId(),message2Tunnel1.getMessageId()];
            let expectedMessageOrder2: string[] = [message1Tunnel2.getMessageId(),message2Tunnel2.getMessageId()];

            let message3Tunnel2 = message2Tunnel2.clone.with.different.callbackFunction((message) => {
                // this will throw an error if expect fails, which will be catched in promise rejection
                expect(processedByTunnel2).to.deep.equals(expectedMessageOrder2);
                expect(expectedMessageOrder1).to.deep.equals(processedByTunnel1);
                done()
            })


            tunnelCreated1.addMessage(message1Tunnel1)

            tunnelCreated1.addMessage(message2Tunnel1)

            tunnelCreated2.addMessage(message1Tunnel2)

            tunnelCreated2.addMessage(message2Tunnel2);
            tunnelCreated2.addMessage(message3Tunnel2);

            // console.log(tunnelCreated1,tunnelCreated2)




        });
    });

    describe('test Workers parallel different number of messages  ', function() {
        it('should start processing message ', function(done) {

            let newMultiLevelQueue = new Queue();

            let processedByTunnel1: string[] = [];
            let processedByTunnel2: string[] = [];

            let tunnelCreated1 =  newMultiLevelQueue.createSTTunnelWithId(
                processorFunction,
                "tunnel1",
                true
            )

            let tunnelCreated2 = newMultiLevelQueue.createSTTunnelWithId(
                processorFunction,
                "tunnel2",
                true
            )


            let message1Tunnel1 =  new Message(
                {...data},
                (message) => {
                    processedByTunnel1.push(message.getMessageId());
                },
                2
            );

            let message2Tunnel1 = message1Tunnel1.clone.complete();

            let message1Tunnel2 = message1Tunnel1.clone.with.different.callbackFunction((message) => {
                processedByTunnel2.push(message.getMessageId())
            })

            let message2Tunnel2 = message1Tunnel2.clone.complete()

            let expectedMessageOrder1: string[] = [message1Tunnel1.getMessageId(),message2Tunnel1.getMessageId()];
            let expectedMessageOrder2: string[] = [message1Tunnel2.getMessageId()];

            let message3Tunnel2 = message2Tunnel2.clone.with.different.callbackFunction((message) => {
                // this will throw an error if expect fails, which will be catched in promise rejection
                expect(processedByTunnel2).to.deep.equals(expectedMessageOrder2);
                expect(expectedMessageOrder1).to.deep.equals(processedByTunnel1);
                done()
            })


            tunnelCreated1.addMessage(message1Tunnel1)

            tunnelCreated1.addMessage(message2Tunnel1)

            tunnelCreated2.addMessage(message1Tunnel2)

            tunnelCreated2.addMessage(message3Tunnel2);

            // console.log(tunnelCreated1,tunnelCreated2)




        });
    });

    describe('test Workers Single Queue ', function() {
        it('should start processing message ', function(done) {

            let newMultiLevelQueue = new Queue();

            let processedByTunnel1: string[] = [];
            let processedByTunnel2: string[] = [];

            let tunnelCreated1 =  newMultiLevelQueue.createSTTunnelWithId(
                processorFunction,
                "tunnel1",
                true
            )


            let message1Tunnel1 =  new Message(
                {...data},
                (message) => {
                    processedByTunnel1.push(message.getMessageId());
                },
                2
            );

            let message2Tunnel1 = message1Tunnel1.clone.complete();

            let message1Tunnel2 = message1Tunnel1.clone.with.different.callbackFunction((message) => {
                processedByTunnel2.push(message.getMessageId())
            })

            let expectedMessageOrder1: string[] = [message1Tunnel1.getMessageId(),message2Tunnel1.getMessageId()];

            let message3Tunnel2 = message1Tunnel2.clone.with.different.callbackFunction((message) => {
                // this will throw an error if expect fails, which will be catched in promise rejection
                expect(expectedMessageOrder1).to.deep.equals(processedByTunnel1);
                done()
            })


            tunnelCreated1.addMessage(message1Tunnel1)

            tunnelCreated1.addMessage(message2Tunnel1)

            tunnelCreated1.addMessage(message3Tunnel2);

            // console.log(tunnelCreated1,tunnelCreated2)




        });
    });

    describe('test Workers Single Queue ', function() {
        it('should start processing message ', function(done) {

            let newMultiLevelQueue = new Queue();

            let processedByTunnel1: string[] = [];
            let processedByTunnel2: string[] = [];

            let tunnelCreated1 =  newMultiLevelQueue.createSTTunnelWithId(
                processorFunction,
                "tunnel1",
                true
            )


            let message1Tunnel1 =  new Message(
                {...data},
                (message) => {
                    processedByTunnel1.push(message.getMessageId());
                },
                2
            );

            let message2Tunnel1 = message1Tunnel1.clone.complete();

            let message1Tunnel2 = message1Tunnel1.clone.with.different.callbackFunction((message) => {
                processedByTunnel2.push(message.getMessageId())
            })

            let expectedMessageOrder1: string[] = [message1Tunnel1.getMessageId(),message2Tunnel1.getMessageId()];

            let message3Tunnel2 = message1Tunnel2.clone.with.different.callbackFunction((message) => {
                // this will throw an error if expect fails, which will be catched in promise rejection
                expect(expectedMessageOrder1).to.deep.equals(processedByTunnel1);
                done()
            })


            tunnelCreated1.addMessage(message1Tunnel1)

            tunnelCreated1.addMessage(message2Tunnel1)

            tunnelCreated1.addMessage(message3Tunnel2);

            // console.log(tunnelCreated1,tunnelCreated2)




        });
    });

};
