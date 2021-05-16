import ReadOnlyMessage from "../../src/Messages/ReadOnlyMessage";
import Message from "../../src/Messages/Message";
import {describe,it} from "mocha"
import * as chai from "chai";
import chaiExclude from 'chai-exclude';
import Queue from "../../src/Queue";
import {NO_CONDITIONAL_TUNNEL_FOUND_MESSAGE} from "../../src/Utils/const";
import Tunnel from "../../src/interfaces/Tunnel";

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

let processorFunction = async (message: ReadOnlyMessage) => {
    let extractedData = message.getData();
    extractedData["processed"] = true;
    return new ReadOnlyMessage(message);
}

let preProcessorFunction = (message: ReadOnlyMessage) => {
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

let reshuffleArray = (arr: Array<any>) => {

    for(let i = arr.length-1; i > 0; i--){
        let randomIndex = Math.round(Math.random() * (i));

        let temp = arr[i];
        arr[i] = arr[randomIndex];
        arr[randomIndex] = temp;

    }

}


export default  () => {
    describe('test create ConditionalTunnel ', function () {
        it('should be able to add WritableMessage according to condition', function () {

            let multilevelQueue = new Queue();

            let conditionalTunnel1 = multilevelQueue.createConditionalTunnel(
                matcherFunction1,
                processorFunction,
                false
            );

            let conditionalTunnel2 = multilevelQueue.createConditionalTunnel(
                matcherFunction2,
                processorFunction,
                false
            );

            let writableMessage1 = new Message(
                data1,
                () => {
                },
                2
            )

            let writableMessage2 = new Message(
                data2,
                () => {
                },
                2
            )

            multilevelQueue.offer(writableMessage1);
            multilevelQueue.offer(writableMessage2);

            expect(writableMessage1.getTunnelId()).to.equal(conditionalTunnel1.getTunnelId());
            expect(writableMessage2.getTunnelId()).to.equal(conditionalTunnel2.getTunnelId());
            expect(conditionalTunnel1.containsMessageWithId(writableMessage1.getMessageId())).to.be.true;
            expect(conditionalTunnel1.containsMessageWithId(writableMessage2.getMessageId())).to.be.false;
            expect(conditionalTunnel2.containsMessageWithId(writableMessage2.getMessageId())).to.be.true;
            expect(conditionalTunnel2.containsMessageWithId(writableMessage1.getMessageId())).to.be.false;

            expect(conditionalTunnel1.getMessagesWithId(writableMessage1.getMessageId()))
                .excluding("_callbackFunction")
                .to.deep.equal([writableMessage1.createNewReadOnlyMessage()]);
            expect(conditionalTunnel2.getMessagesWithId(writableMessage2.getMessageId()))
                .excluding("_callbackFunction")
                .to.deep.equal([writableMessage2.createNewReadOnlyMessage()]);

            let polledMessage1 = conditionalTunnel1.pollMessage();
            let polledMessage2 = conditionalTunnel2.pollMessage();

            expect(polledMessage1).excluding("_callbackFunction").to.deep.equals(writableMessage1.createNewReadOnlyMessage());
            expect(polledMessage2).excluding("_callbackFunction").to.deep.equals(writableMessage2.createNewReadOnlyMessage());


        });

        it('should error if no matching tunnel is found for a message', function () {

            let multilevelQueue = new Queue();

            let conditionalTunnel1 = multilevelQueue.createConditionalTunnel(
                matcherFunction1,
                processorFunction,
                false
            );


            let writableMessage1 = new Message(
                data1,
                () => {
                },
                2
            )

            let writableMessage2 = new Message(
                data2,
                () => {
                },
                2
            )

            multilevelQueue.offer(writableMessage1);
            expect(() => multilevelQueue.offer(writableMessage2)).to.throw(Error).with.property("message", NO_CONDITIONAL_TUNNEL_FOUND_MESSAGE)

            expect(writableMessage1.getTunnelId()).to.equal(conditionalTunnel1.getTunnelId());
            expect(conditionalTunnel1.containsMessageWithId(writableMessage1.getMessageId())).to.be.true;
            expect(conditionalTunnel1.containsMessageWithId(writableMessage2.getMessageId())).to.be.false;


            expect(conditionalTunnel1.getMessagesWithId(writableMessage1.getMessageId()))
                .excluding("_callbackFunction")
                .to.deep.equal([writableMessage1.createNewReadOnlyMessage()]);


            let polledMessage1 = conditionalTunnel1.pollMessage();

            expect(polledMessage1).excluding("_callbackFunction").to.deep.equals(writableMessage1.createNewReadOnlyMessage());


        });

    });


    describe('test create ConditionalTunnel multiple ', function () {
        it('should be able to push to tunnel only if condition matches', function () {

            let multilevelQueue = new Queue();

            let functionCreator = (tunnelId) => {
                return (message: ReadOnlyMessage) => {
                    let data = message.getData();
                    return data && data["tunnel"] && data["tunnel"] === tunnelId;
                };
            }

            let tunnels: Tunnel[] = [];
            let messages: Message[] = [];
            let tunnelMessageMap = {};

            for (let i = 1; i <= 20; i++) {
                let tunnelName = "tunnel" + i;
                let newMatcherFunction = functionCreator(tunnelName);
                let tunnel = multilevelQueue.createConditionalTunnel(
                    newMatcherFunction,
                    processorFunction,
                    false
                )
                tunnels.push(tunnel);
                let dataNew = {...data1};
                dataNew["tunnel"] = tunnelName;
                let message = new Message(
                    dataNew,
                    () => {
                    },
                    2
                );
                messages.push(message)
                tunnelMessageMap[tunnel.getTunnelId()] = message;
            }

            reshuffleArray(messages);

            for (let message of messages) {
                multilevelQueue.offer(message);
            }

            for (let tunnel of tunnels) {
                let message: Message = tunnelMessageMap[tunnel.getTunnelId()];
                expect(tunnel.containsMessageWithId(message.getMessageId())).to.be.true;
                expect(tunnel.getMessagesWithId(message.getMessageId())).to.deep.equals([message.createNewReadOnlyMessage()])
                expect(tunnel.getLength()).to.equal(1);
            }


        });
    });
}
