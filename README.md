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

<img src="https://github.com/ameetgill/pistol/blob/master/doc/JsSchedular.png?raw=true" width="400" height="250">

## Installing

Using npm:

```bash
$ npm install trison

```

## Docs

In Trison you have to first initialize a multilevel Queue
```typescript
  import Queue from "trison"; 
  let newMultiLevelQueue = new Queue(
    true // Optional  autoCreateTunnels; this will create a tunnel if tunnel with a particular id is not present
    true // Optional  createWorkerForAutoCreatedTunnels: whether to create workers for automatic created tunnels
    true // Optional  autoCreateProcessorFunction: default processor function for autocreated tunnels
  ); // initialize Queue, all paramters are optional

```

In Trision, sub-queues are called Tunnels and there are two types of Tunnels.

## STTunnel
These types of tunnels are identified by their unique string id, which can be provided by the user or can be automatically created using UUID. 
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

Creating ConditionalTunnels directly from class constructor

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
There are two types of messages, one is Message and the other ReadOnlyMessage. User can only create Message but ReadOnlyMessage can be extracted from it.
Every message has a unique id and assigned automatically when you create a new message. Id will change if you clone Message class but will not change if you create a ReadOnlyMessage from id.
ReadOnlyMessage Id will not change on cloning.

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

Message with same id can exist in same tunnel.
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

One more way to add messages is directly using Tunnel object. On creating a tunnel, tunnel object is returned, and you can use that object directly to push message into it.

```typescript
 import STTunnel from "trison/tunnels/STTunnel";
 let sTTunnel = new STTunnel(
    processorFunction,
    "uuid",
    undefined, // optinal preprocessor function
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

Return type of processor function is of type ``` Promise<ReadOnlyMessage> ```, so If you want to perform some async task in processor function, and you want task to complete before processing message, you have to resolve the promise accordingly. You can also use async/await syntax as shown below.

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

<div class="container container-main">
	<div class="row">
		<div class="col-8 col-content">
			<section class="tsd-panel tsd-hierarchy">
				<h3>Hierarchy</h3>
				<ul class="tsd-hierarchy">
					<li>
						<span class="target">default</span>
					</li>
				</ul>
			</section>
			<section class="tsd-panel-group tsd-index-group">
				<h2>Index</h2>
				<section class="tsd-panel tsd-index-panel">
					<div class="tsd-index-content">
						<section class="tsd-index-section ">
							<h3>Constructors</h3>
							<ul class="tsd-index-list">
								<li class="tsd-kind-constructor tsd-parent-kind-class"><a href="default.html#constructor" class="tsd-kind-icon">constructor</a></li>
							</ul>
						</section>
						<section class="tsd-index-section tsd-is-private tsd-is-private-protected">
							<h3>Properties</h3>
							<ul class="tsd-index-list">
								<li class="tsd-kind-property tsd-parent-kind-class tsd-is-private"><a href="default.html#autocreateprocessorfunction" class="tsd-kind-icon">auto<wbr>Create<wbr>Processor<wbr>Function</a></li>
								<li class="tsd-kind-property tsd-parent-kind-class tsd-is-private"><a href="default.html#autocreatetunnels" class="tsd-kind-icon">auto<wbr>Create<wbr>Tunnels</a></li>
								<li class="tsd-kind-property tsd-parent-kind-class tsd-is-private"><a href="default.html#conditionaltunnels" class="tsd-kind-icon">conditional<wbr>Tunnels</a></li>
								<li class="tsd-kind-property tsd-parent-kind-class tsd-is-private"><a href="default.html#createworkerforautocreatedtunnels" class="tsd-kind-icon">create<wbr>Worker<wbr>For<wbr>Auto<wbr>Created<wbr>Tunnels</a></li>
								<li class="tsd-kind-property tsd-parent-kind-class tsd-is-private"><a href="default.html#sttunnels" class="tsd-kind-icon">st<wbr>Tunnels</a></li>
							</ul>
						</section>
						<section class="tsd-index-section ">
							<h3>Methods</h3>
							<ul class="tsd-index-list">
								<li class="tsd-kind-method tsd-parent-kind-class"><a href="default.html#containstunnel" class="tsd-kind-icon">contains<wbr>Tunnel</a></li>
								<li class="tsd-kind-method tsd-parent-kind-class"><a href="default.html#containstunnelwithid" class="tsd-kind-icon">contains<wbr>Tunnel<wbr>With<wbr>Id</a></li>
								<li class="tsd-kind-method tsd-parent-kind-class"><a href="default.html#createconditionaltunnel" class="tsd-kind-icon">create<wbr>Conditional<wbr>Tunnel</a></li>
								<li class="tsd-kind-method tsd-parent-kind-class"><a href="default.html#createconditionaltunnelwithpreprocessor" class="tsd-kind-icon">create<wbr>Conditional<wbr>Tunnel<wbr>With<wbr>Pre<wbr>Processor</a></li>
								<li class="tsd-kind-method tsd-parent-kind-class"><a href="default.html#createsttunnelwithid" class="tsd-kind-icon">createSTTunnel<wbr>With<wbr>Id</a></li>
								<li class="tsd-kind-method tsd-parent-kind-class"><a href="default.html#createsttunnelwithpreprocessor" class="tsd-kind-icon">createSTTunnel<wbr>With<wbr>Pre<wbr>Processor</a></li>
								<li class="tsd-kind-method tsd-parent-kind-class"><a href="default.html#createsttunnelwithoutid" class="tsd-kind-icon">createSTTunnel<wbr>Without<wbr>Id</a></li>
								<li class="tsd-kind-method tsd-parent-kind-class tsd-is-private"><a href="default.html#findmatchingtunnel" class="tsd-kind-icon">find<wbr>Matching<wbr>Tunnel</a></li>
								<li class="tsd-kind-method tsd-parent-kind-class tsd-is-private"><a href="default.html#gettunnelfromid" class="tsd-kind-icon">get<wbr>Tunnel<wbr>From<wbr>Id</a></li>
								<li class="tsd-kind-method tsd-parent-kind-class"><a href="default.html#offer" class="tsd-kind-icon">offer</a></li>
								<li class="tsd-kind-method tsd-parent-kind-class"><a href="default.html#offermessage" class="tsd-kind-icon">offer<wbr>Message</a></li>
								<li class="tsd-kind-method tsd-parent-kind-class"><a href="default.html#offermessagefortunnelid" class="tsd-kind-icon">offer<wbr>Message<wbr>For<wbr>Tunnel<wbr>Id</a></li>
								<li class="tsd-kind-method tsd-parent-kind-class"><a href="default.html#poll" class="tsd-kind-icon">poll</a></li>
								<li class="tsd-kind-method tsd-parent-kind-class"><a href="default.html#removetunnel" class="tsd-kind-icon">remove<wbr>Tunnel</a></li>
							</ul>
						</section>
					</div>
				</section>
			</section>
			<section class="tsd-panel-group tsd-member-group ">
				<h2>Constructors</h2>
				<section class="tsd-panel tsd-member tsd-kind-constructor tsd-parent-kind-class">
					<a name="constructor" class="tsd-anchor"></a>
					<h3>constructor</h3>
					<ul class="tsd-signatures tsd-kind-constructor tsd-parent-kind-class">
						<li class="tsd-signature tsd-kind-icon">new default<span class="tsd-signature-symbol">(</span>autoCreateTunnels<span class="tsd-signature-symbol">?: </span><span class="tsd-signature-type">boolean</span>, createWorkerForAutoCreatedTunnels<span class="tsd-signature-symbol">?: </span><span class="tsd-signature-type">boolean</span>, autoCreateProcessorFunction<span class="tsd-signature-symbol">?: </span><span class="tsd-signature-type">ProcessorFunction</span><span class="tsd-signature-symbol">)</span><span class="tsd-signature-symbol">: </span><a href="default.html" class="tsd-signature-type" data-tsd-kind="Class">default</a></li>
					</ul>
					<ul class="tsd-descriptions">
						<li class="tsd-description">
							<aside class="tsd-sources">
								<ul>
									<li>Defined in <a href="https://github.com/AmeetGill/pistol/blob/c7032f9/src/Queue.ts#L18">Queue.ts:18</a></li>
								</ul>
							</aside>
							<h4 class="tsd-parameters-title">Parameters</h4>
							<ul class="tsd-parameters">
								<li>
									<h5><span class="tsd-flag ts-flagOptional">Optional</span> autoCreateTunnels: <span class="tsd-signature-type">boolean</span></h5>
								</li>
								<li>
									<h5><span class="tsd-flag ts-flagOptional">Optional</span> createWorkerForAutoCreatedTunnels: <span class="tsd-signature-type">boolean</span></h5>
								</li>
								<li>
									<h5><span class="tsd-flag ts-flagOptional">Optional</span> autoCreateProcessorFunction: <span class="tsd-signature-type">ProcessorFunction</span></h5>
								</li>
							</ul>
							<h4 class="tsd-returns-title">Returns <a href="default.html" class="tsd-signature-type" data-tsd-kind="Class">default</a></h4>
						</li>
					</ul>
				</section>
			</section>
			<section class="tsd-panel-group tsd-member-group tsd-is-private tsd-is-private-protected">
				<h2>Properties</h2>
				<section class="tsd-panel tsd-member tsd-kind-property tsd-parent-kind-class tsd-is-private">
					<a name="autocreateprocessorfunction" class="tsd-anchor"></a>
					<h3><span class="tsd-flag ts-flagPrivate">Private</span> <span class="tsd-flag ts-flagReadonly">Readonly</span> auto<wbr>Create<wbr>Processor<wbr>Function</h3>
					<div class="tsd-signature tsd-kind-icon">auto<wbr>Create<wbr>Processor<wbr>Function<span class="tsd-signature-symbol">:</span> <span class="tsd-signature-type">ProcessorFunction</span></div>
					<aside class="tsd-sources">
						<ul>
							<li>Defined in <a href="https://github.com/AmeetGill/pistol/blob/c7032f9/src/Queue.ts#L18">Queue.ts:18</a></li>
						</ul>
					</aside>
				</section>
				<section class="tsd-panel tsd-member tsd-kind-property tsd-parent-kind-class tsd-is-private">
					<a name="autocreatetunnels" class="tsd-anchor"></a>
					<h3><span class="tsd-flag ts-flagPrivate">Private</span> <span class="tsd-flag ts-flagReadonly">Readonly</span> auto<wbr>Create<wbr>Tunnels</h3>
					<div class="tsd-signature tsd-kind-icon">auto<wbr>Create<wbr>Tunnels<span class="tsd-signature-symbol">:</span> <span class="tsd-signature-type">boolean</span><span class="tsd-signature-symbol"> = false</span></div>
					<aside class="tsd-sources">
						<ul>
							<li>Defined in <a href="https://github.com/AmeetGill/pistol/blob/c7032f9/src/Queue.ts#L16">Queue.ts:16</a></li>
						</ul>
					</aside>
				</section>
				<section class="tsd-panel tsd-member tsd-kind-property tsd-parent-kind-class tsd-is-private">
					<a name="conditionaltunnels" class="tsd-anchor"></a>
					<h3><span class="tsd-flag ts-flagPrivate">Private</span> <span class="tsd-flag ts-flagReadonly">Readonly</span> conditional<wbr>Tunnels</h3>
					<div class="tsd-signature tsd-kind-icon">conditional<wbr>Tunnels<span class="tsd-signature-symbol">:</span> <span class="tsd-signature-type">Map</span><span class="tsd-signature-symbol">&lt;</span><span class="tsd-signature-type">string</span><span class="tsd-signature-symbol">, </span><span class="tsd-signature-type">default</span><span class="tsd-signature-symbol">&gt;</span><span class="tsd-signature-symbol"> = ...</span></div>
					<aside class="tsd-sources">
						<ul>
							<li>Defined in <a href="https://github.com/AmeetGill/pistol/blob/c7032f9/src/Queue.ts#L15">Queue.ts:15</a></li>
						</ul>
					</aside>
				</section>
				<section class="tsd-panel tsd-member tsd-kind-property tsd-parent-kind-class tsd-is-private">
					<a name="createworkerforautocreatedtunnels" class="tsd-anchor"></a>
					<h3><span class="tsd-flag ts-flagPrivate">Private</span> <span class="tsd-flag ts-flagReadonly">Readonly</span> create<wbr>Worker<wbr>For<wbr>Auto<wbr>Created<wbr>Tunnels</h3>
					<div class="tsd-signature tsd-kind-icon">create<wbr>Worker<wbr>For<wbr>Auto<wbr>Created<wbr>Tunnels<span class="tsd-signature-symbol">:</span> <span class="tsd-signature-type">boolean</span><span class="tsd-signature-symbol"> = false</span></div>
					<aside class="tsd-sources">
						<ul>
							<li>Defined in <a href="https://github.com/AmeetGill/pistol/blob/c7032f9/src/Queue.ts#L17">Queue.ts:17</a></li>
						</ul>
					</aside>
				</section>
				<section class="tsd-panel tsd-member tsd-kind-property tsd-parent-kind-class tsd-is-private">
					<a name="sttunnels" class="tsd-anchor"></a>
					<h3><span class="tsd-flag ts-flagPrivate">Private</span> <span class="tsd-flag ts-flagReadonly">Readonly</span> st<wbr>Tunnels</h3>
					<div class="tsd-signature tsd-kind-icon">st<wbr>Tunnels<span class="tsd-signature-symbol">:</span> <span class="tsd-signature-type">Map</span><span class="tsd-signature-symbol">&lt;</span><span class="tsd-signature-type">string</span><span class="tsd-signature-symbol">, </span><span class="tsd-signature-type">default</span><span class="tsd-signature-symbol">&gt;</span><span class="tsd-signature-symbol"> = ...</span></div>
					<aside class="tsd-sources">
						<ul>
							<li>Defined in <a href="https://github.com/AmeetGill/pistol/blob/c7032f9/src/Queue.ts#L14">Queue.ts:14</a></li>
						</ul>
					</aside>
				</section>
			</section>
			<section class="tsd-panel-group tsd-member-group ">
				<h2>Methods</h2>
				<section class="tsd-panel tsd-member tsd-kind-method tsd-parent-kind-class">
					<a name="containstunnel" class="tsd-anchor"></a>
					<h3>contains<wbr>Tunnel</h3>
					<ul class="tsd-signatures tsd-kind-method tsd-parent-kind-class">
						<li class="tsd-signature tsd-kind-icon">contains<wbr>Tunnel<span class="tsd-signature-symbol">(</span>tunnelToFind<span class="tsd-signature-symbol">: </span><span class="tsd-signature-type">default</span><span class="tsd-signature-symbol">)</span><span class="tsd-signature-symbol">: </span><span class="tsd-signature-type">boolean</span></li>
					</ul>
					<ul class="tsd-descriptions">
						<li class="tsd-description">
							<aside class="tsd-sources">
								<ul>
									<li>Defined in <a href="https://github.com/AmeetGill/pistol/blob/c7032f9/src/Queue.ts#L130">Queue.ts:130</a></li>
								</ul>
							</aside>
							<h4 class="tsd-parameters-title">Parameters</h4>
							<ul class="tsd-parameters">
								<li>
									<h5>tunnelToFind: <span class="tsd-signature-type">default</span></h5>
								</li>
							</ul>
							<h4 class="tsd-returns-title">Returns <span class="tsd-signature-type">boolean</span></h4>
						</li>
					</ul>
				</section>
				<section class="tsd-panel tsd-member tsd-kind-method tsd-parent-kind-class">
					<a name="containstunnelwithid" class="tsd-anchor"></a>
					<h3>contains<wbr>Tunnel<wbr>With<wbr>Id</h3>
					<ul class="tsd-signatures tsd-kind-method tsd-parent-kind-class">
						<li class="tsd-signature tsd-kind-icon">contains<wbr>Tunnel<wbr>With<wbr>Id<span class="tsd-signature-symbol">(</span>tunnelId<span class="tsd-signature-symbol">: </span><span class="tsd-signature-type">string</span><span class="tsd-signature-symbol">)</span><span class="tsd-signature-symbol">: </span><span class="tsd-signature-type">boolean</span></li>
					</ul>
					<ul class="tsd-descriptions">
						<li class="tsd-description">
							<aside class="tsd-sources">
								<ul>
									<li>Defined in <a href="https://github.com/AmeetGill/pistol/blob/c7032f9/src/Queue.ts#L155">Queue.ts:155</a></li>
								</ul>
							</aside>
							<h4 class="tsd-parameters-title">Parameters</h4>
							<ul class="tsd-parameters">
								<li>
									<h5>tunnelId: <span class="tsd-signature-type">string</span></h5>
								</li>
							</ul>
							<h4 class="tsd-returns-title">Returns <span class="tsd-signature-type">boolean</span></h4>
						</li>
					</ul>
				</section>
				<section class="tsd-panel tsd-member tsd-kind-method tsd-parent-kind-class">
					<a name="createconditionaltunnel" class="tsd-anchor"></a>
					<h3>create<wbr>Conditional<wbr>Tunnel</h3>
					<ul class="tsd-signatures tsd-kind-method tsd-parent-kind-class">
						<li class="tsd-signature tsd-kind-icon">create<wbr>Conditional<wbr>Tunnel<span class="tsd-signature-symbol">(</span>matchFunction<span class="tsd-signature-symbol">: </span><span class="tsd-signature-type">MatcherFunction</span>, processorFunction<span class="tsd-signature-symbol">: </span><span class="tsd-signature-type">ProcessorFunction</span>, withWorker<span class="tsd-signature-symbol">: </span><span class="tsd-signature-type">boolean</span><span class="tsd-signature-symbol">)</span><span class="tsd-signature-symbol">: </span><span class="tsd-signature-type">default</span></li>
					</ul>
					<ul class="tsd-descriptions">
						<li class="tsd-description">
							<aside class="tsd-sources">
								<ul>
									<li>Defined in <a href="https://github.com/AmeetGill/pistol/blob/c7032f9/src/Queue.ts#L240">Queue.ts:240</a></li>
								</ul>
							</aside>
							<h4 class="tsd-parameters-title">Parameters</h4>
							<ul class="tsd-parameters">
								<li>
									<h5>matchFunction: <span class="tsd-signature-type">MatcherFunction</span></h5>
								</li>
								<li>
									<h5>processorFunction: <span class="tsd-signature-type">ProcessorFunction</span></h5>
								</li>
								<li>
									<h5>withWorker: <span class="tsd-signature-type">boolean</span></h5>
								</li>
							</ul>
							<h4 class="tsd-returns-title">Returns <span class="tsd-signature-type">default</span></h4>
						</li>
					</ul>
				</section>
				<section class="tsd-panel tsd-member tsd-kind-method tsd-parent-kind-class">
					<a name="createconditionaltunnelwithpreprocessor" class="tsd-anchor"></a>
					<h3>create<wbr>Conditional<wbr>Tunnel<wbr>With<wbr>Pre<wbr>Processor</h3>
					<ul class="tsd-signatures tsd-kind-method tsd-parent-kind-class">
						<li class="tsd-signature tsd-kind-icon">create<wbr>Conditional<wbr>Tunnel<wbr>With<wbr>Pre<wbr>Processor<span class="tsd-signature-symbol">(</span>matchFunction<span class="tsd-signature-symbol">: </span><span class="tsd-signature-type">MatcherFunction</span>, processorFunction<span class="tsd-signature-symbol">: </span><span class="tsd-signature-type">ProcessorFunction</span>, preProcessorFunction<span class="tsd-signature-symbol">: </span><span class="tsd-signature-type">PreProcessorFunction</span>, withWorker<span class="tsd-signature-symbol">: </span><span class="tsd-signature-type">boolean</span><span class="tsd-signature-symbol">)</span><span class="tsd-signature-symbol">: </span><span class="tsd-signature-type">default</span></li>
					</ul>
					<ul class="tsd-descriptions">
						<li class="tsd-description">
							<aside class="tsd-sources">
								<ul>
									<li>Defined in <a href="https://github.com/AmeetGill/pistol/blob/c7032f9/src/Queue.ts#L260">Queue.ts:260</a></li>
								</ul>
							</aside>
							<h4 class="tsd-parameters-title">Parameters</h4>
							<ul class="tsd-parameters">
								<li>
									<h5>matchFunction: <span class="tsd-signature-type">MatcherFunction</span></h5>
								</li>
								<li>
									<h5>processorFunction: <span class="tsd-signature-type">ProcessorFunction</span></h5>
								</li>
								<li>
									<h5>preProcessorFunction: <span class="tsd-signature-type">PreProcessorFunction</span></h5>
								</li>
								<li>
									<h5>withWorker: <span class="tsd-signature-type">boolean</span></h5>
								</li>
							</ul>
							<h4 class="tsd-returns-title">Returns <span class="tsd-signature-type">default</span></h4>
						</li>
					</ul>
				</section>
				<section class="tsd-panel tsd-member tsd-kind-method tsd-parent-kind-class">
					<a name="createsttunnelwithid" class="tsd-anchor"></a>
					<h3>createSTTunnel<wbr>With<wbr>Id</h3>
					<ul class="tsd-signatures tsd-kind-method tsd-parent-kind-class">
						<li class="tsd-signature tsd-kind-icon">createSTTunnel<wbr>With<wbr>Id<span class="tsd-signature-symbol">(</span>processorFunction<span class="tsd-signature-symbol">: </span><span class="tsd-signature-type">ProcessorFunction</span>, tunnelId<span class="tsd-signature-symbol">: </span><span class="tsd-signature-type">string</span>, withWorker<span class="tsd-signature-symbol">: </span><span class="tsd-signature-type">boolean</span><span class="tsd-signature-symbol">)</span><span class="tsd-signature-symbol">: </span><span class="tsd-signature-type">default</span></li>
					</ul>
					<ul class="tsd-descriptions">
						<li class="tsd-description">
							<aside class="tsd-sources">
								<ul>
									<li>Defined in <a href="https://github.com/AmeetGill/pistol/blob/c7032f9/src/Queue.ts#L168">Queue.ts:168</a></li>
								</ul>
							</aside>
							<h4 class="tsd-parameters-title">Parameters</h4>
							<ul class="tsd-parameters">
								<li>
									<h5>processorFunction: <span class="tsd-signature-type">ProcessorFunction</span></h5>
								</li>
								<li>
									<h5>tunnelId: <span class="tsd-signature-type">string</span></h5>
								</li>
								<li>
									<h5>withWorker: <span class="tsd-signature-type">boolean</span></h5>
								</li>
							</ul>
							<h4 class="tsd-returns-title">Returns <span class="tsd-signature-type">default</span></h4>
						</li>
					</ul>
				</section>
				<section class="tsd-panel tsd-member tsd-kind-method tsd-parent-kind-class">
					<a name="createsttunnelwithpreprocessor" class="tsd-anchor"></a>
					<h3>createSTTunnel<wbr>With<wbr>Pre<wbr>Processor</h3>
					<ul class="tsd-signatures tsd-kind-method tsd-parent-kind-class">
						<li class="tsd-signature tsd-kind-icon">createSTTunnel<wbr>With<wbr>Pre<wbr>Processor<span class="tsd-signature-symbol">(</span>processorFunction<span class="tsd-signature-symbol">: </span><span class="tsd-signature-type">ProcessorFunction</span>, tunnelId<span class="tsd-signature-symbol">: </span><span class="tsd-signature-type">string</span>, preProcessorFunction<span class="tsd-signature-symbol">: </span><span class="tsd-signature-type">PreProcessorFunction</span>, withWorker<span class="tsd-signature-symbol">: </span><span class="tsd-signature-type">boolean</span><span class="tsd-signature-symbol">)</span><span class="tsd-signature-symbol">: </span><span class="tsd-signature-type">default</span></li>
					</ul>
					<ul class="tsd-descriptions">
						<li class="tsd-description">
							<aside class="tsd-sources">
								<ul>
									<li>Defined in <a href="https://github.com/AmeetGill/pistol/blob/c7032f9/src/Queue.ts#L219">Queue.ts:219</a></li>
								</ul>
							</aside>
							<h4 class="tsd-parameters-title">Parameters</h4>
							<ul class="tsd-parameters">
								<li>
									<h5>processorFunction: <span class="tsd-signature-type">ProcessorFunction</span></h5>
								</li>
								<li>
									<h5>tunnelId: <span class="tsd-signature-type">string</span></h5>
								</li>
								<li>
									<h5>preProcessorFunction: <span class="tsd-signature-type">PreProcessorFunction</span></h5>
								</li>
								<li>
									<h5>withWorker: <span class="tsd-signature-type">boolean</span></h5>
								</li>
							</ul>
							<h4 class="tsd-returns-title">Returns <span class="tsd-signature-type">default</span></h4>
						</li>
					</ul>
				</section>
				<section class="tsd-panel tsd-member tsd-kind-method tsd-parent-kind-class">
					<a name="createsttunnelwithoutid" class="tsd-anchor"></a>
					<h3>createSTTunnel<wbr>Without<wbr>Id</h3>
					<ul class="tsd-signatures tsd-kind-method tsd-parent-kind-class">
						<li class="tsd-signature tsd-kind-icon">createSTTunnel<wbr>Without<wbr>Id<span class="tsd-signature-symbol">(</span>processorFunction<span class="tsd-signature-symbol">: </span><span class="tsd-signature-type">ProcessorFunction</span>, withWorker<span class="tsd-signature-symbol">: </span><span class="tsd-signature-type">boolean</span><span class="tsd-signature-symbol">)</span><span class="tsd-signature-symbol">: </span><span class="tsd-signature-type">default</span></li>
					</ul>
					<ul class="tsd-descriptions">
						<li class="tsd-description">
							<aside class="tsd-sources">
								<ul>
									<li>Defined in <a href="https://github.com/AmeetGill/pistol/blob/c7032f9/src/Queue.ts#L189">Queue.ts:189</a></li>
								</ul>
							</aside>
							<h4 class="tsd-parameters-title">Parameters</h4>
							<ul class="tsd-parameters">
								<li>
									<h5>processorFunction: <span class="tsd-signature-type">ProcessorFunction</span></h5>
								</li>
								<li>
									<h5>withWorker: <span class="tsd-signature-type">boolean</span></h5>
								</li>
							</ul>
							<h4 class="tsd-returns-title">Returns <span class="tsd-signature-type">default</span></h4>
						</li>
					</ul>
				</section>
				<section class="tsd-panel tsd-member tsd-kind-method tsd-parent-kind-class tsd-is-private">
					<a name="findmatchingtunnel" class="tsd-anchor"></a>
					<h3><span class="tsd-flag ts-flagPrivate">Private</span> find<wbr>Matching<wbr>Tunnel</h3>
					<ul class="tsd-signatures tsd-kind-method tsd-parent-kind-class tsd-is-private">
						<li class="tsd-signature tsd-kind-icon">find<wbr>Matching<wbr>Tunnel<span class="tsd-signature-symbol">(</span>message<span class="tsd-signature-symbol">: </span><span class="tsd-signature-type">default</span><span class="tsd-signature-symbol">)</span><span class="tsd-signature-symbol">: </span><span class="tsd-signature-type">default</span></li>
					</ul>
					<ul class="tsd-descriptions">
						<li class="tsd-description">
							<aside class="tsd-sources">
								<ul>
									<li>Defined in <a href="https://github.com/AmeetGill/pistol/blob/c7032f9/src/Queue.ts#L109">Queue.ts:109</a></li>
								</ul>
							</aside>
							<h4 class="tsd-parameters-title">Parameters</h4>
							<ul class="tsd-parameters">
								<li>
									<h5>message: <span class="tsd-signature-type">default</span></h5>
								</li>
							</ul>
							<h4 class="tsd-returns-title">Returns <span class="tsd-signature-type">default</span></h4>
						</li>
					</ul>
				</section>
				<section class="tsd-panel tsd-member tsd-kind-method tsd-parent-kind-class tsd-is-private">
					<a name="gettunnelfromid" class="tsd-anchor"></a>
					<h3><span class="tsd-flag ts-flagPrivate">Private</span> get<wbr>Tunnel<wbr>From<wbr>Id</h3>
					<ul class="tsd-signatures tsd-kind-method tsd-parent-kind-class tsd-is-private">
						<li class="tsd-signature tsd-kind-icon">get<wbr>Tunnel<wbr>From<wbr>Id<span class="tsd-signature-symbol">(</span>tunnelId<span class="tsd-signature-symbol">: </span><span class="tsd-signature-type">string</span><span class="tsd-signature-symbol">)</span><span class="tsd-signature-symbol">: </span><span class="tsd-signature-type">default</span></li>
					</ul>
					<ul class="tsd-descriptions">
						<li class="tsd-description">
							<aside class="tsd-sources">
								<ul>
									<li>Defined in <a href="https://github.com/AmeetGill/pistol/blob/c7032f9/src/Queue.ts#L199">Queue.ts:199</a></li>
								</ul>
							</aside>
							<h4 class="tsd-parameters-title">Parameters</h4>
							<ul class="tsd-parameters">
								<li>
									<h5>tunnelId: <span class="tsd-signature-type">string</span></h5>
								</li>
							</ul>
							<h4 class="tsd-returns-title">Returns <span class="tsd-signature-type">default</span></h4>
						</li>
					</ul>
				</section>
				<section class="tsd-panel tsd-member tsd-kind-method tsd-parent-kind-class">
					<a name="offer" class="tsd-anchor"></a>
					<h3>offer</h3>
					<ul class="tsd-signatures tsd-kind-method tsd-parent-kind-class">
						<li class="tsd-signature tsd-kind-icon">offer<span class="tsd-signature-symbol">(</span>message<span class="tsd-signature-symbol">: </span><span class="tsd-signature-type">default</span><span class="tsd-signature-symbol">)</span><span class="tsd-signature-symbol">: </span><span class="tsd-signature-type">default</span></li>
					</ul>
					<ul class="tsd-descriptions">
						<li class="tsd-description">
							<aside class="tsd-sources">
								<ul>
									<li>Defined in <a href="https://github.com/AmeetGill/pistol/blob/c7032f9/src/Queue.ts#L92">Queue.ts:92</a></li>
								</ul>
							</aside>
							<h4 class="tsd-parameters-title">Parameters</h4>
							<ul class="tsd-parameters">
								<li>
									<h5>message: <span class="tsd-signature-type">default</span></h5>
								</li>
							</ul>
							<h4 class="tsd-returns-title">Returns <span class="tsd-signature-type">default</span></h4>
						</li>
					</ul>
				</section>
				<section class="tsd-panel tsd-member tsd-kind-method tsd-parent-kind-class">
					<a name="offermessage" class="tsd-anchor"></a>
					<h3>offer<wbr>Message</h3>
					<ul class="tsd-signatures tsd-kind-method tsd-parent-kind-class">
						<li class="tsd-signature tsd-kind-icon">offer<wbr>Message<span class="tsd-signature-symbol">(</span>message<span class="tsd-signature-symbol">: </span><span class="tsd-signature-type">default</span>, tunnel<span class="tsd-signature-symbol">: </span><span class="tsd-signature-type">default</span><span class="tsd-signature-symbol">)</span><span class="tsd-signature-symbol">: </span><span class="tsd-signature-type">default</span></li>
					</ul>
					<ul class="tsd-descriptions">
						<li class="tsd-description">
							<aside class="tsd-sources">
								<ul>
									<li>Defined in <a href="https://github.com/AmeetGill/pistol/blob/c7032f9/src/Queue.ts#L44">Queue.ts:44</a></li>
								</ul>
							</aside>
							<h4 class="tsd-parameters-title">Parameters</h4>
							<ul class="tsd-parameters">
								<li>
									<h5>message: <span class="tsd-signature-type">default</span></h5>
								</li>
								<li>
									<h5>tunnel: <span class="tsd-signature-type">default</span></h5>
								</li>
							</ul>
							<h4 class="tsd-returns-title">Returns <span class="tsd-signature-type">default</span></h4>
						</li>
					</ul>
				</section>
				<section class="tsd-panel tsd-member tsd-kind-method tsd-parent-kind-class">
					<a name="offermessagefortunnelid" class="tsd-anchor"></a>
					<h3>offer<wbr>Message<wbr>For<wbr>Tunnel<wbr>Id</h3>
					<ul class="tsd-signatures tsd-kind-method tsd-parent-kind-class">
						<li class="tsd-signature tsd-kind-icon">offer<wbr>Message<wbr>For<wbr>Tunnel<wbr>Id<span class="tsd-signature-symbol">(</span>message<span class="tsd-signature-symbol">: </span><span class="tsd-signature-type">default</span>, tunnelId<span class="tsd-signature-symbol">: </span><span class="tsd-signature-type">string</span><span class="tsd-signature-symbol">)</span><span class="tsd-signature-symbol">: </span><span class="tsd-signature-type">default</span></li>
					</ul>
					<ul class="tsd-descriptions">
						<li class="tsd-description">
							<aside class="tsd-sources">
								<ul>
									<li>Defined in <a href="https://github.com/AmeetGill/pistol/blob/c7032f9/src/Queue.ts#L70">Queue.ts:70</a></li>
								</ul>
							</aside>
							<h4 class="tsd-parameters-title">Parameters</h4>
							<ul class="tsd-parameters">
								<li>
									<h5>message: <span class="tsd-signature-type">default</span></h5>
								</li>
								<li>
									<h5>tunnelId: <span class="tsd-signature-type">string</span></h5>
								</li>
							</ul>
							<h4 class="tsd-returns-title">Returns <span class="tsd-signature-type">default</span></h4>
						</li>
					</ul>
				</section>
				<section class="tsd-panel tsd-member tsd-kind-method tsd-parent-kind-class">
					<a name="poll" class="tsd-anchor"></a>
					<h3>poll</h3>
					<ul class="tsd-signatures tsd-kind-method tsd-parent-kind-class">
						<li class="tsd-signature tsd-kind-icon">poll<span class="tsd-signature-symbol">(</span>tunnelId<span class="tsd-signature-symbol">: </span><span class="tsd-signature-type">string</span><span class="tsd-signature-symbol">)</span><span class="tsd-signature-symbol">: </span><span class="tsd-signature-type">default</span></li>
					</ul>
					<ul class="tsd-descriptions">
						<li class="tsd-description">
							<aside class="tsd-sources">
								<ul>
									<li>Defined in <a href="https://github.com/AmeetGill/pistol/blob/c7032f9/src/Queue.ts#L277">Queue.ts:277</a></li>
								</ul>
							</aside>
							<h4 class="tsd-parameters-title">Parameters</h4>
							<ul class="tsd-parameters">
								<li>
									<h5>tunnelId: <span class="tsd-signature-type">string</span></h5>
								</li>
							</ul>
							<h4 class="tsd-returns-title">Returns <span class="tsd-signature-type">default</span></h4>
						</li>
					</ul>
				</section>
				<section class="tsd-panel tsd-member tsd-kind-method tsd-parent-kind-class">
					<a name="removetunnel" class="tsd-anchor"></a>
					<h3>remove<wbr>Tunnel</h3>
					<ul class="tsd-signatures tsd-kind-method tsd-parent-kind-class">
						<li class="tsd-signature tsd-kind-icon">remove<wbr>Tunnel<span class="tsd-signature-symbol">(</span>tunnelId<span class="tsd-signature-symbol">: </span><span class="tsd-signature-type">string</span><span class="tsd-signature-symbol">)</span><span class="tsd-signature-symbol">: </span><span class="tsd-signature-type">void</span></li>
					</ul>
					<ul class="tsd-descriptions">
						<li class="tsd-description">
							<aside class="tsd-sources">
								<ul>
									<li>Defined in <a href="https://github.com/AmeetGill/pistol/blob/c7032f9/src/Queue.ts#L55">Queue.ts:55</a></li>
								</ul>
							</aside>
							<h4 class="tsd-parameters-title">Parameters</h4>
							<ul class="tsd-parameters">
								<li>
									<h5>tunnelId: <span class="tsd-signature-type">string</span></h5>
								</li>
							</ul>
							<h4 class="tsd-returns-title">Returns <span class="tsd-signature-type">void</span></h4>
						</li>
					</ul>
				</section>
			</section>
		</div>
		<div class="col-4 col-menu menu-sticky-wrap menu-highlight">
			<nav class="tsd-navigation primary">
				<ul>
					<li class=" ">
						<a href="../modules.html">Exports</a>
					</li>
				</ul>
			</nav>
			<nav class="tsd-navigation secondary menu-sticky">
				<ul class="before-current">
				</ul>
				<ul class="current">
					<li class="current tsd-kind-class">
						<a href="default.html" class="tsd-kind-icon">default</a>
						<ul>
							<li class=" tsd-kind-constructor tsd-parent-kind-class">
								<a href="default.html#constructor" class="tsd-kind-icon">constructor</a>
							</li>
							<li class=" tsd-kind-property tsd-parent-kind-class tsd-is-private">
								<a href="default.html#autocreateprocessorfunction" class="tsd-kind-icon">auto<wbr>Create<wbr>Processor<wbr>Function</a>
							</li>
							<li class=" tsd-kind-property tsd-parent-kind-class tsd-is-private">
								<a href="default.html#autocreatetunnels" class="tsd-kind-icon">auto<wbr>Create<wbr>Tunnels</a>
							</li>
							<li class=" tsd-kind-property tsd-parent-kind-class tsd-is-private">
								<a href="default.html#conditionaltunnels" class="tsd-kind-icon">conditional<wbr>Tunnels</a>
							</li>
							<li class=" tsd-kind-property tsd-parent-kind-class tsd-is-private">
								<a href="default.html#createworkerforautocreatedtunnels" class="tsd-kind-icon">create<wbr>Worker<wbr>For<wbr>Auto<wbr>Created<wbr>Tunnels</a>
							</li>
							<li class=" tsd-kind-property tsd-parent-kind-class tsd-is-private">
								<a href="default.html#sttunnels" class="tsd-kind-icon">st<wbr>Tunnels</a>
							</li>
							<li class=" tsd-kind-method tsd-parent-kind-class">
								<a href="default.html#containstunnel" class="tsd-kind-icon">contains<wbr>Tunnel</a>
							</li>
							<li class=" tsd-kind-method tsd-parent-kind-class">
								<a href="default.html#containstunnelwithid" class="tsd-kind-icon">contains<wbr>Tunnel<wbr>With<wbr>Id</a>
							</li>
							<li class=" tsd-kind-method tsd-parent-kind-class">
								<a href="default.html#createconditionaltunnel" class="tsd-kind-icon">create<wbr>Conditional<wbr>Tunnel</a>
							</li>
							<li class=" tsd-kind-method tsd-parent-kind-class">
								<a href="default.html#createconditionaltunnelwithpreprocessor" class="tsd-kind-icon">create<wbr>Conditional<wbr>Tunnel<wbr>With<wbr>Pre<wbr>Processor</a>
							</li>
							<li class=" tsd-kind-method tsd-parent-kind-class">
								<a href="default.html#createsttunnelwithid" class="tsd-kind-icon">createSTTunnel<wbr>With<wbr>Id</a>
							</li>
							<li class=" tsd-kind-method tsd-parent-kind-class">
								<a href="default.html#createsttunnelwithpreprocessor" class="tsd-kind-icon">createSTTunnel<wbr>With<wbr>Pre<wbr>Processor</a>
							</li>
							<li class=" tsd-kind-method tsd-parent-kind-class">
								<a href="default.html#createsttunnelwithoutid" class="tsd-kind-icon">createSTTunnel<wbr>Without<wbr>Id</a>
							</li>
							<li class=" tsd-kind-method tsd-parent-kind-class tsd-is-private">
								<a href="default.html#findmatchingtunnel" class="tsd-kind-icon">find<wbr>Matching<wbr>Tunnel</a>
							</li>
							<li class=" tsd-kind-method tsd-parent-kind-class tsd-is-private">
								<a href="default.html#gettunnelfromid" class="tsd-kind-icon">get<wbr>Tunnel<wbr>From<wbr>Id</a>
							</li>
							<li class=" tsd-kind-method tsd-parent-kind-class">
								<a href="default.html#offer" class="tsd-kind-icon">offer</a>
							</li>
							<li class=" tsd-kind-method tsd-parent-kind-class">
								<a href="default.html#offermessage" class="tsd-kind-icon">offer<wbr>Message</a>
							</li>
							<li class=" tsd-kind-method tsd-parent-kind-class">
								<a href="default.html#offermessagefortunnelid" class="tsd-kind-icon">offer<wbr>Message<wbr>For<wbr>Tunnel<wbr>Id</a>
							</li>
							<li class=" tsd-kind-method tsd-parent-kind-class">
								<a href="default.html#poll" class="tsd-kind-icon">poll</a>
							</li>
							<li class=" tsd-kind-method tsd-parent-kind-class">
								<a href="default.html#removetunnel" class="tsd-kind-icon">remove<wbr>Tunnel</a>
							</li>
						</ul>
					</li>
				</ul>
				<ul class="after-current">
				</ul>
			</nav>
		</div>
	</div>
</div>
<footer class="with-border-bottom">
	<div class="container">
		<h2>Legend</h2>
		<div class="tsd-legend-group">
			<ul class="tsd-legend">
				<li class="tsd-kind-constructor tsd-parent-kind-class"><span class="tsd-kind-icon">Constructor</span></li>
				<li class="tsd-kind-method tsd-parent-kind-class"><span class="tsd-kind-icon">Method</span></li>
			</ul>
			<ul class="tsd-legend">
				<li class="tsd-kind-property tsd-parent-kind-class tsd-is-private"><span class="tsd-kind-icon">Private property</span></li>
				<li class="tsd-kind-method tsd-parent-kind-class tsd-is-private"><span class="tsd-kind-icon">Private method</span></li>
			</ul>
		</div>
	</div>
</footer>
<div class="container tsd-generator">
	<p>Generated using <a href="https://typedoc.org/" target="_blank">TypeDoc</a></p>
</div>
<div class="overlay"></div>
<script src="../assets/js/main.js"></script>
