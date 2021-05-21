# Trison
A TypeScript based Synchronous multilevel queu.

Have you came across a usecase where you have to run some tasks in parallel and some in sequence with respect to other. One of the case can be in a chat app. In any chatting app you send messages to multiple people and for a particular person, messages must be in same order. So what we want is a queue for every person. Solution seems very simple but maintaing large number of queues is difficult and this is where trison will help it will create queues for you and process tasks automatically in sequence without any extra code. One more advantage of using trison is less 3rd party dependencies, Trison only requires 3 dependencies and these may also be removed in future version.

![alt text](https://github.com/ameetgill/pistol/blob/master/doc/JsSchedular.png?raw=true)

Docs:

In Trision, Queues are called Tunnels and there are two types of Tunnels.

# STTunnel
These type of tunnels are identified by their unique string id, which can be provide by user or can be automatically created using UUID. 
How to create a STTunnel

Using Queue object
```
  let newMultiLevelQueue = new Queue();

  let tunnelCreated = newMultiLevelQueue.createSTTunnelWithId(
      processorFunction,
      "uuid",
      false
  );
```

Directly from STTunnel

```
let newSTTunnel: STTunnel= new STTunnel(
          processorFunction,
          tunnelId,
          undefined,
          withWorker
      );
```

While creating a tunnel you have to provide ProcessorFunction, which will process every message pushed in the tunnel. 

# ConditionalTunnel

Conditional tunnel as name implies, message will me pushed in the tunnel only if a condition is met. For this condition, you have to provide a matcher function which will take the message and return true or false

Using Queue
```

let tunnel = newMultiLevelQueue.createConditionalTunnelWithPreProcessor(
    matcherFunction1,
    processorFunction,
    preProcessorFunction,
    false
);

```

Directly from ConditionalTunnel class
```
let conditionalTunnel: ConditionalTunnel = new ConditionalTunnel(
      processorFunction,
      matchFunction,
      tunnelId,
      undefined,
);
```


# Messages

There are two type of messages, one is Message and other ReadOnlyMessage. There functions are as name describes


Types
```
type CallbackFunction = (message: ReadOnlyMessage) => any;
type MatcherFunction = (readOnyMessage: ReadOnlyMessage) => boolean;
type ProcessorFunction = (readOnlyMessage: ReadOnlyMessage) => Promise<ReadOnlyMessage>;
type PreProcessorFunction = (readOnlyMessage: ReadOnlyMessage) => ReadOnlyMessage;
```

