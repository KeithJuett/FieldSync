(() => {
  const rotation = ["Mark", "Keith", "Alex", "Dave", "Robert"];
  const reference = Date.UTC(2026, 8, 21); // Mark's Monday-to-Sunday week.
  const dayMs = 86400000;
  const dialog = document.getElementById("calendarDialog");
  const months = document.getElementById("calendarMonths");
  const trigger = document.getElementById("calendarTrigger");
  if (!dialog || !months || !trigger) return;

  function easternToday() {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York", year: "numeric", month: "numeric", day: "numeric"
    }).formatToParts(new Date());
    const value = type => Number(parts.find(part => part.type === type).value);
    return { year: value("year"), month: value("month") - 1, day: value("day") };
  }
  function technician(utcDay) {
    const weeks = Math.floor((utcDay - reference) / (7 * dayMs));
    return rotation[((weeks % rotation.length) + rotation.length) % rotation.length];
  }
  function render() {
    const today = easternToday();
    const todayUTC = Date.UTC(today.year, today.month, today.day);
    months.replaceChildren();
    for (let offset = 0; offset < 3; offset++) {
      const first = new Date(Date.UTC(today.year, today.month + offset, 1));
      const year = first.getUTCFullYear();
      const month = first.getUTCMonth();
      const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
      const section = document.createElement("section");
      section.className = "calendar-month";
      const heading = document.createElement("h3");
      heading.textContent = first.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
      section.append(heading);
      const grid = document.createElement("div");
      grid.className = "calendar-grid";
      for (const label of ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]) {
        const weekday = document.createElement("div");
        weekday.className = "calendar-weekday";
        weekday.textContent = label;
        grid.append(weekday);
      }
      for (let i = 0; i < (first.getUTCDay() + 6) % 7; i++) {
        const blank = document.createElement("div");
        blank.className = "calendar-empty";
        grid.append(blank);
      }
      for (let day = 1; day <= days; day++) {
        const utcDay = Date.UTC(year, month, day);
        const cell = document.createElement("div");
        cell.className = "calendar-day" + (utcDay === todayUTC ? " is-today" : "");
        const number = document.createElement("span");
        number.className = "calendar-date";
        number.textContent = day;
        const name = document.createElement("span");
        name.className = "calendar-tech";
        name.textContent = technician(utcDay);
        cell.append(number, name);
        grid.append(cell);
      }
      section.append(grid);
      months.append(section);
    }
  }
  trigger.addEventListener("click", () => { render(); dialog.showModal(); });
  dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
  // Keep the button aligned with the same Eastern calendar date as the modal.
  function updateSummary() {
    const today = easternToday();
    const utcDay = Date.UTC(today.year, today.month, today.day);
    const week = Math.floor((utcDay - reference) / (7 * dayMs));
    const start = reference + week * 7 * dayMs;
    const fmt = date => new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
    document.getElementById("onCallName").textContent = technician(utcDay);
    document.getElementById("onCallDates").textContent = `${fmt(start)} – ${fmt(start + 6 * dayMs)}`;
    document.getElementById("nextOnCall").textContent = `Next: ${technician(start + 7 * dayMs)} — ${fmt(start + 7 * dayMs)}`;
  }
  updateSummary();
  window.addEventListener("pageshow", updateSummary);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) updateSummary(); });
})();
