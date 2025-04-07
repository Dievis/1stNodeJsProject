async function fetchMenu() {
  try {
    const response = await fetch('/menus'); // Gọi API để lấy menu
    if (!response.ok) {
      throw new Error('Failed to fetch menu');
    }
    const menuData = await response.json();
    renderNavbar(menuData.data); // Giả định API trả về { data: [...] }
  } catch (error) {
    console.error('Error fetching menu:', error);
  }
}

function renderNavbar(menuItems) {
  const navbar = document.getElementById('navbar');
  menuItems.forEach(item => {
    const menuItem = document.createElement('li');
    menuItem.classList.add('nav-item', 'dropdown');

    const link = document.createElement('a');
    link.href = item.url; // URL từ API
    link.textContent = item.text; // Text từ API
    link.classList.add('nav-link', 'dropdown-toggle');
    link.setAttribute('data-bs-toggle', 'dropdown');
    menuItem.appendChild(link);

    // Nếu có menu con, tạo dropdown menu
    if (item.children && item.children.length > 0) {
      const dropdownMenu = document.createElement('ul');
      dropdownMenu.classList.add('dropdown-menu');
      item.children.forEach(child => {
        const childItem = document.createElement('li');
        const childLink = document.createElement('a');
        childLink.href = child.url;
        childLink.textContent = child.text;
        childLink.classList.add('dropdown-item');
        childItem.appendChild(childLink);
        dropdownMenu.appendChild(childItem);
      });
      menuItem.appendChild(dropdownMenu);
    }

    navbar.appendChild(menuItem);
  });
}

// Gọi API và hiển thị menu khi tải trang
fetchMenu();