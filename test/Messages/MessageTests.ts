import ReadOnlyMessage from "../../src/Messages/ReadOnlyMessage";
import Message from "../../src/Messages/Message";
import {describe,it} from "mocha"
import * as chai from "chai";
import chaiExclude from 'chai-exclude';
import {stub,createSandbox} from "sinon";
import {
    ERROR_DELIM, INVALID_MESSAGE_CALLBACK, INVALID_MESSAGE_DATA, INVALID_MESSAGE_PRIORITY,
    INVALID_MESSAGE_PROPERTY, INVALID_TUNNEL_ID,
} from "../../src/Utils/const";
import UUID from "../../src/Utils/UUID";
chai.use(chaiExclude);

let expect = chai.expect;
let data = {
    userId: "lk3kj3kj3kj3k3jk3j",
    text: "Hello Testing"
}


export default () => {
    describe('test create WritableMessage ', function() {
        it('should be able to create WritableMessage', function() {
            let messageId1 = "messageId1";
            let messageId2 = "messageId2";

            let writeableMessage1 = new Message<object>(
                {...data},
                () => {},
                2
            )

            // expect(writeableMessage1.getMessageId()).equal(messageId1);
            expect(writeableMessage1.getData()).excluding(["_messageId"]).to.deep.equals(data);

            let writeableMessage2 = new Message<object>(
                {...data},
                () => {},
                2
            )

            // expect(writeableMessage2.getMessageId()).equal(messageId2);
            expect(writeableMessage2.getData()).excluding(["_messageId"]).to.deep.equals(data);

        });
    });

    // describe('test equals function of WritableMessage ', function() {
    //     it('should be able to compare two WritableMessage', function() {
    //
    //         stub(UUID).generate.returns("messageId1");
    //
    //         let writeableMessage1 = new Message(
    //             {...data},
    //             () => {},
    //             2
    //         )
    //
    //         let writeableMessage2 = new Message(
    //             {...data},
    //             () => {},
    //             2
    //         )
    //
    //         let writeableMessage3 = new Message(
    //             {...data},
    //             () => {},
    //             2
    //         )
    //
    //         expect(writeableMessage1.equals(writeableMessage2)).to.be.true
    //         expect(writeableMessage3.equals(writeableMessage2)).to.be.false
    //         expect(writeableMessage2.equals(writeableMessage3)).to.be.false
    //
    //
    //         let readableMessage1  = writeableMessage1.createNewReadOnlyMessage()
    //
    //         let readableMessage2 = writeableMessage2.createNewReadOnlyMessage()
    //
    //         let readableMessage3 = writeableMessage3.createNewReadOnlyMessage()
    //
    //         expect(readableMessage1.equals(readableMessage2)).to.be.true
    //         expect(readableMessage2.equals(readableMessage3)).to.be.false
    //         expect(readableMessage3.equals(readableMessage1)).to.be.false
    //
    //     });
    // });

    describe('test invalid tunnelId in WritableMessage ', function() {
        it('should be able to throw error on invalid tunnelId', function() {

            let tunnelId = "tunnelid";

            let writeableMessage1 = new Message<object>(
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
            expect(() => new Message<object>(
                null,
                () => {},
                2
            )).to.throw(Error).with.property("message",INVALID_MESSAGE_PROPERTY+ERROR_DELIM+INVALID_MESSAGE_DATA)

            expect(() => new Message<object>(
                undefined,
                () => {},
                2
            )).to.throw(Error).with.property("message",INVALID_MESSAGE_PROPERTY+ERROR_DELIM+INVALID_MESSAGE_DATA)

            expect(() => new Message<object>(
                {},
                () => {},
                2
            )).to.not.throw

            expect(() => new Message<object>(
                { hello : 0},
                () => {},
                2
            )).to.not.throw

        });

        it('should throw error on invalid callback', function() {
            expect(() => new Message<object>(
                {...data},
                null,
                2
            )).to.throw(Error).with.property("message",INVALID_MESSAGE_PROPERTY+ERROR_DELIM+INVALID_MESSAGE_CALLBACK)

            expect(() => new Message<object>(
                {...data},
                undefined,
                2
            )).to.throw(Error).with.property("message",INVALID_MESSAGE_PROPERTY+ERROR_DELIM+INVALID_MESSAGE_CALLBACK)

            expect(() => new Message<object>(
                {...data},
                () => {},
                2
            )).to.not.throw

        });

        it('should throw error on invalid priority', function() {
            expect(() => new Message<object>(
                {...data},
                () => {},
                null
            )).to.throw(Error).with.property("message",INVALID_MESSAGE_PROPERTY+ERROR_DELIM+INVALID_MESSAGE_PRIORITY)

            expect(() => new Message<object>(
                {...data},
                () => {},
                undefined
            )).to.throw(Error).with.property("message",INVALID_MESSAGE_PROPERTY+ERROR_DELIM+INVALID_MESSAGE_PRIORITY)

            expect(() => new Message<object>(
                {...data},
                () => {},
                2
            )).to.not.throw

        });
    });

    describe('test un-mutable WritableMessage ', function() {
        it('should be able to clone WritableMessage change not affecting one another', function() {

            let writeableMessage1 = new Message<object>(
                {...data},
                () => {},
                2
            );

            let clonedWriteableMessage = writeableMessage1.clone.complete();

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

            let writeableMessage1 = new Message<object>(
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

            let writeableMessage1 = new Message<object>(
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


};
