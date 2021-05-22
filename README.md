# Trison
A TypeScript based Synchronous multilevel queue.

Have you come across a use case where you have to run some tasks in parallel and some in sequence with respect to others. One of the cases can be in a chat app. In any chatting app, you send messages to multiple people and for a particular person, messages must be in the same order. So what we want is a queue for every person. The solution seems very simple but maintaining a large number of queues is difficult and this is where Trison will help it will create queues for you and process tasks automatically in sequence without any extra code. One more advantage of using Trison is less 3rd party dependencies, Trison only requires 3 dependencies and these may also be removed in a future versions.

<img src="https://github.com/ameetgill/pistol/blob/master/doc/JsSchedular.png?raw=true" width="400" height="250">

Docs:

In Trison you have to first initialize a multilevel queue
```typescript
  import Queue from "trison"; 
  let newMultiLevelQueue = new Queue(
    true // Optional  autoCreateTunnels; this will create a tunnel if tunnel with a particular id is not present
    true // Optional  createWorkerForAutoCreatedTunnels: whether to create workers for automatic created tunnels
    true // Optional  autoCreateProcessorFunction: default processor function for autocreated tunnels
  ); // initialize Queue, all paramters are optional

```

In Trision, Queues are called Tunnels and there are two types of Tunnels.

# STTunnel
These types of tunnels are identified by their unique string id, which can be provided by the user or can be automatically created using UUID. 
There are two ways to create a STTunnel

Using Queue object
```typescript
  import Queue from "trison"; 
  let newMultiLevelQueue = new Queue(); // initialize Queue 
  //  type ProcessorFunction = (readOnlyMessage: ReadOnlyMessage) => Promise<ReadOnlyMessage>;
  let processorFunction = async (message: ReadOnlyMessage) => {
    let extractedData = message.getData();
    extractedData["processed"] = true;
    return new ReadOnlyMessage(message);
  }
  let tunnelCreated: Tunnel = newMultiLevelQueue.createSTTunnelWithId(
      processorFunction, 
      "uuid", // unique id of tunnel
      false // withWorker: if true, it will create a worker that will start processing message automatically
  );
```

With a preprocessor function (This processor function will run before inserting message into tunnel)
```typescript
  ...
  // type PreProcessorFunction = (readOnlyMessage: ReadOnlyMessage) => ReadOnlyMessage
  let preProcessorFunction = (message: ReadOnlyMessage) => {
    let extractedData: object = message.getData();
    extractedData["processed"] = true;
    return new ReadOnlyMessage(message);
  }
  let tunnel: Tunnel = newMultiLevelQueue.createSTTunnelWithPreProcessor(
      processorFunction,
      "uuid",
      preProcessorFunction, // 
      false
  );
```

While creating a tunnel you have to provide ProcessorFunction, which will process every message pushed in the tunnel. 

# ConditionalTunnel

Conditional tunnel as the name implies the message will be pushed in the tunnel only if a condition is met. For this condition, you have to provide a matcher function that will take the message and return true or false. Currenlty message is checked iterativly and search will stop at first tunnel which return true

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

# Messages

There are two types of messages, one is Message and the other ReadOnlyMessage. User can only create only Message but ReadOnlyMessage can be extracted from it.

```typescript
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
```typscript
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

Poll message from tunnel
```typscript
  ...
  let polledMessage: ReadOnlyMessage = newMultiLevelQueue.poll(tunnel.getTunnelId());
  
```

# Worker

Trison provide workers which can automatically start processing message, to use workers, you only have to set withWorker parameter true.


