const API_BASE_URL = "http://localhost:3000/products";

// Fetch and display product list
async function fetchProducts() {
  try {
    const response = await fetch(API_BASE_URL);
    const products = await response.json();
    const productTableBody = document.getElementById("productTableBody");
    productTableBody.innerHTML = ""; // Clear existing rows

    products.forEach((product, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${product.name}</td>
        <td>${product.price}</td>
        <td>${product.quantity}</td>
        <td>${product.category?.name || "N/A"}</td>
        <td>
          <button class="btn btn-warning btn-sm" onclick="editProduct('${product._id}')">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteProduct('${product._id}')">Delete</button>
        </td>
      `;
      productTableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error fetching products:", error);
  }
}

// Add a new product
document.getElementById("addProduct").addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = document.getElementById("productName").value;
  const price = document.getElementById("productPrice").value;
  const quantity = document.getElementById("productQuantity").value;
  const category = document.getElementById("productCategory").value;

  try {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, price, quantity, category }),
    });

    const data = await response.json();
    if (data.success) {
      alert("Product added successfully!");
      fetchProducts(); // Refresh product list
    } else {
      alert(data.message || "Failed to add product.");
    }
  } catch (error) {
    console.error("Error adding product:", error);
  }
});

// Edit a product
async function editProduct(productId) {
  const name = prompt("Enter new name:");
  const price = prompt("Enter new price:");
  const quantity = prompt("Enter new quantity:");
  const category = prompt("Enter new category:");

  try {
    const response = await fetch(`${API_BASE_URL}/${productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, price, quantity, category }),
    });

    const data = await response.json();
    if (data.success) {
      alert("Product updated successfully!");
      fetchProducts(); // Refresh product list
    } else {
      alert(data.message || "Failed to update product.");
    }
  } catch (error) {
    console.error("Error updating product:", error);
  }
}

// Delete a product
async function deleteProduct(productId) {
  if (!confirm("Are you sure you want to delete this product?")) return;

  try {
    const response = await fetch(`${API_BASE_URL}/${productId}`, {
      method: "DELETE",
    });

    const data = await response.json();
    if (data.success) {
      alert("Product deleted successfully!");
      fetchProducts(); // Refresh product list
    } else {
      alert(data.message || "Failed to delete product.");
    }
  } catch (error) {
    console.error("Error deleting product:", error);
  }
}

// Fetch products on page load
fetchProducts();