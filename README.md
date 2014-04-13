# here

This is our project for hack.UVA 2014! We're turning every website you visit into a place, so when you visit a site it's like walking into a room. Upon visiting a website, you'll automatically be joined in a chat with everybody else who's visiting that website.

## Features

* On any page you visit, you can hover over the bottom-right corner of your screen to open a chat with others on the same page! You will be chatting with anybody on the same top-level domain.
* Press the icon in the Chrome menu (top-right) to open up the settings, where you can change your nickname.
* Any messages you write will be seen by anybody else currently in the room, and will last for 15 minutes.
* If you preface a message with ":leave ", it's a graffiti message and will be kept for 24 hours and displayed to anybody who enters the room! This is a way of saying "I was here". You are only allowed one graffiti message at a time per page.

## Installing

* See the 'build' folder for installation detials.
* If you want to work with our code, see package.json for a list of requirements/dependencies.


## What's under the hood?

* node.js
	* Our server runs on node.js.
* socket.io
	* All communication is handled through sockets.
* Heroku
	* Our server and databases are hosted on Heroku.
* JQuery
	* Used throughout our client.
	* Used jquery.toast from soldier-b/jquery.toast for client-side notifications.
* postgreSQL
	* Heroku databases use postgreSQL, so we do too!
* Chrome
	* The client is a Chrome extension.
* TheNounProject
	* Used to find images for our icons.

## Special Thanks

* Andy Locascio
	* Helped us a ton with our design!
* Nick Quinlan
	* Helped us with node.js, sockets, general encouragement, and bubble wrap provision.
* Andrew Carter
	* Helped us with CSS, HTML, general styling.

## Authors

* Matt Pearson-Beck
* James Sun
* Richard Knoll