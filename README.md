# Trison

A powerful TypeScript-based synchronous multilevel queue library for managing parallel and sequential tasks, with automatic queue creation and minimal dependencies.

---

## Overview
Trison helps you manage multiple queues for complex workflows, such as chat applications where messages must be processed in order per user. It automatically creates and manages queues (called Tunnels) and provides flexible APIs for synchronous and asynchronous processing.

---

## Table of Contents
- [Overview](#overview)
- [Usecase](#usecase)
- [Features](#features)
- [Installing](#installing)
- [Quick Start](#quick-start)
- [STTunnel](#sttunnel)
- [ConditionalTunnel](#conditionaltunnel)
- [Messages](#messages)
- [Workers](#workers)
- [Running Asynchronous Tasks](#running-asynchronous-tasks)
- [Generics](#generics)
- [Contributing](#contributing)
- [License](#license)
- [API](#api)


## Usecase
Have you come across a use case where you have to run some tasks in parallel, and some in sequence with respect to others? For example, in a chat app, you send messages to multiple people, but for each person, messages must be processed in order. Trison creates and manages these queues for you, processing tasks automatically in sequence without extra code.

---


<img src="https://github.com/ameetgill/trison/blob/master/doc/JsSchedular.png?raw=true" width="400" height="250">

---


## Features
- Multilevel queue management
- Automatic queue (Tunnel) creation
- Synchronous and asynchronous task processing
- Minimal dependencies
- TypeScript generics support
- Worker support for auto-processing
- Flexible message and tunnel APIs

---

## Installing

[![npm version](https://img.shields.io/badge/npm-trison-success)](https://www.npmjs.org/package/trison)

```bash
npm install trison
```

---


## Quick Start

Initialize a multilevel queue. Sub-queues are called Tunnels. The type parameter specifies the data type processed in the queue.

```typescript
import Queue from "trison";
let newMultiLevelQueue = new Queue<object>(
  true, // autoCreateTunnels: create tunnel if not present
  true, // createWorkerForAutoCreatedTunnels
  true  // autoCreateProcessorFunction
); // All parameters are optional
```

---


## STTunnel
STTunnels are identified by their unique string id, which can be provided by the user or automatically created using UUID. You can create STTunnels in several ways:

**Using Queue object:**
```typescript
import Queue from "trison";
import ReadOnlyMessage from "trison/Messages/ReadOnlyMessage";
let newMultiLevelQueue = new Queue();
let processorFunction = async (message: ReadOnlyMessage<object>) => {
  let extractedData = message.getData();
  extractedData["processed"] = true;
  return new ReadOnlyMessage<object>(message);
}
let tunnelCreated: Tunnel<object> = newMultiLevelQueue.createSTTunnelWithId(
    processorFunction,
    "uuid", // unique id
    false // withWorker
);
```

With a preprocessor function (This processor function will run before inserting message into a tunnel)
```typescript
  ...
  // type PreProcessorFunction = (readOnlyMessage: ReadOnlyMessage) => ReadOnlyMessage
  let preProcessorFunction = (message: ReadOnlyMessage<object>) => {
    let extractedData: object = message.getData();
    extractedData["preProcessed"] = true;
    return new ReadOnlyMessage<object>(message);
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
    let sTTunnel = new STTunnel<object>(
        processorFunction,
        "uuid",
        undefined, // optinal preprocessor function
        true // withWorker
    )
```

While creating a tunnel you have to provide ProcessorFunction, which will process every message pushed in the tunnel. 


## ConditionalTunnel
ConditionalTunnels only accept messages that match a condition. You provide a matcher function that returns true or false. The message is checked against tunnels until a match is found.

**Using Queue:**
```typescript
let matcherFunction1 = (message: ReadOnlyMessage<object>) => {
  let data = message.getData();
  return data && data["tunnel"] && data["tunnel"] === "tunnel1";
}
let tunnel: Tunnel<object> = newMultiLevelQueue.createConditionalTunnelWithPreProcessor(
    matcherFunction1,
    processorFunction,
    preProcessorFunction,
    false // withWorker
);
```

Creating ```ConditionalTunnels``` directly from class constructor

```typescript
 import ConditionalTunnel from "trison/tunnels/ConditionalTunnel";
 let conditionalTunnel: ConditionalTunnel<object> = new ConditionalTunnel<object>(
        processorFunction,
        matchFunction,
        tunnelId,
        undefined, // optional preProcessor
        withWorker // optioal
 );

```


## Messages
There are two types of messages:
- `Message`: User-created, mutable, with a unique id assigned automatically.
- `ReadOnlyMessage`: Extracted from a `Message`, immutable, id does not change on cloning.

```typescript
import Message from "trison/Messages/Message";
let data = {
    userId: "lk3kj3kj3kj3k3jk3j",
    text: "Hello Testing"
}
let writeableMessage: Message<object> = new Message<object>(
      {...data},
      () => {}, // CallbackFunction
      2 // priority (currently unused)
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
 let sTTunnel = new STTunnel<object>(
    processorFunction,
    "uuid",
    undefined, // optional preprocessor function
    true // withWorker
 );
 sTTunnel.addMessage(message)
 let tunnel: Tunnel<object> = newMultiLevelQueue.createConditionalTunnelWithPreProcessor(
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
  let polledMessage: ReadOnlyMessage<object> = newMultiLevelQueue.poll(tunnel.getTunnelId());
  
```


## Workers
Trison provides workers that automatically process messages. Set `withWorker` to `true` when creating a tunnel to enable this. Otherwise, you can manually poll messages.


## Running Asynchronous Tasks
Processor functions can be asynchronous. The return type should be `Promise<ReadOnlyMessage>`. Use async/await for tasks that must complete before the next message is processed.

```typescript
let processorFunction = async (message: ReadOnlyMessage<object>) => {
  let extractedData = message.getData();
  let data = await axios({
    method: 'post',
    url: '/user/12345',
    data: {...extractedData}
  });
  return new ReadOnlyMessage<object>(message);
}
```

## Generics
Trison supports custom data types using TypeScript generics. You can only process messages of the type specified during queue creation. To process multiple types, use `new Queue<any>()`.

```typescript
class MyClass {
    userId: string = "32832094823904";
    text: string = "hello";
    processed: boolean = false;
}
let writeableMessage = new Message<MyClass>(
    new MyClass(),
    callbackFunction,
    2
);

let processorFunction = async (message: ReadOnlyMessage<MyClass>) => {
    let extractedData = message.getData();
    extractedData.processed = true;
    return new ReadOnlyMessage<MyClass>(message);
}

let multiLevelQueue = new Queue<MyClass>();
let tunnelCreated = multiLevelQueue.createSTTunnelWithId(
    processorFunction,
    myUUID,
    false
);
let readOnlyMessage = multiLevelQueue.offerMessage(
    writeableMessage,
    tunnelCreated
);
```



---

## Contributing
We welcome contributions! To get started:
- Fork the repository
- Create a feature branch
- Submit a pull request
- Report issues or request features via GitHub Issues

To run tests:
```bash
npm test
```

---

## License

[MIT](LICENSE)


---


## API

Below are the most important classes and methods in Trison:

### Queue<T>
Main entry point for creating and managing tunnels and messages.

**Constructor:**
```typescript
new Queue<T>(autoCreateTunnels?: boolean, createWorkerForAutoCreatedTunnels?: boolean, autoCreateProcessorFunction?: boolean)
```

**Methods:**
- `createSTTunnelWithId(processor: ProcessorFunction<T>, id: string, withWorker?: boolean): Tunnel<T>`
- `createSTTunnelWithPreProcessor(processor: ProcessorFunction<T>, id: string, preProcessor: PreProcessorFunction<T>, withWorker?: boolean): Tunnel<T>`
- `createConditionalTunnelWithPreProcessor(matcher: MatcherFunction<T>, processor: ProcessorFunction<T>, preProcessor: PreProcessorFunction<T>, withWorker?: boolean): Tunnel<T>`
- `offerMessageForTunnelId(message: Message<T>, id: string): void` — Add message to tunnel by id
- `offer(message: Message<T>): void` — Add message to conditional tunnels
- `poll(tunnelId: string): ReadOnlyMessage<T> | undefined` — Retrieve next message from tunnel

---

### Tunnel<T>
Represents a sub-queue. Use to add or poll messages.

**Methods:**
- `addMessage(message: Message<T>): void` — Add message to tunnel
- `getTunnelId(): string` — Get tunnel's unique id

---

### Message<T>
Mutable message object created by user.

**Constructor:**
```typescript
new Message<T>(data: T, callback?: CallbackFunction<T>, priority?: number)
```

**Methods:**
- `getId(): string` — Get message id
- `clone(): Message<T>` — Clone message (new id)

---

### ReadOnlyMessage<T>
Immutable message extracted from `Message`.

**Constructor:**
```typescript
new ReadOnlyMessage<T>(message: Message<T>)
```

**Methods:**
- `getId(): string` — Get message id
- `getData(): T` — Get message data
- `clone(): ReadOnlyMessage<T>` — Clone (id does not change)

