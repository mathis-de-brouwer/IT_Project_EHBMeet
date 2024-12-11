import { db, dbRealtime } from './firebase_backup.js';
import {collection, addDoc, getDocs} from 'firebase/firestore';

async function addData(){
    try{
        const docRef = await addDoc(collection(db, "Users"),{
            UserName: "Adolf ",
            Description: "this is a test description"
        });

        const docRef1 = await addDoc(collection(db,"Events"),{
            User_id: "5",
            Participants: "4",
            Event_name : "Voetbal"
        })

    console.log("Document written with ID: ", docRef.id);
        } catch (e) {
            console.error("Error adding document: ", e);
        }        
        
}

async function getData() {
    const querySnapshot = await getDocs(collection(db, "users"));
    querySnapshot.forEach((doc) => {
      console.log(doc.id, " => ", doc.data()); // Logs the document ID and data
    });
}

addData();
getData();

