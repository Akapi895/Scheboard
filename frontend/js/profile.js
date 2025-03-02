async function fetchProfileData() {
    try {
        const response = await fetch("https://api.example.com/user/profile"); 
        const raw_data = await response.json();
        const data = raw_data["data"];

        document.getElementById("avatar-img").src = data.avatar || "https://www.w3schools.com/howto/img_avatar.png";
        document.getElementById("username").textContent = data.username || "Username";
        document.getElementById("full-name").textContent = data.fullName || "N/A";
        document.getElementById("total-tasks").textContent = data.totalTasks || 0;
        document.getElementById("completion-rate").textContent = data.completionRate ? data.completionRate + "%" : "0%";
        document.getElementById("email").textContent = data.email || "N/A";
        document.getElementById("about-me").textContent = data.aboutMe || "No information available.";
        document.getElementById("learning-method").textContent = data.learningMethod || "Spaced Repitition";
    } catch (error) {
        console.error("Error fetching profile data:", error);
    }
}

window.onload = fetchProfileData;
