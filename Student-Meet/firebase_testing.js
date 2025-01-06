import { db, dbRealtime } from './firebase_backup.js';
import {collection, addDoc, getDocs, updateDoc, doc, query, where} from 'firebase/firestore';
