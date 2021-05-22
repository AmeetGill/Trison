# Trison
A TypeScript based Synchronous multilevel queue.

Have you come across a use case where you have to run some tasks in parallel and some in sequence with respect to others. One of the cases can be in a chat app. In any chatting app, you send messages to multiple people and for a particular person, messages must be in the same order. So what we want is a queue for every person. The solution seems very simple but maintaining a large number of queues is difficult and this is where Trison will help it will create queues for you and process tasks automatically in sequence without any extra code. One more advantage of using Trison is less 3rd party dependencies, Trison only requires 3 dependencies and these may also be removed in a future versions.

![alt text](https://github.com/ameetgill/pistol/blob/master/doc/JsSchedular.png?raw=true)

Docs:

In Trision, Queues are called Tunnels and there are two types of Tunnels.

# STTunnel
These types of tunnels are identified by their unique string id, which can be provided by the user or can be automatically created using UUID. 
How to create a STTunnel

Using Queue object
```typescript
  let newMultiLevelQueue = new Queue();

  let tunnelCreated = newMultiLevelQueue.createSTTunnelWithId(
      processorFunction,
      "uuid",
      false
  );
```

Directly from STTunnel

```typescript
let newSTTunnel: STTunnel= new STTunnel(
          processorFunction,
          tunnelId,
          undefined,
          withWorker
      );
```

While creating a tunnel you have to provide ProcessorFunction, which will process every message pushed in the tunnel. 

# ConditionalTunnel

Conditional tunnel as the name implies the message will be pushed in the tunnel only if a condition is met. For this condition, you have to provide a matcher function that will take the message and return true or false

Using Queue
```typescript
let tunnel = newMultiLevelQueue.createConditionalTunnelWithPreProcessor(
    matcherFunction1,
    processorFunction,
    preProcessorFunction,
    false
);

```

Directly from ConditionalTunnel class
```typescript
let conditionalTunnel: ConditionalTunnel = new ConditionalTunnel(
      processorFunction,
      matchFunction,
      tunnelId,
      undefined,
);
```


# Messages

There is two types of messages, one is Message and the other ReadOnlyMessage. Their functions are as the name describes


Types
```
type CallbackFunction = (message: ReadOnlyMessage) => any;
type MatcherFunction = (readOnyMessage: ReadOnlyMessage) => boolean;
type ProcessorFunction = (readOnlyMessage: ReadOnlyMessage) => Promise<ReadOnlyMessage>;
type PreProcessorFunction = (readOnlyMessage: ReadOnlyMessage) => ReadOnlyMessage;
```

