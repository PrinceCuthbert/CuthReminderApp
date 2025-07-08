import React, { useState, useEffect } from "react";
import "./style.css";

export default function Reminder() {
  const [activityInput, setActivityInput] = useState("");
  const [datetimeInput, setDatetimeInput] = useState("");
  const [tasks, setTasks] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedActivity, setEditedActivity] = useState("");
  const [editedDatetime, setEditedDatetime] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeAlarms, setActiveAlarms] = useState(new Set());
  const [snoozedTasks, setSnoozedTasks] = useState(new Map());

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check for alarms (at exact scheduled time)
  useEffect(() => {
    const now = new Date();

    tasks.forEach((task, index) => {
      const taskDateTime = new Date(task.datetime);

      // Check if task is snoozed
      if (snoozedTasks.has(index)) {
        const snoozeUntil = snoozedTasks.get(index);
        if (now < snoozeUntil) {
          return; // Skip this task, it's still snoozed
        } else {
          // Snooze period ended, remove from snoozed tasks
          setSnoozedTasks((prev) => {
            const newMap = new Map(prev);
            newMap.delete(index);
            return newMap;
          });
        }
      }

      // Check if current time matches scheduled time (within 1 second accuracy)
      const timeDiff = Math.abs(now.getTime() - taskDateTime.getTime());

      if (timeDiff < 1000 && !activeAlarms.has(index)) {
        triggerAlarm(task, index);
      }
    });
  }, [currentTime, tasks, activeAlarms, snoozedTasks]);

  const triggerAlarm = (task, index) => {
    setActiveAlarms((prev) => new Set([...prev, index]));

    // Play initial attention sound
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const playBeep = (frequency, duration, delay) => {
      setTimeout(() => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = "sine";
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + duration
        );

        oscillator.start();
        oscillator.stop(audioContext.currentTime + duration);
      }, delay);
    };

    // Play attention beeps
    playBeep(800, 0.3, 0);
    playBeep(1000, 0.3, 400);

    // Create 1.5 minute speech announcement
    if ("speechSynthesis" in window) {
      const createLongSpeech = (activity) => {
        const messages = [
          `Attention! It's time to ${activity}`,
          `This is your reminder to ${activity}`,
          `Please start working on ${activity} now`,
          `Don't forget to ${activity}`,
          `Your scheduled activity is ${activity}`,
          `Time to focus on ${activity}`,
          `Please begin ${activity} immediately`,
          `Your task ${activity} is due now`,
          `Reminder: ${activity} should be completed now`,
          `Please attend to ${activity}`,
          `Your scheduled time for ${activity} has arrived`,
          `Time to complete ${activity}`,
          `Please proceed with ${activity}`,
          `Your reminder for ${activity} is active`,
          `Don't delay, start ${activity} now`,
        ];

        return messages;
      };

      const speechMessages = createLongSpeech(task.activity);
      let messageIndex = 0;
      let speechInterval;

      const speakMessage = () => {
        if (messageIndex < speechMessages.length && activeAlarms.has(index)) {
          const utterance = new SpeechSynthesisUtterance(
            speechMessages[messageIndex]
          );
          utterance.rate = 0.7;
          utterance.pitch = 1;
          utterance.volume = 0.8;
          utterance.voice =
            speechSynthesis
              .getVoices()
              .find((voice) => voice.lang === "en-US") ||
            speechSynthesis.getVoices()[0];

          utterance.onend = () => {
            messageIndex++;
            if (activeAlarms.has(index)) {
              speechInterval = setTimeout(() => {
                speakMessage();
              }, 3000);
            }
          };

          window.speechSynthesis.speak(utterance);
        }
      };

      // Start speaking after initial beeps
      setTimeout(() => {
        speakMessage();
      }, 1000);
    }

    // Remove from active alarms after 1.5 minutes (90 seconds)
    setTimeout(() => {
      setActiveAlarms((prev) => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
      // Stop any remaining speech
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    }, 90000);
  };

  const handleSnooze = (index, minutes = 5) => {
    // Stop current alarm
    setActiveAlarms((prev) => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });

    // Stop speech
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    // Set snooze time
    const snoozeUntil = new Date(Date.now() + minutes * 60 * 1000);
    setSnoozedTasks((prev) => {
      const newMap = new Map(prev);
      newMap.set(index, snoozeUntil);
      return newMap;
    });
  };

  const formatDateTime = (datetime) => {
    const date = new Date(datetime);
    return date.toLocaleString();
  };

  const getTaskStatus = (datetime, index) => {
    const now = new Date();
    const taskTime = new Date(datetime);

    if (snoozedTasks.has(index)) {
      const snoozeUntil = snoozedTasks.get(index);
      if (now < snoozeUntil) {
        return {
          status: "snoozed",
          text: `SNOOZED until ${snoozeUntil.toLocaleTimeString()}`,
          color: "text-info",
        };
      }
    }

    if (activeAlarms.has(index)) {
      return {
        status: "alarm-active",
        text: "ALARM ACTIVE!",
        color: "text-warning",
      };
    }

    if (now >= taskTime) {
      return { status: "overdue", text: "OVERDUE!", color: "text-danger" };
    } else {
      return { status: "scheduled", text: "", color: "text-muted" };
    }
  };

  function handleSubmit() {
    if (activityInput && datetimeInput) {
      const newItem = { activity: activityInput, datetime: datetimeInput };
      const updatedTasks = [...tasks, newItem];

      setTasks(updatedTasks);
      setActivityInput("");
      setDatetimeInput("");
    }
  }

  function handleClearAll() {
    setTasks([]);
    setActiveAlarms(new Set());
    setSnoozedTasks(new Map());
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }

  function handleDelete(index) {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
    setActiveAlarms((prev) => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
    setSnoozedTasks((prev) => {
      const newMap = new Map(prev);
      newMap.delete(index);
      return newMap;
    });
  }

  function handleEdit(index) {
    setEditingIndex(index);
    setEditedActivity(tasks[index].activity);
    setEditedDatetime(tasks[index].datetime);
  }

  function handleSaveEdit(index) {
    const updatedTasks = [...tasks];
    updatedTasks[index] = {
      activity: editedActivity,
      datetime: editedDatetime,
    };

    setTasks(updatedTasks);
    setEditingIndex(null);
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Reminder App</h1>
        <div className="current-time">
          Current Time: {currentTime.toLocaleString()}
        </div>
      </div>

      <div className="input-container">
        <div className="input-row">
          <div className="input-group">
            <label className="input-label">Activity</label>
            <input
              className="input-field"
              placeholder="Type your activity"
              value={activityInput}
              onChange={(e) => setActivityInput(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Date and Time</label>
            <input
              type="datetime-local"
              className="input-field"
              value={datetimeInput}
              onChange={(e) => setDatetimeInput(e.target.value)}
            />
          </div>
        </div>

        <button onClick={handleSubmit} className="btn-primary">
          Add Reminder
        </button>
      </div>

      <div className="tasks-header">
        <h2 className="tasks-title">Your Reminders</h2>
        {tasks.length > 0 && (
          <button onClick={handleClearAll} className="btn-danger">
            Clear All
          </button>
        )}
      </div>

      <div className="tasks-container">
        {tasks.map((task, index) => {
          const taskStatus = getTaskStatus(task.datetime, index);
          return (
            <div key={index} className={`task-item ${taskStatus.status}`}>
              {editingIndex === index ? (
                <div className="edit-form">
                  <input
                    className="input-field"
                    value={editedActivity}
                    onChange={(e) => setEditedActivity(e.target.value)}
                    placeholder="Edit activity"
                  />
                  <input
                    type="datetime-local"
                    className="input-field"
                    value={editedDatetime}
                    onChange={(e) => setEditedDatetime(e.target.value)}
                  />
                  <div className="edit-actions">
                    <button
                      onClick={() => handleSaveEdit(index)}
                      className="btn-success">
                      Save
                    </button>
                    <button
                      onClick={() => setEditingIndex(null)}
                      className="btn-secondary">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="task-content">
                  <div className="task-info">
                    <h3 className="task-title">{task.activity}</h3>
                    <p className="task-datetime">
                      📅 {formatDateTime(task.datetime)}
                    </p>
                    {taskStatus.text && (
                      <span className={`task-status ${taskStatus.status}`}>
                        {taskStatus.text}
                      </span>
                    )}
                  </div>
                  <div className="task-actions">
                    {activeAlarms.has(index) && (
                      <>
                        <button
                          onClick={() => handleSnooze(index, 5)}
                          className="btn-warning">
                          Snooze 5min
                        </button>
                        <button
                          onClick={() => handleSnooze(index, 10)}
                          className="btn-warning">
                          Snooze 10min
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleEdit(index)}
                      className="btn-secondary">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="btn-danger">
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {tasks.length === 0 && (
          <div className="no-tasks">
            <div className="no-tasks-icon">📝</div>
            <div className="no-tasks-text">No reminders yet</div>
            <div className="no-tasks-subtext">
              Add one above to get started!
            </div>
          </div>
        )}
      </div>

      {/* Snooze Notifications */}
      {Array.from(snoozedTasks.entries()).map(([index, snoozeUntil]) => (
        <div key={index} className="snooze-notification">
          <strong>🔕 Reminder Snoozed</strong>
          <div className="snooze-info">
            {tasks[index]?.activity} - until {snoozeUntil.toLocaleTimeString()}
          </div>
        </div>
      ))}
    </div>
  );
}
