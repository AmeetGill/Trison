# Trison
A TypeScript based Synchronous multilevel queue.

## Table of Contents  

 - [Usecase](#usecase)  
 - [Installing](#installing)  
 - [STTunnel](#sttunnel) 
 - [ConditionalTunnel](#conditionaltunnel)  
 - [Messages](#messages)  
 - [Running Asynchronous Tasks](#running-asynchronous-tasks)  
 - [License](#license)
 - [API](#api)

## Usecase
Have you come across a use case where you have to run some tasks in parallel, and some in sequence with respect to others. One of the cases can be in a chat app. In any chatting app, you send messages to multiple people and for a particular person, messages must be in the same order. So what we want is a queue for every person. The solution seems very simple but maintaining many queues is difficult and this is where Trison will help it will create queues for you and process tasks automatically in sequence without any extra code. One more advantage of using Trison is less 3rd party dependencies, Trison only requires 3 dependencies, and these may also be removed in a future versions.

<img src="https://github.com/ameetgill/trison/blob/master/doc/JsSchedular.png?raw=true" width="400" height="250">

## Installing

[![npm version](https://img.shields.io/badge/npm-trison-success)](https://www.npmjs.org/package/trison)

Using npm:

```bash
$ npm install trison

```

## Docs

In Trison you have to first initialize a multilevel Queue, and sub-queues are called Tunnels and there are two types of Tunnels.
```typescript
  import Queue from "trison"; 
  let newMultiLevelQueue = new Queue(
    true // Optional  autoCreateTunnels; this will create a tunnel if tunnel with a particular id is not present
    true // Optional  createWorkerForAutoCreatedTunnels: whether to create workers for automatic created tunnels
    true // Optional  autoCreateProcessorFunction: default processor function for autocreated tunnels
  ); // initialize Queue, all paramters are optional

```

## STTunnel
STTunnels are identified by their unique string id, which can be provided by the user or can be automatically created using UUID. 
There are various ways to create a STTunnel

Using Queue object
```typescript
  import Queue from "trison";
  import ReadOnlyMessage from "trison/Messages/ReadOnlyMessage";
  let newMultiLevelQueue = new Queue(); // initialize Queue 
  //  type ProcessorFunction = (readOnlyMessage: ReadOnlyMessage) => Promise<ReadOnlyMessage>;
  let processorFunction = async (message: ReadOnlyMessage) => {
    let extractedData = message.getData();
    extractedData["processed"] = true;
    return new ReadOnlyMessage(message);
  }
  let tunnelCreated: Tunnel = newMultiLevelQueue.createSTTunnelWithId(
      processorFunction, 
      "uuid", // unique id of tunnel, must be unique accross STTunnels
      false // withWorker: if true, it will create a worker that will start processing message automatically
  );
```

With a preprocessor function (This processor function will run before inserting message into a tunnel)
```typescript
  ...
  // type PreProcessorFunction = (readOnlyMessage: ReadOnlyMessage) => ReadOnlyMessage
  let preProcessorFunction = (message: ReadOnlyMessage) => {
    let extractedData: object = message.getData();
    extractedData["preProcessed"] = true;
    return new ReadOnlyMessage(message);
  }
  let tunnel: Tunnel = newMultiLevelQueue.createSTTunnelWithPreProcessor(
      processorFunction,
      "uuid",
      preProcessorFunction, 
      false
  );
```

Creating STTunnel directly from class constructor
```typescript
    import STTunnel from "trison/tunnels/STTunnel";
    let sTTunnel = new STTunnel(
        processorFunction,
        "uuid",
        undefined, // optinal preprocessor function
        true // withWorker
    )
```

While creating a tunnel you have to provide ProcessorFunction, which will process every message pushed in the tunnel. 

## ConditionalTunnel
A conditional tunnel as the name implies the message will be pushed in the tunnel only if a condition is met. For this condition, you have to provide a matcher function that will take the message and return true or false. A current message is checked iteratively and search will stop at first tunnel which return true

Using Queue
```typescript
  ...
  // type MatcherFunction = (readOnyMessage: ReadOnlyMessage) => boolean;
  let matcherFunction1 = (message: ReadOnlyMessage) => {
    let data = message.getData();
    return data && data["tunnel"] && data["tunnel"] === "tunnel1";
  }
  let tunnel: Tunnel = newMultiLevelQueue.createConditionalTunnelWithPreProcessor(
      matcherFunction1, // this function will be used to match the message with tunnel
      processorFunction,
      preProcessorFunction,
      false //  withWorker
  );

```

Creating ```ConditionalTunnels``` directly from class constructor

```typescript
 import ConditionalTunnel from "trison/tunnels/ConditionalTunnel";
 let conditionalTunnel: ConditionalTunnel = new ConditionalTunnel(
        processorFunction,
        matchFunction,
        tunnelId,
        undefined, // optional preProcessor
        withWorker // optioal
 );

```

## Messages
There are two types of messages, one is ```Message``` and the other ```ReadOnlyMessage```. User can only create ```Message``` but ```ReadOnlyMessage``` can be extracted from it. Every message has a unique id and assigned automatically when you create a new message. Id will change if you clone Message class but will not change if you create a ```ReadOnlyMessage``` from id.
```ReadOnlyMessage``` Id will not change on cloning.

```typescript
    import Message from "trison/Messages/Message";
    let data = {
        userId: "lk3kj3kj3kj3k3jk3j",
        text: "Hello Testing"
    }
    // type CallbackFunction = (message: ReadOnlyMessage) => any;
    let writeableMessage: Message = new Message(
          {...data}, // data to be passed to the processor function
          () => {}, // CallbackFunction, this function will be called when this message is processed
          2 // priority of message, currenlty it is not being used 
      );
```



Inserting message in a tunnel

Message with same id can exist in same tunnel. So you can process a message again and again (a Feature that i am thinking of)
```typescript
  ...
  // for STTunnel and ConditionTunnel
  // you cannot assign ID to ConditionalTunnel but you can get Id using the getter function 
  newMultiLevelQueue.offerMessageForTunnelId(
    message, // Message
    "uuid" // unique Id
   );
   
    // will match message with conditional tunnels only, using matcher function
   newMultiLevelQueue.offer(message)

```

One more way to add messages is directly using Tunnel object. On creating a tunnel from any method, Tunnel object is returned and you can use that object directly to push messages into it.

```typescript
 import STTunnel from "trison/tunnels/STTunnel";
 let sTTunnel = new STTunnel(
    processorFunction,
    "uuid",
    undefined, // optional preprocessor function
    true // withWorker
 );
 sTTunnel.addMessage(message)
 let tunnel: Tunnel = newMultiLevelQueue.createConditionalTunnelWithPreProcessor(
    matcherFunction1, // this function will be used to match the message with tunnel
    processorFunction,
    preProcessorFunction,
    false //  withWorker
 );
 tunnel.addMessage(message)
```

Poll message from tunnel
```typescript
  ...
  let polledMessage: ReadOnlyMessage = newMultiLevelQueue.poll(tunnel.getTunnelId());
  
```

## Workers

Trison provide workers which can automatically start processing messages. To use workers, you only have to set withWorker parameter true while creating a tunnel. 
If you don't use a worker you have to process messages yourself by polling messages

## Running Asynchronous Tasks

Return type of processor function is of type ``` Promise<ReadOnlyMessage> ```, so If you want to perform some async task in processor function, and you want task to complete before processing next message, you have to resolve the promise accordingly. You can also use async/await syntax as shown below.

```typescript
   let processorFunction = async (message: ReadOnlyMessage) => {
    let extractedData = message.getData();
    let data = await axios({
      method: 'post',
      url: '/user/12345',
      data: {...extractedData}
    });
    return new ReadOnlyMessage(message);
  }
```

## License

[MIT]

## API

cooming soon !
