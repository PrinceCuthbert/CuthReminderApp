import React, { useState, useEffect } from "react";

import "./App.css";

export default function Note() {
  const [activityInput, setActivityInput] = useState("");
  const [timeInput, setTimeInput] = useState("");
  const [tasks, setTasks] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedActivity, setEditedActivity] = useState("");
  const [editedTime, setEditedTime] = useState("");
  const [notifiedTasks, setNotifiedTasks] = useState([]);

  // Preload the alarm sound
  const alarmSound = new Audio("https://www.soundjay.com/button/beep-07.wav");

  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = now.toISOString().slice(0, 16); // 'YYYY-MM-DDTHH:MM'

      tasks.forEach((task, index) => {
        if (task.time === currentTime && !notifiedTasks.includes(index)) {
          alarmSound.play();
          setNotifiedTasks((prev) => [...prev, index]);
        }
      });
    }, 60000); // every 1 minute

    return () => clearInterval(interval);
  }, [tasks, notifiedTasks]);

  function handleSubmit() {
    if (activityInput && timeInput) {
      const newItem = { activity: activityInput, time: timeInput };
      const updatedTasks = [...tasks, newItem];

      setTasks(updatedTasks);
      localStorage.setItem("tasks", JSON.stringify(updatedTasks));
      // Save to local storage

      setActivityInput("");
      setTimeInput("");
    }
  }

  function handleClearAll() {
    setTasks([]);
    localStorage.removeItem("tasks");
  }

  function handleDelete(index) {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
  }

  function handleEdit(index) {
    setEditingIndex(index);
    setEditedActivity(tasks[index].activity);
    setEditedTime(tasks[index].time);
  }

  function handleSaveEdit(index) {
    const updatedTasks = [...tasks];
    updatedTasks[index] = { activity: editedActivity, time: editedTime };

    setTasks(updatedTasks);
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));

    setEditingIndex(null);
  }
  return (
    <>
      <div className="container">
        <div className="header">
          <h1>Reminder App</h1>
        </div>

        <div className="input-container">
          <div className="input-div">
            <input
              placeholder="type your activity"
              value={activityInput}
              onChange={(e) => setActivityInput(e.target.value)}></input>
          </div>

          <div className="input-div">
            <input
              type="datetime-local"
              placeholder="Type the scheduled time"
              value={timeInput}
              onChange={(e) => setTimeInput(e.target.value)}></input>
            <button onClick={handleSubmit}>Submit</button>
          </div>

          <h1 className="task-title">The Tasks</h1>
        </div>

        {tasks.map((task, index) => (
          <div key={index} className="tasks-post">
            <ul className="list-items">
              {editingIndex === index ? (
                <>
                  <li>
                    <input
                      value={editedActivity}
                      onChange={(e) => setEditedActivity(e.target.value)}
                      placeholder="Edit activity"
                    />
                  </li>
                  <li>--</li>
                  <li>
                    <input
                      value={editedTime}
                      onChange={(e) => setEditedTime(e.target.value)}
                      placeholder="Edit time"
                    />
                  </li>
                  <li>
                    <button onClick={() => handleSaveEdit(index)}>Save</button>
                    <button onClick={() => setEditingIndex(null)}>
                      Cancel
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>{task.activity}</li>
                  <li>--</li>
                  <li>{task.time}</li>
                  <li>
                    <button onClick={() => handleEdit(index)}>Edit</button>
                    <button onClick={() => handleDelete(index)}>Delete</button>
                  </li>
                </>
              )}
            </ul>
          </div>
        ))}
        <button onClick={handleClearAll}>Clear All</button>
        <button onClick={() => alarmSound.play()}>Test Alarm Sound</button>
      </div>
    </>
  );
}
