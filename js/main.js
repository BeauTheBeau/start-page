// =============================================================================
// Multi-line Clock
// =============================================================================

/**
 * @name updateClock
 * @description Updates the clock element with the current time.
 * @param {Object} hourElement - The hour element.
 * @param {Object} minuteElement - The minute element.
 * @param {Object} date - The date object.
 * @returns {undefined}
 */

function updateClock(hourElement, minuteElement, date) {
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');

  hourElement.innerHTML = hour;
  minuteElement.innerHTML = minute;
}

/**
 * @name updateDate
 * @description Updates the date element with the current date.
 * @param {Object} dateElement - The date element.
 * @param {Object} date - The date object.
 */

function updateDate(dateElement, date) {
  const day = date.toLocaleString('en-gb', { weekday: 'long' });
  const dayOfMonth = date.getDate();
  const month = date.toLocaleString('en-gb', { month: 'short' });

  dateElement.innerHTML = `${day}, ${dayOfMonth} ${month}`;

}

// Every second, update the clock
setInterval(() => {
  const date = new Date();
  const hourElement = document.querySelector('.hour');
  const minuteElement = document.querySelector('.minute');
  const dateElement = document.querySelector('#date');

  updateClock(hourElement, minuteElement, date);
  updateDate(dateElement, date);

}, 100);

