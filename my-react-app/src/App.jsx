import React, { useState } from "react";

import "./App.css";

export default function App() {
  return (
    <div className="App">
      <Counter />
    </div>
  );
}

function Counter() {
  // count use state
  const [count, setCount] = useState(0);
  const date = new Date();
  const futureDate = new Date();
  futureDate.setDate(date.getDate() + count);
  const future = date.getDate() >= 1 || date.getDate() === 0;
  const pastDays = date.getDate() < 0;

  function IncrementCounter() {
    setCount((prevCount) => prevCount + 1);
  }

  function DecrementCounter() {
    setCount((prevCount) => prevCount - 1);
  }
  return (
    <div>
      <div>
        <button>-</button>
        <span>Step:5</span>
        <button>+</button>
      </div>
      <div>
        <button onClick={DecrementCounter}>-</button>
        <span>Count:{count}</span>
        <button onClick={IncrementCounter}>+</button>
      </div>
      {count >= 0 ? (
        <p>
          {count} days from today is {futureDate.toDateString()}
        </p>
      ) : (
        <p>
          {Math.abs(count)} days ago from today was {futureDate.toDateString()}
        </p>
      )}
    </div>
  );
}
