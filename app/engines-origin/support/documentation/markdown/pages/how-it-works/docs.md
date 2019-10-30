
<h1>How it works</h1>
 

"*Imagine a **voice message** that arrives like call, *ringing* until the destination doesn't pickup the call*"

For a **better understandability**, we want to show you some steps from the message creation until delivery:	

1. User writes a text, or uploads an existing voice message, then chooses some **recipients** (contacts),  and sends it (or decides to <a href="#" ui-sref="docs({dir:'schedule'})"> schedule</a> the send) -- you can find all these steps documented <a href="#" ui-sref="docs({dir:'how-to-use'})"> here</a>
2. Callburn will try to deliver the message by doing a maximum of **5 delivery retries pausing 5 minutes between the attempts**
3. If message gets delivered, the user's prepaid-credit will be charged for total message time (as indicated into <a href="#" ui-sref="docs({dir:'prices'})"> **prices</a> page**)	
	

<note-box type="note">
Callburn works like a normal call and for this reason it doesn't rely on mobile data or applications.
</note-box>

The messages will be sent using your own fixed or mobile phone **caller id**, so the destination can immediately identify you.	


<note-box type="warning">
For work properly, the **destinations** *should have got an active phonenumber to be reached*.	 
If you can reach your destination by a normal phone call, then callburn can reach it **too**
</note-box>
	

Callburn messages also supports <a href="#" ui-sref="docs({dir:'interactions'})"> **interactions**</a> which gives ability to the user to make really great things.		

Callburn allows you to create a personally and accessible <a href="#" ui-sref="docs({dir:'phonebook'})"> **Phonebook**</a>, either to use it for sending voice messages or simply to save the phone numbers, and export them in a second time. You should also arrange the phone numbers saved in **Groups** that can be renamed, deleted and used for the sending of Voice messages with Callburn. 

Callburn gives you all instruments to compose a Voice Message and send it or schedule it. All these activities will be saved and available in __Overview__ section where you can find all your __saved__, __scheduled__ and __sent__ voice messages. For every _voice message_ you can see associated recipients, its status, and all the __resulted statistics__ if the message has been sent, like number of delivery attempt and interactions made, if any.    

![](/assets/imagedoc/Overview.png)

As we can see, for every item of the Overview table, Callburn provides _interactive mouseover_ that can explain their functionalities and give to the user very useful informations about message's features. To view more details you can click both on _Cost_ value or in _Show statistics_ action, that can be found by clicking in __More__ list. It will be shown the __Overview statistics table__ (next image) where user should see and export all achieved results of the voice messages delivery.

![Overview Statistics Table](/assets/imagedoc/OverviewStat.png)

For business users that want to integrate Callburn into their **custom application**, we also provide <a href="#" ui-sref="docs({dir:'api'})"> **API**</a>  to **easily** use Callburn as **Voice Message Gateway**