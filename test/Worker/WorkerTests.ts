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

            let tunnelCreated1 = newMultiLevelQueue.createSTTunnelWithoutId(
                processorFunction
            );

            let tunnelCreated2 = newMultiLevelQueue.createSTTunnelWithoutId(
                processorFunction
            );

            tunnelCreated1.addMessage(
                new Message(
                    {...data},
                    (message) => console.log("callback message1 tunnel1",message),
                    2
                )
            )

            tunnelCreated1.addMessage(
                new Message(
                    {...data},
                    (message) => console.log("callback message2 tunnel1",message),
                    2
                )
            )

            tunnelCreated2.addMessage(
                new Message(
                    {...data},
                    (message) => console.log("callback message1 tunnel2",message),
                    2
                )
            )

            tunnelCreated2.addMessage(
                new Message(
                    {...data},
                    (message) => console.log("callback message2 tunnel2",message),
                    2
                )
            )
            // console.log(tunnelCreated1,tunnelCreated2)
            let worker = new Worker([tunnelCreated1,tunnelCreated2]);

            worker.dispatchAction();
            setTimeout(() => {
                worker.dispatchAction();
                done()
            },1000)

        });
    });

});
