document.addEventListener('DOMContentLoaded', () => {
    
    // --- Mobile Menu Toggle ---
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // --- Tab Navigation Logic (Dashboard Layout) ---
    const navItems = document.querySelectorAll('.nav-link, .js-nav');
    const tabPanes = document.querySelectorAll('.tab-pane');

    function switchTab(targetId) {
        // Find target section
        const targetSection = document.getElementById(targetId);
        
        if (!targetSection) return;

        // Determine if targetId matches a datatab
        
        // Hide all panes
        tabPanes.forEach(pane => {
            pane.classList.remove('active');
        });
        
        // Remove active class from nav links inside the main nav only
        document.querySelectorAll('.nav-links .nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Show target pane
        targetSection.classList.add('active');

        // Highlight active nav link
        const matchingNavLink = document.querySelector(`.nav-links .nav-link[data-tab="${targetId}"]`);
        if (matchingNavLink) {
            matchingNavLink.classList.add('active');
        }

        // Add fade-in animation slightly delayed
        targetSection.style.animation = 'none';
        targetSection.offsetHeight; /* trigger reflow */
        targetSection.style.animation = null; 

        // Close mobile menu if open
        if (navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
        }

        // Scroll to top of content area
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // Add click event to all navigation items
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            // Get target from data-tab or data-target attribute
            const targetId = item.getAttribute('data-tab') || item.getAttribute('data-target');
            if (targetId) {
                switchTab(targetId);
                // Update URL hash for sharing/reloading without jumping
                history.pushState(null, null, `#${targetId}`);
            }
        });
    });

    // Handle initial load with hash
    if (window.location.hash) {
        const hash = window.location.hash.substring(1); // remove '#'
        switchTab(hash);
    }

    // --- Admin Dashboard Login Simulation ---
    const adminForm = document.getElementById('admin-login-form');
    const adminDashboard = document.getElementById('admin-dashboard');
    const adminLogout = document.getElementById('admin-logout');

    if (adminForm) {
        adminForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Simple simulation of login
            adminForm.style.display = 'none';
            adminDashboard.style.display = 'block';
        });
    }

    if (adminLogout) {
        adminLogout.addEventListener('click', () => {
            adminDashboard.style.display = 'none';
            adminForm.style.display = 'block';
            adminForm.reset();
        });
    }

});
