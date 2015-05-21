# Welcome to Linguist

The concept of chatroulette has gotten a bad rep over the past few years. Sites like Omegle have made chatroulette almost an adult-only product, creating a world occupied by lonely men on the Internet hungry for affection. That's all about to change. Introducing Linguist, the first ever chatroulette website designed specifically for language learners and those who wish to have a better understanding of the world. Simply head over to [http://linguistic.io](http://linguistic.io), specify which language you know and which one you are learning, and then be connected in seconds to a native speaker to practice with. And that best part of all is, it's free! It's also open-sourced (duh).

## Starting Linguist

To start Linguist, simply `cd` into Linguist's home directory and run the following two commands:

	$ npm install --production
	$ gulp
		
Once the gulp build has finished, fire up any web browser and go to http://localhost:4000. There you have it, a local copy of Linguist! Alternatively, you can install all dependencies (including development dependencies) by just running `npm install`.

## Configuring Nginx

If you wish to run Linguist behind a proxy server, you must add the following two settings to your Nginx configuration in order to deduct user location:

	proxy_set_header X-Real-IP $remote_addr;
	proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
	
It is important to note that location reporting will not work on a local installation (at least as far as I know).
