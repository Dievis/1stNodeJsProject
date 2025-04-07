const CATEGORY_API_BASE_URL = "http://localhost:3000/categories";

// Fetch and display category list
async function fetchCategories() {
  try {
    const response = await fetch(CATEGORY_API_BASE_URL);
    const categories = await response.json();
    const categoryTableBody = document.getElementById("categoryTableBody");
    categoryTableBody.innerHTML = ""; // Clear existing rows

    categories.forEach((category, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${category.name}</td>
        <td>${category.slug}</td>
        <td>
          <button class="btn btn-warning btn-sm" onclick="editCategory('${category._id}')">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteCategory('${category._id}')">Delete</button>
        </td>
      `;
      categoryTableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
}

// Add a new category
document.getElementById("addCategory").addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = document.getElementById("categoryName").value;

  try {
    const response = await fetch(CATEGORY_API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });

    const data = await response.json();
    if (data.success) {
      alert("Category added successfully!");
      fetchCategories(); // Refresh category list
    } else {
      alert(data.message || "Failed to add category.");
    }
  } catch (error) {
    console.error("Error adding category:", error);
  }
});

// Edit a category
async function editCategory(categoryId) {
  const name = prompt("Enter new name:");

  try {
    const response = await fetch(`${CATEGORY_API_BASE_URL}/${categoryId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });

    const data = await response.json();
    if (data.success) {
      alert("Category updated successfully!");
      fetchCategories(); // Refresh category list
    } else {
      alert(data.message || "Failed to update category.");
    }
  } catch (error) {
    console.error("Error updating category:", error);
  }
}

// Delete a category
async function deleteCategory(categoryId) {
  if (!confirm("Are you sure you want to delete this category?")) return;

  try {
    const response = await fetch(`${CATEGORY_API_BASE_URL}/${categoryId}`, {
      method: "DELETE",
    });

    const data = await response.json();
    if (data.success) {
      alert("Category deleted successfully!");
      fetchCategories(); // Refresh category list
    } else {
      alert(data.message || "Failed to delete category.");
    }
  } catch (error) {
    console.error("Error deleting category:", error);
  }
}

// Fetch categories on page load
fetchCategories();