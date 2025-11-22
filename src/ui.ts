/**
 * UI Controller
 * Manages user interactions and DOM updates
 */

import { AsciiArtGenerator, GenerateOptions } from './asciiGenerator';

export class UIController {
    private generator: AsciiArtGenerator;
    private currentImageData: ImageData | null = null;
    private currentAsciiArt: string = '';

    // DOM Elements
    private uploadArea: HTMLElement;
    private imageInput: HTMLInputElement;
    private controlsSection: HTMLElement;
    private previewSection: HTMLElement;
    private actionsSection: HTMLElement;
    private widthSlider: HTMLInputElement;
    private widthInput: HTMLInputElement;
    private charsetSelect: HTMLSelectElement;
    private customCharGroup: HTMLElement;
    private customChars: HTMLInputElement;
    private invertCheckbox: HTMLInputElement;
    private generateBtn: HTMLButtonElement;
    private downloadBtn: HTMLButtonElement;
    private copyBtn: HTMLButtonElement;
    private resetBtn: HTMLButtonElement;
    private previewImage: HTMLImageElement;
    private asciiOutput: HTMLPreElement;

    constructor(generator: AsciiArtGenerator) {
        this.generator = generator;

        // Initialize DOM elements
        this.uploadArea = this.getElementById('uploadArea');
        this.imageInput = this.getElement<HTMLInputElement>('#imageInput');
        this.controlsSection = this.getElementById('controlsSection');
        this.previewSection = this.getElementById('previewSection');
        this.actionsSection = this.getElementById('actionsSection');
        this.widthSlider = this.getElement<HTMLInputElement>('#widthSlider');
        this.widthInput = this.getElement<HTMLInputElement>('#widthInput');
        this.charsetSelect = this.getElement<HTMLSelectElement>('#charsetSelect');
        this.customCharGroup = this.getElementById('customCharGroup');
        this.customChars = this.getElement<HTMLInputElement>('#customChars');
            this.invertCheckbox = this.getElement<HTMLInputElement>('#invertCheckbox');
        this.generateBtn = this.getElement<HTMLButtonElement>('#generateBtn');
        this.downloadBtn = this.getElement<HTMLButtonElement>('#downloadBtn');
        this.copyBtn = this.getElement<HTMLButtonElement>('#copyBtn');
        this.resetBtn = this.getElement<HTMLButtonElement>('#resetBtn');
        this.previewImage = this.getElement<HTMLImageElement>('#previewImage');
        this.asciiOutput = this.getElement<HTMLPreElement>('#asciiOutput');
    }

    /**
     * Initialize UI event listeners
     */
    public init(): void {
        console.log('UI Controller initializing...');
        
        // Upload events
        this.imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));

        // Control events
        this.widthSlider.addEventListener('input', (e) => this.handleWidthChange(e));
        this.widthInput.addEventListener('input', (e) => this.handleWidthChange(e));
        this.charsetSelect.addEventListener('change', (e) => this.handleCharsetChange(e));
        this.customChars.addEventListener('input', (e) => this.handleCustomCharsChange(e));

        // Button events
        this.generateBtn.addEventListener('click', () => this.generateAscii());
        this.downloadBtn.addEventListener('click', () => this.downloadAscii());
        this.copyBtn.addEventListener('click', () => this.copyToClipboard());
        this.resetBtn.addEventListener('click', () => this.reset());
        
        console.log('UI Controller initialized successfully');
    }

    /**
     * Handle image file selection
     */
    private async handleImageUpload(e: Event): Promise<void> {
        console.log('Image upload triggered');
        const input = e.target as HTMLInputElement;
        const file = input.files?.[0];

        if (!file) {
            console.log('No file selected');
            return;
        }

        console.log('Processing file:', file.name, file.type, file.size);
        const validation = this.generator.validateImageFile(file);
        if (!validation.valid) {
            alert(validation.error);
            console.error('Validation failed:', validation.error);
            return;
        }

        try {
            console.log('Reading file...');
            this.currentImageData = await this.generator.processImageFile(file);
            console.log('File processed, showing controls');
            this.showControls();
            this.displayPreview(file);
            console.log('Preview displayed');
        } catch (error) {
            alert('图片加载失败，请重试');
            console.error('Error:', error);
        }
    }

    /**
     * Handle drag over
     */
    private handleDragOver(e: DragEvent): void {
        e.preventDefault();
        e.stopPropagation();
        this.uploadArea.classList.add('dragover');
    }

    /**
     * Handle drag leave
     */
    private handleDragLeave(e: DragEvent): void {
        e.preventDefault();
        e.stopPropagation();
        this.uploadArea.classList.remove('dragover');
    }

    /**
     * Handle drop
     */
    private handleDrop(e: DragEvent): void {
        e.preventDefault();
        e.stopPropagation();
        this.uploadArea.classList.remove('dragover');

        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
            this.imageInput.files = files;
            this.handleImageUpload({ target: this.imageInput } as unknown as Event);
        }
    }

    /**
     * Handle width slider/input change
     */
    private handleWidthChange(e: Event): void {
        const target = e.target as HTMLInputElement;
        const value = target.value;

        this.widthSlider.value = value;
        this.widthInput.value = value;
    }

    /**
     * Handle charset selection change
     */
    private handleCharsetChange(e: Event): void {
        const select = e.target as HTMLSelectElement;
        const isCustom = select.value === 'custom';

        if (isCustom) {
            this.customCharGroup.style.display = 'block';
        } else {
            this.customCharGroup.style.display = 'none';
        }
    }

    /**
     * Handle custom charset input
     */
    private handleCustomCharsChange(e: Event): void {
        const input = e.target as HTMLInputElement;
        this.generator.setCustomCharset(input.value, 'custom');
    }

    /**
     * Display image preview
     */
    private displayPreview(file: File): void {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.previewImage.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    }

    /**
     * Show controls section
     */
    private showControls(): void {
        this.controlsSection.style.display = 'block';
    }

    /**
     * Generate ASCII art
     */
    private generateAscii(): void {
        console.log('Generate ASCII button clicked');
        if (!this.currentImageData) {
            alert('请先上传图片');
            console.log('No image data');
            return;
        }

        try {
            console.log('Starting ASCII generation...');
            this.generateBtn.disabled = true;
            this.generateBtn.textContent = '生成中...';

            const width = parseInt(this.widthInput.value, 10);
            let charset = this.charsetSelect.value;

            if (charset === 'custom') {
                charset = this.customChars.value || '⢠⢉⠾⠃⠈⠱⣞⡿';
            }

            console.log('Options:', { width, charset, invert: this.invertCheckbox.checked });
            const options: GenerateOptions = {
                width,
                charset,
                invert: this.invertCheckbox.checked
            };

            console.log('Calling generator...');
            this.currentAsciiArt = this.generator.generateAscii(this.currentImageData, options);
            console.log('ASCII generated, length:', this.currentAsciiArt.length);
            this.displayAscii();
            this.showActions();
            console.log('Generation complete');
        } catch (error) {
            alert('生成 ASCII Art 失败，请重试');
            console.error(error);
        } finally {
            this.generateBtn.disabled = false;
            this.generateBtn.textContent = '生成 ASCII Art';
        }
    }

    /**
     * Display ASCII art
     */
    private displayAscii(): void {
        this.previewSection.style.display = 'grid';
        this.asciiOutput.textContent = this.currentAsciiArt;
        // 根据复选框决定是否显示深色背景样式
        if (this.invertCheckbox.checked) {
            this.asciiOutput.classList.add('ascii-bg');
        } else {
            this.asciiOutput.classList.remove('ascii-bg');
        }
    }

    /**
     * Show action buttons
     */
    private showActions(): void {
        this.actionsSection.style.display = 'flex';
    }

    /**
     * Download ASCII art as text file
     */
    private downloadAscii(): void {
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(this.currentAsciiArt));
        element.setAttribute('download', 'ascii-art.txt');
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    /**
     * Copy ASCII art to clipboard
     */
    private async copyToClipboard(): Promise<void> {
        try {
            await navigator.clipboard.writeText(this.currentAsciiArt);
            const originalText = this.copyBtn.textContent;
            this.copyBtn.textContent = '✅ 已复制！';
            setTimeout(() => {
                this.copyBtn.textContent = originalText;
            }, 2000);
        } catch (error) {
            alert('复制失败，请重试');
            console.error(error);
        }
    }

    /**
     * Reset application state
     */
    private reset(): void {
        this.currentImageData = null;
        this.currentAsciiArt = '';
        this.imageInput.value = '';
        this.widthSlider.value = '30';
        this.widthInput.value = '30';
        this.charsetSelect.value = 'default';
        this.customCharGroup.style.display = 'none';
        this.customChars.value = '';
        this.invertCheckbox.checked = false;

        this.controlsSection.style.display = 'none';
        this.previewSection.style.display = 'none';
        this.actionsSection.style.display = 'none';
        this.previewImage.src = '';
        this.asciiOutput.textContent = '';
    }

    /**
     * Helper: Get element by ID
     */
    private getElementById(id: string): HTMLElement {
        const element = document.getElementById(id);
        if (!element) {
            throw new Error(`Element with id "${id}" not found`);
        }
        return element;
    }

    /**
     * Helper: Get element by selector with type
     */
    private getElement<T extends HTMLElement>(selector: string): T {
        const element = document.querySelector<T>(selector);
        if (!element) {
            throw new Error(`Element with selector "${selector}" not found`);
        }
        return element;
    }
}
