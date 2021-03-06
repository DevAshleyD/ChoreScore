import {
  fetchListData,
  refreshDashboard,
  submitListForm,
  submitChoreForm,
  clearColumn3
} from "./publicUtils.js";

document.addEventListener("DOMContentLoaded", async () => {
  const data = await fetchListData();
  refreshDashboard(data);
  const list = document.querySelector(".list-form");
  list.addEventListener("submit", async (event) => {
    event.preventDefault();
    submitListForm();
    const data = await fetchListData();
    list.reset();
    refreshDashboard(data);
  });

  const chores = document.querySelector(".chore-form");
  chores.addEventListener("submit", async (event) => {
    event.preventDefault();
    submitChoreForm();
    const data = await fetchListData();
    chores.reset();
    document.querySelector(".modal").classList.add("hidden");
  });

    clearColumn3();
});
