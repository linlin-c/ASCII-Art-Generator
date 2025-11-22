import { AsciiArtGenerator } from './asciiGenerator.js';
import { UIController } from './ui.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const generator = new AsciiArtGenerator();
    const ui = new UIController(generator);
    ui.init();
});
