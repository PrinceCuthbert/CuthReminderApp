import React, { useState } from "react";

import "./App.css";
import Note from "./Note.jsx";
import Reminder from "./Reminder.jsx";

export default function App() {
  return (
    <div className="App">
      {/* <Note /> */}
      <Reminder />
    </div>
  );
}
