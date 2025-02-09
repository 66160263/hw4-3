document.addEventListener("DOMContentLoaded", function () {
    displayAppointments();
    
    document.getElementById("appointment-form").addEventListener("submit", function (e) {
        e.preventDefault();
        
        const appointment = {
            id: Date.now().toString(),
            title: document.getElementById("title").value,
            date: document.getElementById("date").value,
            startTime: document.getElementById("startTime").value,
            endTime: document.getElementById("endTime").value,
            status: "confirmed"
        };
        
        createAppointment(appointment);
        displayAppointments();
        this.reset();
    });
});

function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error("Error saving to localStorage:", error);
    }
}

function getFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Error reading from localStorage:", error);
        return [];
    }
}

function checkTimeConflict(startTime, endTime, date) {
    const appointments = getFromLocalStorage("appointments");
    return appointments.some(appt => appt.date === date &&
        ((startTime >= appt.startTime && startTime < appt.endTime) ||
         (endTime > appt.startTime && endTime <= appt.endTime)));
}

function createAppointment(appointmentData) {
    let appointments = getFromLocalStorage("appointments");

    if (!appointmentData.title || !appointmentData.date || !appointmentData.startTime || !appointmentData.endTime) {
        console.error("Invalid appointment data");
        return;
    }

    const isConflict = checkTimeConflict(appointmentData.startTime, appointmentData.endTime, appointmentData.date);
    if (isConflict) {
        appointmentData.conflict = true;
    }

    appointments.push(appointmentData);
    saveToLocalStorage("appointments", appointments);
}

function cancelAppointment(appointmentId) {
    let appointments = getFromLocalStorage("appointments");
    appointments = appointments.map(appt => appt.id === appointmentId ? { ...appt, status: "cancelled" } : appt);
    saveToLocalStorage("appointments", appointments);
    displayAppointments();
}

function displayAppointments() {
    const appointments = getFromLocalStorage("appointments");
    const appointmentList = document.getElementById("appointment-list");
    appointmentList.innerHTML = "";

    const today = new Date().toISOString().split('T')[0];
    const upcoming = appointments.filter(appt => appt.date >= today);

    upcoming.forEach(appt => {
        const li = document.createElement("li");
        li.innerHTML = `${appt.title} - ${appt.date} ${appt.startTime}-${appt.endTime}`;
        
        if (appt.conflict) {
            li.classList.add("conflict");
            li.innerHTML += " ⚠️";
        }
        
        if (appt.status === "cancelled") {
            li.classList.add("cancelled");
        }

        const cancelBtn = document.createElement("button");
        cancelBtn.textContent = "ยกเลิก";
        cancelBtn.onclick = function () {
            cancelAppointment(appt.id);
        };

        li.appendChild(cancelBtn);
        appointmentList.appendChild(li);
    });
}
