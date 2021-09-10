## Complete project to help you complete the free-code-camp [url shortener microservice API certification project](https://www.freecodecamp.org/learn/back-end-development-and-apis/back-end-development-and-apis-projects/url-shortener-microservice)

test it out here: https://fcc-url-shortener-microservice.un-index.repl.co/
## Setup instructions
visit https://www.freecodecamp.org/news/get-started-with-mongodb-atlas/ and follow the instructions to get your MongoDB URI

add your uri to the .env file, which should look like:

```
mongoDbURI=mongodb+srv://<username>:<password>@...
```
e.g when substituting your details
```
mongoDbURI=mongodb+srv://un-index:notmypasswordlol@cluster-name.mongodb.net/database-name?retryWrites=true&w=majority
```
make sure to run 
```
npm install
``` 
in the console to install the dependencies 
  
host it somewhere, e.g on [Glitch](https://glitch.com) (e.g by uploading all these files to your project) or [repl.it](https://replit.com/~) and test it out

NOTE: in case of any errors connecting to the database, make sure you've got your correct MongoDB URI in the .env file  (repl.it has [deprecated .env files](https://docs.replit.com/archive/secret-keys) in favor of their UI for setting environment variables).

___
PS: _This should be enough to illustrate an outline for the creation of this project. This is **not** meant to be copied in its entirety and submitted without change._
