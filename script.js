// Interacciones del Menú Móvil
const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');

mobileMenu.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// Cerrar menú móvil al hacer click en un enlace
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// Cambio de estilo del Navbar al hacer Scroll (Sticky / Glass effect opaco)
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Intersection Observer API para animaciones "On-Scroll"
const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            // Opcional: observer.unobserve(entry.target) si solo quieres que se anime 1 vez
        }
    });
}, observerOptions);

// Aplicar observer a todos los elementos con la clase .reveal
document.querySelectorAll('.reveal').forEach(element => {
    observer.observe(element);
});

// Manejo básico de formulario (Validación y prevención de recarga para la demo)
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const btn = contactForm.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        
        btn.textContent = 'Enviando...';
        btn.style.opacity = '0.7';
        
        // Simular envío de datos
        setTimeout(() => {
            btn.textContent = '¡Mensaje Enviado!';
            btn.style.backgroundColor = '#22c55e'; // verde de éxito
            btn.style.color = 'white';
            contactForm.reset();
            
            // Restaurar botón después de 3 segundos
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.backgroundColor = '';
                btn.style.opacity = '1';
            }, 3000);
        }, 1500);
    });
}
