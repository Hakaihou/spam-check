import React from 'react';
import HLRcheck from './phone-check.js';
import EmailValidation from "./email-check";

function App() {
    return (
        <main className="main-container">
            <HLRcheck/>
            <EmailValidation/>
        </main>
    );
}

export default App;
