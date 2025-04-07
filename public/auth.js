const API_BASE_URL = "http://localhost:3000";
let token = null;

// Wrapper function for API requests
async function apiRequest(url, options = {}) {
  const headers = options.headers || {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response.json();
}

// Handle Login
document.getElementById("login").addEventListener("submit", async (event) => {
  event.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const data = await apiRequest(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (data.success) {
      token = data.data; // Save the token
      alert("Login successful!");
      document.getElementById("loginForm").classList.add("d-none");
      document.getElementById("avatarForm").classList.remove("d-none");
      document.getElementById("logoutSection").classList.remove("d-none");
    } else {
      alert(data.message || "Login failed!");
    }
  } catch (error) {
    console.error("Error during login:", error);
    alert("An error occurred during login.");
  }
});

// Handle Change Avatar
document.getElementById("changeAvatar").addEventListener("submit", async (event) => {
  event.preventDefault();
  const avatarInput = document.getElementById("avatar");
  const formData = new FormData();
  formData.append("avatar", avatarInput.files[0]);

  try {
    const data = await apiRequest(`${API_BASE_URL}/auth/change_avatar`, {
      method: "POST",
      body: formData,
    });

    if (data.success) {
      alert("Avatar changed successfully!");
    } else {
      alert(data.message || "Failed to change avatar.");
    }
  } catch (error) {
    console.error("Error during avatar change:", error);
    alert("An error occurred while changing avatar.");
  }
});

// Handle Logout
document.getElementById("logout").addEventListener("click", () => {
  token = null;
  alert("Logged out successfully!");
  document.getElementById("loginForm").classList.remove("d-none");
  document.getElementById("avatarForm").classList.add("d-none");
  document.getElementById("logoutSection").classList.add("d-none");
});