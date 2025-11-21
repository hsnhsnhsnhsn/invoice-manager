// Script principal pour les interactions JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Gestion des messages flash (auto-hide après 5 secondes)
    const flashMessages = document.querySelectorAll('.bg-green-100, .bg-red-100');
    flashMessages.forEach(msg => {
        setTimeout(() => {
            msg.style.transition = 'opacity 0.5s';
            msg.style.opacity = '0';
            setTimeout(() => msg.remove(), 500);
        }, 5000);
    });
    
    // Confirmation de suppression
    const deleteLinks = document.querySelectorAll('a[onclick*="confirm"]');
    deleteLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (!confirm(this.getAttribute('onclick').match(/'([^']+)'/)[1])) {
                e.preventDefault();
            }
        });
    });
});
