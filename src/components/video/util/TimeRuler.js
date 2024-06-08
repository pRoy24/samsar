import React from 'react';

const TimeRuler = ({ totalDuration }) => {
  const ticks = [];
  const tickInterval = 1; // Interval for ticks in seconds

  for (let i = 0; i < totalDuration; i += tickInterval) {
    ticks.push(
      <div key={i} className="time-ruler-tick" style={{ height: `${100 * tickInterval / totalDuration}%` }}>
        {i % 1 === 0 ? `${i}s` : ''}
      </div>
    );
  }

  return (
    <div className="time-ruler">
      {ticks}
    </div>
  );
};

export default TimeRuler;
