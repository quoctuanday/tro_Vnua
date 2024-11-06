import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: 'AIzaSyCwsWTvPppjrAmIaZ9Vgwle0CIzoYZIStk',
    authDomain: 'web-novel-e3a0a.firebaseapp.com',
    projectId: 'web-novel-e3a0a',
    storageBucket: 'web-novel-e3a0a.appspot.com',
    messagingSenderId: '1082494054041',
    appId: '1:1082494054041:web:49a1b9a577f6c90674d208',
    measurementId: 'G-CC4DMPYS2S',
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };
