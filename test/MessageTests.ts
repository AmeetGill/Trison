import ReadOnlyMessage from "../src/Messages/ReadOnlyMessage";
import Message from "../src/Messages/Message";
import {describe,it} from "mocha"
import * as chai from "chai";
import {stub} from "sinon";
import Tunnel from "../src/interfaces/Tunnel";
import {
    DUPLICATE_TUNNEL_MESSAGE,
    ERROR_DELIM, INVALID_MESSAGE_CALLBACK, INVALID_MESSAGE_DATA, INVALID_MESSAGE_PRIORITY,
    INVALID_MESSAGE_PROPERTY, INVALID_TUNNEL_ID,
    NO_MESSAGE_FOUND_WITH_ID
} from "../src/Utils/const";
import UUID from "../src/Utils/UUID";

let expect = chai.expect;

let data = {
    userId: "lk3kj3kj3kj3k3jk3j",
    text: "Hello Testing"
}


describe('Test messages', function() {
    describe('test create WritableMessage ', function() {
        it('should be able to create writable WritableMessage', function() {
            // let messageId1 = "messageId1";
            // let messageId2 = "messageId2";

            // stub(UUID).generate.onFirstCall().returns(messageId1).onSecondCall().returns(messageId2);

            let writeableMessage1 = new Message(
                {...data},
                () => {},
                2
            )

            // expect(writeableMessage1.getMessageId()).equal(messageId1);
            expect(writeableMessage1.getData()).to.deep.equals(data);

            let writeableMessage2 = new Message(
                {...data},
                () => {},
                2
            )

            // expect(writeableMessage2.getMessageId()).equal(messageId2);
            expect(writeableMessage2.getData()).to.deep.equals(data);

        });
    });

    describe('test invalid tunnelId in WritableMessage ', function() {
        it('should be able to throw error on invalid tunnelId', function() {

            let tunnelId = "tunnelid";

            let writeableMessage1 = new Message(
                {...data},
                () => {},
                2
            )

            expect(() => writeableMessage1.setTunnelId(null)).to.throw(Error).with.property("message",INVALID_TUNNEL_ID)
            expect(() => writeableMessage1.setTunnelId(undefined)).to.throw(Error).with.property("message",INVALID_TUNNEL_ID)

            expect(() => writeableMessage1.setTunnelId(tunnelId)).to.not.throw;
            writeableMessage1.setTunnelId(tunnelId)
            expect(writeableMessage1.getTunnelId()).to.equals(tunnelId)

        });
    });

    describe('test invalid create WritableMessage ', function() {
        it('should throw error on invalid data', function() {
            expect(() => new Message(
                null,
                () => {},
                2
            )).to.throw(Error).with.property("message",INVALID_MESSAGE_PROPERTY+ERROR_DELIM+INVALID_MESSAGE_DATA)

            expect(() => new Message(
                undefined,
                () => {},
                2
            )).to.throw(Error).with.property("message",INVALID_MESSAGE_PROPERTY+ERROR_DELIM+INVALID_MESSAGE_DATA)

            expect(() => new Message(
                {},
                () => {},
                2
            )).to.not.throw

            expect(() => new Message(
                { hello : 0},
                () => {},
                2
            )).to.not.throw

        });

        it('should throw error on invalid callback', function() {
            expect(() => new Message(
                {...data},
                null,
                2
            )).to.throw(Error).with.property("message",INVALID_MESSAGE_PROPERTY+ERROR_DELIM+INVALID_MESSAGE_CALLBACK)

            expect(() => new Message(
                {...data},
                undefined,
                2
            )).to.throw(Error).with.property("message",INVALID_MESSAGE_PROPERTY+ERROR_DELIM+INVALID_MESSAGE_CALLBACK)

            expect(() => new Message(
                {...data},
                () => {},
                2
            )).to.not.throw

        });

        it('should throw error on invalid priority', function() {
            expect(() => new Message(
                {...data},
                () => {},
                null
            )).to.throw(Error).with.property("message",INVALID_MESSAGE_PROPERTY+ERROR_DELIM+INVALID_MESSAGE_PRIORITY)

            expect(() => new Message(
                {...data},
                () => {},
                undefined
            )).to.throw(Error).with.property("message",INVALID_MESSAGE_PROPERTY+ERROR_DELIM+INVALID_MESSAGE_PRIORITY)

            expect(() => new Message(
                {...data},
                () => {},
                -1
            )).to.throw(Error).with.property("message",INVALID_MESSAGE_PROPERTY+ERROR_DELIM+INVALID_MESSAGE_PRIORITY)

            expect(() => new Message(
                {...data},
                () => {},
                101
            )).to.throw(Error).with.property("message",INVALID_MESSAGE_PROPERTY+ERROR_DELIM+INVALID_MESSAGE_PRIORITY)

            expect(() => new Message(
                {...data},
                () => {},
                2
            )).to.not.throw

        });
    });

    describe('test un-mutable WritableMessage ', function() {
        it('should be able to clone WritableMessage change not affecting one another', function() {

            let writeableMessage1 = new Message(
                {...data},
                () => {},
                2
            );

            let clonedWriteableMessage = writeableMessage1.clone();

            expect(writeableMessage1.getMessageId()).to.not.equal(clonedWriteableMessage.getMessageId());
            expect(writeableMessage1.getData()).to.deep.equals(clonedWriteableMessage.getData());


            writeableMessage1.getData()["userId"] = "userid1"
            clonedWriteableMessage.getData()["userId"] = "userid2"

            expect(writeableMessage1.getData()).to.not.deep.equals(clonedWriteableMessage.getData());

            writeableMessage1.getData()["newProperty"] = "new1"
            clonedWriteableMessage.getData()["newProperty"] = "new2"

            expect(writeableMessage1.getData()).to.not.deep.equals(clonedWriteableMessage.getData());


        });
    });

    describe('test created ReadableMessage from WriteableMessage ', function() {
        it('should be able to create ReadableMessage', function() {

            let writeableMessage1 = new Message(
                {...data},
                () => {},
                2
            );

            let createdReadonlyMessage = writeableMessage1.createNewReadOnlyMessage();

            expect(writeableMessage1.getMessageId()).to.equal(createdReadonlyMessage.getMessageId());
            expect(writeableMessage1.getData()).to.deep.equals(createdReadonlyMessage.getData());


            writeableMessage1.getData()["userId"] = "userid1"
            createdReadonlyMessage.getData()["userId"] = "userid2"

            expect(writeableMessage1.getData()).to.not.deep.equals(createdReadonlyMessage.getData());

            writeableMessage1.getData()["newProperty"] = "new1"
            createdReadonlyMessage.getData()["newProperty"] = "new2"

            expect(writeableMessage1.getData()).to.not.deep.equals(createdReadonlyMessage.getData());


        });
    });

    describe('test created ReadableMessage using Writeable Message ', function() {
        it('should be able to create ReadableMessage', function() {

            let writeableMessage1 = new Message(
                {...data},
                () => {},
                2
            );

            let createdReadonlyMessage = new ReadOnlyMessage(writeableMessage1);

            expect(writeableMessage1.getMessageId()).to.equal(createdReadonlyMessage.getMessageId());
            expect(writeableMessage1.getData()).to.deep.equals(createdReadonlyMessage.getData());


            writeableMessage1.getData()["userId"] = "userid1"
            createdReadonlyMessage.getData()["userId"] = "userid2"

            expect(writeableMessage1.getData()).to.not.deep.equals(createdReadonlyMessage.getData());

            writeableMessage1.getData()["newProperty"] = "new1"
            createdReadonlyMessage.getData()["newProperty"] = "new2"

            expect(writeableMessage1.getData()).to.not.deep.equals(createdReadonlyMessage.getData());


        });
    });


});
