document.addEventListener("DOMContentLoaded", async () => {
  console.log("hello from javascript!");

  document.querySelector(".nav__logout-button").addEventListener("click", async () => {
    const res = await fetch("/users/logout", {
      credentials: "same-origin",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      const err = new Error("Try again later.");
      err.status = 500;
      err.message = "Fail to logout";
      err.title = "Logout error";
      throw err;
    }
    window.location.href = "http://localhost:8080/";
  });
});
