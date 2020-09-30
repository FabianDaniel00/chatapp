import React, { useState, useRef, useEffect } from 'react';
import './App.css';

import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import 'firebase/analytics';

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

firebase.initializeApp({
  apiKey: "AIzaSyBfnXX7lCx0U7ZlD5mFJYowIGICJZ-dQKA",
  authDomain: "first-chat-app-55c27.firebaseapp.com",
  databaseURL: "https://first-chat-app-55c27.firebaseio.com",
  projectId: "first-chat-app-55c27",
  storageBucket: "first-chat-app-55c27.appspot.com",
  messagingSenderId: "601272696044",
  appId: "1:601272696044:web:8b05c92359a389ba1eb9c9",
  measurementId: "G-26J6E6FJLX"
});

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
  );
}

function SignOut() {
  return auth.currentUser && (
    <button className="sign out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom() {
  const dummy = useRef();

  const messageRef = firestore.collection("messages");
  const query = messageRef.orderBy("createdAt").limit(50);

  const [messages] = useCollectionData(query, {idField: "id"});

  const [formValue, setFormValue] = useState(String);
  const [sendLoading, setSendLoading] = useState(Boolean);

  useEffect(() => {
    dummy.current.scrollIntoView({ behavior: "smooth" });
  });

  const sendMessage = async(event) => {
    event.preventDefault();

    setSendLoading(true);

    const { uid, photoURL } = auth.currentUser;

    await messageRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    });

    setFormValue("");
    setSendLoading(false);

    dummy.current.scrollIntoView({ behavior: "smooth" });
  }

  return(
    <>
      <main>
        {messages &&
          messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

          <span ref={dummy} />
      </main>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(event) => setFormValue(event.target.value)}
        />
        <button disabled={sendLoading || !formValue} type="submit">{sendLoading ? <i className="fas fa-spinner fa-spin" /> :
          <i className="fas fa-paper-plane" />}
        </button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  return(
    <div className={`message ${messageClass}`}>
      <img src={photoURL || "https://api.adorable.io/avatars/23/abott@adorable.png"} />
      <p>{text}</p>
    </div>
  );
}

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>Mateszopszki Peter</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

export default App;
