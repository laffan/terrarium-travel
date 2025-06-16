const TRANSITION_DURATION = 450; // Total transition duration in milliseconds

class ViewMaster {
  constructor() {
    this.photos = [];
    this.randomSequence = [];
    this.currentIndex = 0;
    this.isTransitioning = false;
    this.photoContainer = document.querySelector('.photo-container');
    this.clickAudio = new Audio('assets/click.mp3');
    
    this.loadPhotos();
    this.setupEventListeners();
  }
  
  async loadPhotos() {
    try {
      const response = await fetch('tt_data.json');
      this.photos = await response.json();
      
      if (this.photos.length > 0) {
        this.initializeSequence();
      }
    } catch (error) {
      console.error('Error loading photos:', error);
    }
  }
  
  initializeSequence() {
    // Check if there's a specific photo ID in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const startId = urlParams.get('id');
    
    // Create random sequence
    this.randomSequence = this.shuffleArray([...Array(this.photos.length).keys()]);
    
    // If a specific ID is provided and valid, move it to the front
    if (startId !== null) {
      const photoId = parseInt(startId);
      if (photoId >= 0 && photoId < this.photos.length) {
        const sequenceIndex = this.randomSequence.indexOf(photoId);
        if (sequenceIndex > -1) {
          // Remove the photo from its current position and add to front
          this.randomSequence.splice(sequenceIndex, 1);
          this.randomSequence.unshift(photoId);
        }
      }
    }
    
    this.currentIndex = 0;
    this.showPhoto(this.currentIndex);
    this.updateURL();
  }
  
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  getCurrentPhotoId() {
    return this.randomSequence[this.currentIndex];
  }
  
  updateURL() {
    const photoId = this.getCurrentPhotoId();
    const newUrl = `${window.location.pathname}?id=${photoId}`;
    window.history.replaceState({}, '', newUrl);
  }
  
  showPhoto(sequenceIndex) {
    if (sequenceIndex >= 0 && sequenceIndex < this.randomSequence.length) {
      const photoId = this.randomSequence[sequenceIndex];
      // Create fresh photo structure
      this.photoContainer.innerHTML = `
        <div class="photo-wrapper current">
          <img src="assets/media/${this.photos[photoId].img}.jpg" alt="ViewMaster Photo" class="photo-image">
        </div>
        <div class="photo-wrapper next">
          <img src="" alt="ViewMaster Photo" class="photo-image">
        </div>
        <div class="photo-wrapper prev">
          <img src="" alt="ViewMaster Photo" class="photo-image">
        </div>
      `;
      this.currentIndex = sequenceIndex;
      this.updateNav();
      this.updateURL();
    }
  }

  updateNav() {
    if (this.randomSequence.length > 0 && this.currentIndex >= 0 && this.currentIndex < this.randomSequence.length) {
      const photoId = this.randomSequence[this.currentIndex];
      const currentPhoto = this.photos[photoId];
      const visitButton = document.querySelector('.visit');
      const currentImageElement = document.querySelector('.photo-wrapper.current .photo-image');
      
      // Set the title attribute on the current image
      if (currentImageElement) {
        currentImageElement.title = currentPhoto.placename || '';
      }
      
      if (visitButton && currentPhoto.link_google) {
        visitButton.onclick = () => {
          window.open(currentPhoto.link_google, '_blank');
        };
        visitButton.style.display = 'block';
      } else if (visitButton) {
        visitButton.style.display = 'none';
      }
    }
  }
  
  nextPhoto() {
    if (this.isTransitioning || this.randomSequence.length === 0) return;
    
    this.clickAudio.play();
    this.isTransitioning = true;
    
    const nextIndex = (this.currentIndex + 1) % this.randomSequence.length;
    const nextPhotoId = this.randomSequence[nextIndex];
    const currentWrapper = this.photoContainer.querySelector('.photo-wrapper.current');
    const nextWrapper = this.photoContainer.querySelector('.photo-wrapper.next');
    const nextImage = nextWrapper.querySelector('.photo-image');
    
    // Prepare next image
    nextImage.src = `assets/media/${this.photos[nextPhotoId].img}.jpg`;
    
    // Start current image sliding down
    currentWrapper.classList.add('sliding-out-down');
    
    // After brief delay, start next image sliding down from top
    setTimeout(() => {
      nextWrapper.classList.add('sliding-in-down');
      
      // After animation completes, recreate with new current image
      setTimeout(() => {
        this.showPhoto(nextIndex);
        this.isTransitioning = false;
      }, TRANSITION_DURATION);
    }, 150);
  }
  
  prevPhoto() {
    if (this.isTransitioning || this.randomSequence.length === 0) return;
    
    this.clickAudio.play();
    this.isTransitioning = true;
    
    const prevIndex = this.currentIndex === 0 ? this.randomSequence.length - 1 : this.currentIndex - 1;
    const prevPhotoId = this.randomSequence[prevIndex];
    const currentWrapper = this.photoContainer.querySelector('.photo-wrapper.current');
    const prevWrapper = this.photoContainer.querySelector('.photo-wrapper.prev');
    const prevImage = prevWrapper.querySelector('.photo-image');
    
    // Prepare previous image
    prevImage.src = `assets/media/${this.photos[prevPhotoId].img}.jpg`;
    
    // Start current image sliding up
    currentWrapper.classList.add('sliding-out-up');
    
    // After brief delay, start previous image sliding up from bottom
    setTimeout(() => {
      prevWrapper.classList.add('sliding-in-up');
      
      // After animation completes, recreate with new current image
      setTimeout(() => {
        this.showPhoto(prevIndex);
        this.isTransitioning = false;
      }, TRANSITION_DURATION);
    }, 150);
  }
  
  setupEventListeners() {
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
      switch(e.key) {
        case 'ArrowRight':
          this.nextPhoto();
          break;
        case 'ArrowLeft':
          this.prevPhoto();
          break;
        case 'c':
        case 'C':
          this.copyCurrentFilename();
          break;
      }
    });
    
    // Button controls
    const backButton = document.querySelector('.buttonPrev');
    const nextButton = document.querySelector('.buttonNext');
    
    if (backButton) {
      backButton.addEventListener('click', () => {
        this.prevPhoto();
      });
    }
    
    if (nextButton) {
      nextButton.addEventListener('click', () => {
        this.nextPhoto();
      });
    }
    
    // Modal controls
    this.setupModalListeners();
  }
  
  copyCurrentFilename() {
    if (this.randomSequence.length > 0 && this.currentIndex >= 0 && this.currentIndex < this.randomSequence.length) {
      const photoId = this.randomSequence[this.currentIndex];
      const currentPhoto = this.photos[photoId];
      const filename = currentPhoto.img; // This is already without .jpg extension
      
      // Create a temporary button for clipboard.js
      const tempButton = document.createElement('button');
      tempButton.setAttribute('data-clipboard-text', filename);
      document.body.appendChild(tempButton);
      
      // Initialize clipboard.js on the temporary button
      const clipboard = new ClipboardJS(tempButton);
      
      clipboard.on('success', function(e) {
        console.log('Filename copied to clipboard:', filename);
        e.clearSelection();
        clipboard.destroy();
        document.body.removeChild(tempButton);
      });
      
      clipboard.on('error', function(e) {
        console.error('Failed to copy filename:', e);
        clipboard.destroy();
        document.body.removeChild(tempButton);
      });
      
      // Trigger the copy
      tempButton.click();
    }
  }
  
  setupModalListeners() {
    const openModalButton = document.querySelector('.openInfoModal');
    const modalOverlay = document.querySelector('.modal-overlay');
    const mainElement = document.querySelector('main');
    
    if (openModalButton && modalOverlay && mainElement) {
      // Open modal
      openModalButton.addEventListener('click', () => {
        modalOverlay.classList.add('active');
        mainElement.classList.add('modal-active');
      });
      
      // Close modal when clicking overlay (but not the modal content)
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
          modalOverlay.classList.remove('active');
          mainElement.classList.remove('modal-active');
        }
      });
      
      // Close modal with Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
          modalOverlay.classList.remove('active');
          mainElement.classList.remove('modal-active');
        }
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ViewMaster();
});