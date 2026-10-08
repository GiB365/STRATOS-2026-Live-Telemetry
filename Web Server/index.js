const launch_clock = document.getElementById("launch-clock");
const launch_time = new Date("2026-08-17T14:00:00Z").getTime();

function updateLaunchClock() {
    const now = new Date().getTime();
    const time_difference = launch_time - now;

    const hours = Math.abs(Math.floor((time_difference / (1000 * 60 * 60))));
    const minutes = Math.abs(Math.floor((time_difference % (1000 * 60 * 60)) / (1000 * 60)));
    const seconds = Math.abs(Math.floor((time_difference % (1000 * 60)) / 1000));
    const sign_symbol = time_difference > 0 ? "-" : "+";

    launch_clock.textContent = `T${sign_symbol}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

updateLaunchClock();
setInterval(updateLaunchClock, 1000);