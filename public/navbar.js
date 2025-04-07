async function fetchMenu() {
  try {
    const response = await fetch('/menus'); // Gọi API để lấy menu
    if (!response.ok) {
      throw new Error('Failed to fetch menu');
    }
    const menuData = await response.json();
    console.log(menuData); // Kiểm tra dữ liệu trả về
    renderNavbar(menuData.data); // Hiển thị menu
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
    link.href = item.url; // URL từ API
    link.textContent = item.text; // Text từ API
    link.classList.add('nav-link');

    // Thay đổi hành vi click để tải lại trang
    link.addEventListener('click', (event) => {
      event.preventDefault(); // Ngăn chặn hành vi mặc định
      window.location.href = item.url; // Chuyển hướng đến URL
    });

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
        childLink.href = child.url;
        childLink.textContent = child.text;
        childLink.classList.add('dropdown-item');

        // Thay đổi hành vi click để tải lại trang
        childLink.addEventListener('click', (event) => {
          event.preventDefault(); // Ngăn chặn hành vi mặc định
          window.location.href = child.url; // Chuyển hướng đến URL
        });

        childItem.appendChild(childLink);
        dropdownMenu.appendChild(childItem);
      });
      menuItem.appendChild(dropdownMenu);
    }

    navbar.appendChild(menuItem);
  });
}

// Hàm để tải Navbar từ file navbar.html
async function loadNavbar() {
  try {
    const response = await fetch('navbar.html'); // Tải nội dung từ navbar.html
    if (!response.ok) {
      throw new Error('Failed to load navbar');
    }
    const navbarHTML = await response.text();
    document.getElementById('navbar-container').innerHTML = navbarHTML; // Chèn Navbar vào trang
    fetchMenu(); // Gọi hàm fetchMenu để hiển thị menu động
  } catch (error) {
    console.error('Error loading navbar:', error);
  }
}

// Gọi hàm loadNavbar khi trang được tải
loadNavbar();

async function updateAuthButton() {
  try {
    const response = await fetch('/auth/me', { credentials: 'include' }); // Kiểm tra trạng thái đăng nhập
    if (response.ok) {
      const user = await response.json();
      const authButton = document.getElementById('authButton');
      authButton.textContent = `Logout (${user.data.username})`;
      authButton.href = '#';
      authButton.addEventListener('click', async (event) => {
        event.preventDefault();
        console.log('Logout button clicked'); // Kiểm tra sự kiện click
        try {
          const response = await fetch('/auth/logout', { method: 'GET', credentials: 'include' });
          if (response.ok) {
            console.log('Logout successful'); // Kiểm tra API logout
            window.location.reload(); // Refresh trang sau khi logout
          } else {
            const error = await response.json();
            console.error('Logout failed:', error.message);
          }
        } catch (error) {
          console.error('Error during logout:', error);
        }
      });
    }
  } catch (error) {
    console.error('Error checking authentication:', error);
  }
}

// Gọi hàm updateAuthButton khi trang được tải
updateAuthButton();