<h1>Choosing Recipients</h1>

After composing the message, you have to choose the recipients (contacts) to whom you want to send your **voice messages**.

![Select source](/assets/imagedoc/SelectSource.png)

As you can see in the image, Callburn provides multiple ways to put __recipients__ into the system, you can choose between these:

* <a href="#" ng-href="/api#/docs#option1">From Phonebook</a>
* <a href="#" ng-href="/api#/docs#option2">From your mobile device</a>
* <a href="#" ng-href="/api#/docs#option3">From file or manually input</a>


Like we have seen in the previous step, in  __Overview__ section, it is also possible to reuse the recipients, already used for a voice message, by using the apposite __Reuse Recipients__ function.  

<note-box type="note">
Note that recipients also may be chosen using together some phone numbers uploaded from a file and some others by typing them manually. The resulting set of recipients will be shown you before to proceed to the next step.
</note-box>


	

<a id="option1"></a>
<h2> Method 1: From Phonebook</h2>

As better explained in the <a href="#" ui-sref="docs({dir:'phonebook'})"> **Phonebook**</a> page, Callburn allows you to save and manage, in a kind of virtual phonebook, your favorites phone numbers.

In this step, you can easily select from Phonebook either __Contacts__ or __Groups__, for send your voice message.

<note-box type="info">
As we will see in the next step, it is possible to set a __repetition__ for the delivery. In this case, if a group was selected for the delivery, all changes related to this group (add or remove one or more contacts) they will impact on the number of recipients for next delivery.
</note-box> 

Moreover if you want to remove the entire group, you need to remember that there should be, one or more scheduled deliveries, that will not be able to be completed.   

	

	
<a id="option2"></a>
<h2> Method 2: From your mobile device</h2>

We give you the possibility to link your Callburn account, created from web, with both iOS and Android platforms. 

So, in this step, you can import your entire **device phonebook** into Callburn account, to choose your personal contacts to send them a voice message with Callburn.	
	

	
<a id="option3"></a>
<h2> Method 3: From file or manually input</h2>

You can choose your recipients by uploading a file with a list of phone numbers, or simply by typing them one by one, or also by pasting them in the provided box.

>We support both *txt, csv, xls and xlsx* files . 

<note-box type="warning">
Phone numbers must include an international prefix, otherwise the system will detect the phone number as incomplete and will return a _not supported_ status.  
</note-box> 

If there are duplicates the system will detect them and will return a _duplicate_ status.

You can upload file from the web interface through basic file uploader or Drag&Drop interface.

<note-box type="tip">
Using Drag&Drop is simple, just move your file into Drag&Drop area to be uploaded
</note-box>

You can also choose to import recipients manually, in this case it is enough to remember to put phone numbers with international prefix, both if you type them than if you paste them.


Before proceed with the next step, you can always have a preview of the imported list of recipients.
	





	 
