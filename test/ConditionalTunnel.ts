import ReadOnlyMessage from "../src/Messages/ReadOnlyMessage";
import Message from "../src/Messages/Message";
import {describe,it} from "mocha"
import * as chai from "chai";
import chaiExclude from 'chai-exclude';
import Queue from "../src/Queue";

chai.use(chaiExclude);

let expect = chai.expect;

let data1 = {
    userId: "lk3kj3kj3kj3k3jk3j",
    text: "Hello Testing",
    tunnel: "tunnel1"
}

let data2 = {
    userId: "lk3kj3kj3kj3k3jk3j",
    text: "Hello Testing",
    tunnel: "tunnel2"
}

let processorFunction = (message: ReadOnlyMessage) => {
    let extractedData = message.getData();
    extractedData["processed"] = true;
    return new ReadOnlyMessage(message);
}

let matcherFunction1 = (message: ReadOnlyMessage) => {
    let data = message.getData();
    return data && data["tunnel"] && data["tunnel"] === "tunnel1";
}

let matcherFunction2 = (message: ReadOnlyMessage) => {
    let data = message.getData();
    return data && data["tunnel"] && data["tunnel"] === "tunnel2";
}




describe('Test ConditionalTunnel', function() {
    describe('test create ConditionalTunnel ', function() {
        it('should be able to create writable WritableMessage', function() {

            let multilevelQueue = new Queue();

            let conditionalTunnel1 = multilevelQueue.createConditionalTunnel(
                matcherFunction1,
                processorFunction
            );

            let conditionalTunnel2 = multilevelQueue.createConditionalTunnel(
                matcherFunction2,
                processorFunction
            );

            let writableMessage1 = new Message(
                data1,
                () => {},
                2
            )

            let writableMessage2 = new Message(
                data2,
                () => {},
                2
            )

            multilevelQueue.offer(writableMessage1);
            multilevelQueue.offer(writableMessage2);

            expect(writableMessage1.getTunnelId()).to.equal(conditionalTunnel1.getTunnelId());
            expect(writableMessage2.getTunnelId()).to.equal(conditionalTunnel2.getTunnelId());

            let polledMessage1 = conditionalTunnel1.pollMessage();
            let polledMessage2 = conditionalTunnel2.pollMessage();

            expect(polledMessage1).excluding("_callbackFunction").to.deep.equals(writableMessage1.createNewReadOnlyMessage());
            expect(polledMessage2).excluding("_callbackFunction").to.deep.equals(writableMessage2.createNewReadOnlyMessage());


        });
    });
});
