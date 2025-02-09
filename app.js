// ฟังก์ชันสำหรับจัดการการนัดหมาย
function createAppointment(appointmentData) {
    // ตรวจสอบการกรอกข้อมูล
    if (!appointmentData.title || !appointmentData.date || !appointmentData.startTime || !appointmentData.endTime) {
      console.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
  
    // ตรวจสอบวันที่ไม่เกินวันปัจจุบัน
    const today = new Date().toISOString().split('T')[0];
    if (appointmentData.date < today) {
      console.error("วันที่ไม่สามารถเป็นอดีตได้");
      return;
    }
  
    // ตรวจสอบเวลาขั้นต่ำ
    if (appointmentData.startTime >= appointmentData.endTime) {
      console.error("เวลาเริ่มต้นต้องน้อยกว่าเวลาสิ้นสุด");
      return;
    }
  
    // ตรวจสอบเวลาไม่ซ้ำซ้อน
    if (checkTimeConflict(appointmentData.startTime, appointmentData.endTime)) {
      console.error("เวลานัดหมายซ้ำกับการนัดหมายอื่น");
      return;
    }
  
    // สร้าง ID แบบสุ่ม
    appointmentData.id = "id-" + Date.now();
  
    // บันทึกลง LocalStorage
    let appointments = getFromLocalStorage("appointments") || [];
    appointments.push(appointmentData);
    saveToLocalStorage("appointments", appointments);
    console.log("นัดหมายถูกเพิ่มเรียบร้อยแล้ว");
    renderAppointments();
  }
  
  function checkTimeConflict(startTime, endTime) {
    let appointments = getFromLocalStorage("appointments") || [];
    for (let appt of appointments) {
      const apptStartTime = appt.startTime;
      const apptEndTime = appt.endTime;
  
      // เปรียบเทียบเวลานัดหมาย
      if ((startTime >= apptStartTime && startTime < apptEndTime) || (endTime > apptStartTime && endTime <= apptEndTime)) {
        return true;
      }
    }
    return false;
  }
  
  function cancelAppointment(appointmentId) {
    let appointments = getFromLocalStorage("appointments") || [];
    for (let appt of appointments) {
      if (appt.id === appointmentId) {
        appt.status = "cancelled";
        saveToLocalStorage("appointments", appointments);
        console.log("นัดหมายถูกยกเลิกแล้ว");
        renderAppointments();
        return;
      }
    }
    console.error("ไม่พบการนัดหมายที่ต้องการยกเลิก");
  }
  
  function getUpcomingAppointments() {
    let appointments = getFromLocalStorage("appointments") || [];
    const today = new Date().toISOString().split('T')[0];
  
    const upcomingAppointments = appointments.filter(appt => appt.date >= today);
  
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = tomorrow.toISOString().split('T')[0];
  
    const upcomingTomorrowAppointments = upcomingAppointments.filter(appt => appt.date === tomorrowDate);
  
    return upcomingTomorrowAppointments;
  }
  
  function renderAppointments() {
    const appointmentsList = document.getElementById("appointmentsList");
    appointmentsList.innerHTML = "";
    
    let appointments = getFromLocalStorage("appointments") || [];
  
    appointments.forEach(appt => {
      const li = document.createElement("li");
      li.textContent = `${appt.title} - ${appt.date} ${appt.startTime} - ${appt.endTime}`;
      if (appt.status === "cancelled") {
        li.classList.add("cancelled");
      }
      if (checkTimeConflict(appt.startTime, appt.endTime)) {
        li.classList.add("conflict");
      }
      appointmentsList.appendChild(li);
    });
  
    const upcomingAppointments = getUpcomingAppointments();
    const upcomingAppointmentsList = document.getElementById("upcomingAppointments");
    upcomingAppointmentsList.innerHTML = "";
  
    upcomingAppointments.forEach(appt => {
      const li = document.createElement("li");
      li.textContent = `${appt.title} - ${appt.date} ${appt.startTime}`;
      upcomingAppointmentsList.appendChild(li);
    });
  }
  
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
  
  // เรียกใช้ฟังก์ชันเมื่อโหลดหน้า
  document.addEventListener("DOMContentLoaded", () => {
    renderAppointments();
    
    const createForm = document.getElementById("createForm");
    createForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const title = document.getElementById("title").value;
      const date = document.getElementById("date").value;
      const startTime = document.getElementById("startTime").value;
      const endTime = document.getElementById("endTime").value;
  
      const newAppointment = {
        title,
        date,
        startTime,
        endTime,
        status: "confirmed",
      };
      
      createAppointment(newAppointment);
    });
  });
  