# Student-Meet
## introduction
Student Meet is an app build for all the students at our campus. We noticed that not a lot of events where hosted at our school so for this project we made an app where students themselves could create their events. It's very easy to join and create new events and you can add them to a categoty. you get notifications when something happens in an event you joined and you can easly keep track of all the events you are hosting or participating in.

## installation instructions
### Before cloning
>[!warning]
> We reccomend you to use Expo go to see the mobile app at its best, Some features only work on mobile devices. These features are mainly popups and alerts.
>
>This project uses a Firebase database so prepare to set one up



> expo go download:
>
>App store: https://apps.apple.com/us/app/expo-go/id982107779
>
> Play store: https://play.google.com/store/apps/details?id=host.exp.exponent&hl=en&pli=1
### real setup
#### 1. Git clone
easiest with one of these options: 
- Use github desktop do clone this project in a repository 
- use ```git clone https://github.com/mathis-de-brouwer/IT_Project_EHBMeet.git``` in a terminal

 Now you can open this project in Visual studio code

 After opening the project, open a terminal and run ``` npm install ```

#### 2. Database setup
Create a ``` firebase.ts ``` file in the Student-Meet Directoy

copy the contents of the ``` firebase.example.ts ``` file into ``` firebase.ts ```

Now you need to create a Firebase:
1. Go to https://firebase.google.com
2. Click on ``` Get Started ```
3. Create a new project
4. Enter a name for the project (example: Student-Meet)
5. Make sure Google Analytics is checked on for this project
6. Click on ``` continue ```
7. Select an account (default: Default Account for Firebase)
8. Create a new project

Now you have to add the firebase to the app:
1. Click on the ``` </> ``` icon to create a web app link
2. Give your App a nickname (example: Student-Meet)
3. Check the box to set up Firebase Hosting for this app
4. Click on ``` Register App ```
5. back in your project Open a terminal and run ``` npm install firebase ```
6. Copy the values of these variables into the ``` firebase.ts ``` file you created

   Fields to fill in:
   ```
   apiKey: "",
   authDomain:  "",
   projectId: "",
   StorageBucket: "",
   MessagingSenderId: "",
   appId: "",
   measurementId: ""
   ```
7. Click on ``` next ```
8. Run ``` npm install -g firebase-tools ```
9. Run ``` firebase deploy --only hosting:-your-own-value ```
10. Click on ``` Continue to console ```

The firebase has been setup

#### 3. Starting the project
To start the application run ``` npm run web ```, this will start the webapplication. 
This might take a while to initialize. After the web builder is complete a QR code will appear in the terminal, scan this with your mobile phone. this will open Expo go and the project will be on your phone.

## Usage

To enter the app you will have to register BUT there is a check that will only allow @ehb  and @stundet.ehb mails to register.
once logged in you will have the students view

### Admin usage
To become an admin you will have to change some information in the database itself, we did not add a feature for an easy first admin creation for safety messures

1. Open Firestore Database
2. You will se a Collection named Users, click on it
3. search for the account you want to make admin, click on it
4. On the bottom of the field list you will see a field ```role```
5. click on it and change the value from student to admin
6. The account is admin
7. (if you don't see an admin dashboard under profile you might have to restart the web application)

## Team
### Product owner
Amina Iqbal
### Frontend-Lead
Soufianne Hamoumi
### Backend Lead, Trello Maintainer, Github co-Maintainer 
Giles Synaeve
### Backend Dev, Github Maintainer, Trello co-Maintainer 
Mathis de Brouwer
### Database admin, Backend-dev
Bilal Bakkali


## Stack

Used react.js
Expo
Javascript
Typescript


