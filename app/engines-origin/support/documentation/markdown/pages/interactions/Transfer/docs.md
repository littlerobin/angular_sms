<h1>Call Live Transfer</h1>


Through the _Call live transfer_ interaction, Callburn is able to __live transfer__ the recipient's call; the recipient has received your _Voice Message_, sent with your Caller ID, and asks for a transfer, simply by __pressing a key__ in his receiving device.

For better understand what really happens, let's a look to the image:

![Call Live Transfer](/assets/imagedoc/CallLiveTransfer.png)


When your recipient asks for a _Live Transfer_, a __second call__ to your CallerID number is made, and if successful, you will be connected to your recipient call (the one which received voice message).  

<note-box type="warning">
In this way we bill two different costs, one for the voice message delivery, and another one to transfer this message call to your caller ID, at the same tariffs as a normal message (see more into <a href="#" ui-sref="docs({dir:'prices'})">  prices</a> page).
</note-box>

To configure this interaction it is required to choose a keypress to associate with. 
The request of live transfer will be sent by default at your main Caller ID, if you have more than one validated Caller ID, then you can change it and choose from your caller id list.


To receive the __transfer call__ request, remember to keep your phone ready for receiving calls (free and under network coverage).
In case of busy Caller ID, Callburn tries to deliver the transfer as long the recipient stays waiting on to be connected.
 
<note-box type="tip">
If your caller ID only supports 1 concurrent call, consider limiting messages delivery speed.
</note-box>

You should __limit concurrent live transfers__ on your Caller ID, when decide to activate this Live transfer feature.  

This is useful when your caller ID, receiving live transfers, cannot accept simultaneous calls (example, a mobile that supports to talk with only one person at time).  

When this limit is reached, we will stop the delivery of other voice messages until the value is less than the configured one.