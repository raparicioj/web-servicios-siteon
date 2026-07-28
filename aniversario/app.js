/* ==========================================================================
   RODRIGO & CARMEN GLORIA — UNIFIED NARRATIVE ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }

  // JINJER PISCES PLAYER POPUP TOGGLE
  const audioToggleBtn = document.getElementById('audioToggleBtn');
  const jinjerPlayerPopup = document.getElementById('jinjerPlayerPopup');
  const closePlayerBtn = document.getElementById('closePlayerBtn');

  if (audioToggleBtn && jinjerPlayerPopup) {
    audioToggleBtn.addEventListener('click', () => {
      jinjerPlayerPopup.classList.toggle('active');
      if (jinjerPlayerPopup.classList.contains('active')) {
        audioToggleBtn.classList.add('playing');
        audioToggleBtn.querySelector('.audio-text').textContent = 'Jinjer — "Pisces" (Reproduciendo)';
      } else {
        audioToggleBtn.classList.remove('playing');
        audioToggleBtn.querySelector('.audio-text').textContent = 'Jinjer — "Pisces" (Reproductor Oficial)';
      }
    });
  }

  if (closePlayerBtn && jinjerPlayerPopup) {
    closePlayerBtn.addEventListener('click', () => {
      jinjerPlayerPopup.classList.remove('active');
      audioToggleBtn.classList.remove('playing');
      audioToggleBtn.querySelector('.audio-text').textContent = 'Jinjer — "Pisces" (Reproductor Oficial)';
    });
  }

  console.log('Rodrigo & Carmen Gloria Story Narrative Engine ready.');
});
