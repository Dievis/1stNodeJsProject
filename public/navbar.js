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
    menuItem.classList.add('nav-item');

    const link = document.createElement('a');
    link.href = '#'; // Không chuyển trang, chỉ tải nội dung
    link.textContent = item.text; // Text từ API
    link.classList.add('nav-link');
    link.addEventListener('click', () => loadContent(item.url)); // Tải nội dung khi nhấn
    menuItem.appendChild(link);

    // Nếu có menu con, tạo dropdown menu
    if (item.children && item.children.length > 0) {
      menuItem.classList.add('dropdown');
      link.classList.add('dropdown-toggle');
      link.setAttribute('data-bs-toggle', 'dropdown');

      const dropdownMenu = document.createElement('ul');
      dropdownMenu.classList.add('dropdown-menu');
      item.children.forEach(child => {
        const childItem = document.createElement('li');
        const childLink = document.createElement('a');
        childLink.href = '#';
        childLink.textContent = child.text;
        childLink.classList.add('dropdown-item');
        childLink.addEventListener('click', () => loadContent(child.url));
        childItem.appendChild(childLink);
        dropdownMenu.appendChild(childItem);
      });
      menuItem.appendChild(dropdownMenu);
    }

    navbar.appendChild(menuItem);
  });
}

async function loadContent(url) {
  try {
    const response = await fetch(url); // Tải nội dung từ URL
    if (!response.ok) {
      throw new Error('Failed to load content');
    }
    const content = await response.text();
    document.getElementById('content').innerHTML = content; // Hiển thị nội dung trong #content

    // Nếu URL là products.html, tải và thực thi products.js
    if (url === '/products.html') {
      const script = document.createElement('script');
      script.src = 'products.js'; // Đường dẫn đến file products.js
      script.type = 'text/javascript';
      script.onload = () => {
        console.log('products.js loaded');
        fetchProducts(); // Gọi hàm fetchProducts để hiển thị danh sách sản phẩm
      };
      document.body.appendChild(script);
    }
  } catch (error) {
    console.error('Error loading content:', error);
    document.getElementById('content').innerHTML = '<p>Error loading content.</p>';
  }
}

// Gọi API và hiển thị menu khi tải trang
fetchMenu();