import { db } from './firebase_backup.js';
import { collection, addDoc, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';

// Function to add a new user if User_ID doesn't exist
async function addUserIfNotExists(UserData) {
    const { User_ID, ...restData } = UserData;
    const usersCollectionRef = collection(db, 'Users');

    // Check if the User_ID already exists
    // Ensure Firestore has an index on the 'User_ID' field to optimize this query
    const q = query(usersCollectionRef, where('User_ID', '==', User_ID));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        try {
            const docRef = await addDoc(usersCollectionRef, {
                User_ID, // User-provided ID for reference
                ...restData
            });
            console.log("User added with Document ID: ", docRef.id);
        } catch (e) {
            console.error("Error adding user: ", e);
        }
    } else {
        console.log("User with this User_ID already exists!");
    }
}

// Function to get all data from 'Users' and 'Event' collections
async function getData() {
    try {
        const usersSnapshot = await getDocs(collection(db, "Users"));
        usersSnapshot.forEach((docSnapshot) => {
            const userData = docSnapshot.data(); // Fetch data using the .data() method
            console.log(docSnapshot.id, " => ", userData);
        });

        const eventsSnapshot = await getDocs(collection(db, "Event"));
        eventsSnapshot.forEach((docSnapshot) => {
            const eventData = docSnapshot.data();
            console.log(docSnapshot.id, " => ", eventData);
        });
    } catch (e) {
        console.error("Error fetching data: ", e);
    }
}

// Function to edit user data
async function editData(userId, updatedData) {
    if (!userId || typeof userId !== 'string') {
        console.error("Invalid userDocumentId provided. It must be a non-empty string.");
        return;
    }
    const userRef = doc(db, 'Users', userId);
    try {
        const docSnapshot = await getDocs(userRef);
        if (!docSnapshot.exists()) {
            console.error("No user found with the provided ID.");
            return;
        }
        await updateDoc(userRef, updatedData);
        console.log("Successfully updated");
    } catch (e) {
        console.error("Error updating document: ", e);
    }
}

// Example
async function runExamples() {
    // Add new user (ensure User_ID is unique)
    await addUserIfNotExists({
        User_ID: "4",
        Blacklisted: true,
        Description: "This is a test",
        First_Name: "Rudiger-Francis verstappen",
        Second_name: "yamaaaaa",
        Discord_name: "Alber Hein",
        Password: "examplePassword",
        Profile_Picture: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.reddit.com%2Fr%2FCursed_Images%2Fcomments%2Fsr1b5a%2Fcursed_toad%2F&psig=AOvVaw3AdJAVtmNIaRbT1r2xDc46&ust=1734015962609000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCIiryP3-n4oDFQAAAAAdAAAAABAE",
        Steam_name: "AdolfH",
        email: "adolf.Deridder@student.ehb.be"
    });
    await getData();
    await editData('userDocumentId', {
        Description: "Updated description"
    });
}

runExamples();