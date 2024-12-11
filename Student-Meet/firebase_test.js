import { db, dbRealtime } from './firebase_backup.js';
import {collection, addDoc, getDocs, updateDoc, doc, query, where} from 'firebase/firestore';

async function addData(){
    try{
        const docRef = await addDoc(collection(db, "Users"),{
            User_ID: (db,"Users"),
            Blacklisted:false,
            Description: " this is a test",
            First_Name: "Adolf ",
            Second_name:"De Ridder",
            Discord_name: "Alber Hein",
            Password: "ejrnfekjrfnek",
            Profile_Picture: "picture ", 
            Steam_name: "AdolfH",
            email: "adolf.Deridder@student.ehb.be"
        });

        const docRef1 = await addDoc(collection(db,"Event"),{
            Categoty_id: "1",
            Date: "11 September 2001",
            Description: " This is an event only for pro pilots" ,
            Event_Title:"the towers",
            Event_picture: "data:",
            Location: "Brussels, Metro system",
            Max_Participants: "7",
            Phone_Number: "+23 469 515451", 
            User_ID: "15"
            
        });

    console.log("Document written with ID: ", docRef.id);
        } catch (e) {
            console.error("Error adding document: ", e);
        }        

}


// change data in Firebase: 
async function editData(){
    const userRef = doc(db,'Users','I0aXmPLIp0vozT4z6cZR')
    try{
        await updateDoc(userRef,{
            Description: " NOOOOOOO"
        });
        console.log("succesfully updated");
    } catch(e){
        console.error("Error occured: " + e);
    }
}



async function addUserIfNotExists(User_ID) {
    const usersCollectionRef = collection(db, 'Users');

    const q = query(usersCollectionRef, where('User_ID', '==', User_ID));

    // Get documents that match the query
    const querySnapshot = await getDocs(q);

    // If there are no documents, it means the user doesn't exist and we can add the new user
    if (querySnapshot.empty) {
        try {
            // Add the new user to the "Users" collection
            const docRef = await addDoc(usersCollectionRef, {
                User_ID: User_ID,
                Description: description
            });
            console.log("User added with ID: ", docRef.id);
        } catch (e) {
            console.error("Error adding user: ", e);
        }
    } else {
        // If there are matching documents, inform the user that the username already exists
        console.log("User with this name already exists!");
    }
}
    
async function getData() {
    const querySnapshot = await getDocs(collection(db, "Users"));
    querySnapshot.forEach((doc) => {
      console.log(doc.id, " => ", doc.data()); // Logs the document ID and data
    });

    const querySnapshot1 = await getDocs(collection(db, "Event"));
    querySnapshot1.forEach((doc) => {
        console.log(doc.id, " => ", doc.data()); // Logs the document ID and data
        });

}


addData();
getData();
editData();

