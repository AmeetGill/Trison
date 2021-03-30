import ReadOnlyMessage from "../../src/Messages/ReadOnlyMessage";
import Message from "../../src/Messages/Message";
import {describe,it} from "mocha"
import * as chai from "chai";
import chaiExclude from 'chai-exclude';
import Queue from "../../src/Queue";
import {createSandbox} from "sinon";
import Worker from "../../src/Workers/Worker";

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
describe("Pistol Tests", () => {
// export default () => {
    describe('test Worker ', function() {
        it('should start processing message ', function(done) {

            let newMultiLevelQueue = new Queue();

            let processedByTunnel1: string[] = [];
            let processedByTunnel2: string[] = [];

            let tunnelCreated1 = newMultiLevelQueue.createSTTunnelWithoutId(
                processorFunction
            );

            let tunnelCreated2 = newMultiLevelQueue.createSTTunnelWithoutId(
                processorFunction
            );

            let message1Tunnel1 =  new Message(
                {...data},
                (message) => {
                    processedByTunnel1.push(message.getMessageId());
                },
                2
            );

            let message2Tunnel1 = message1Tunnel1.clone.complete()

            let message1Tunnel2 = message1Tunnel1.clone.with.different.callbackFunction((message) => {
                processedByTunnel2.push(message.getMessageId())
            })

            let message2Tunnel2 = message1Tunnel2.clone.complete()


            tunnelCreated1.addMessage(message1Tunnel1)

            tunnelCreated2.addMessage(message2Tunnel1)

            tunnelCreated2.addMessage(message1Tunnel2)

            tunnelCreated2.addMessage(message2Tunnel1);
            // console.log(tunnelCreated1,tunnelCreated2)

            let expectedMessageOrder1: string[] = [message1Tunnel1.getMessageId(),message2Tunnel1.getMessageId()];
            let expectedMessageOrder2: string[] = [message1Tunnel2.getMessageId(),message2Tunnel2.getMessageId()];

            let worker = new Worker([tunnelCreated1,tunnelCreated2]);

            setTimeout(() => {
                worker.dispatchAction();
                console.log(processedByTunnel2);
                console.log(processedByTunnel1);
            },500)

            setTimeout(() => {
                worker.dispatchAction();
                console.log(processedByTunnel2);
                console.log(processedByTunnel1)
                done()
            },1800)



        });
    });

});
