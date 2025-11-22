/**
 * ASCII Art Generator
 * Converts images to ASCII art with customizable parameters
 */

export interface GenerateOptions {
    width: number;
    charset: string;
    invert: boolean;
    steam?: boolean;
}

// Dithering implementation - Floyd-Steinberg algorithm
class DithererFloydSteinberg {
    public dither(imageData: ImageData, threshold: number = 128): ImageData {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        
        // Create a copy for processing
        const dithered = new Uint8ClampedArray(data);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                
                // Get current pixel (using red channel as grayscale)
                const old = dithered[idx];
                const newVal = old > threshold ? 255 : 0;
                dithered[idx] = newVal;
                dithered[idx + 1] = newVal;
                dithered[idx + 2] = newVal;
                
                const error = old - newVal;
                
                // Distribute error to neighboring pixels (Floyd-Steinberg)
                if (x + 1 < width) {
                    dithered[idx + 4] = Math.max(0, Math.min(255, dithered[idx + 4] + error * 7 / 16));
                    dithered[idx + 5] = Math.max(0, Math.min(255, dithered[idx + 5] + error * 7 / 16));
                    dithered[idx + 6] = Math.max(0, Math.min(255, dithered[idx + 6] + error * 7 / 16));
                }
                
                if (y + 1 < height) {
                    if (x > 0) {
                        const leftIdx = ((y + 1) * width + (x - 1)) * 4;
                        dithered[leftIdx] = Math.max(0, Math.min(255, dithered[leftIdx] + error * 3 / 16));
                        dithered[leftIdx + 1] = Math.max(0, Math.min(255, dithered[leftIdx + 1] + error * 3 / 16));
                        dithered[leftIdx + 2] = Math.max(0, Math.min(255, dithered[leftIdx + 2] + error * 3 / 16));
                    }
                    
                    const belowIdx = ((y + 1) * width + x) * 4;
                    dithered[belowIdx] = Math.max(0, Math.min(255, dithered[belowIdx] + error * 5 / 16));
                    dithered[belowIdx + 1] = Math.max(0, Math.min(255, dithered[belowIdx + 1] + error * 5 / 16));
                    dithered[belowIdx + 2] = Math.max(0, Math.min(255, dithered[belowIdx + 2] + error * 5 / 16));
                    
                    if (x + 1 < width) {
                        const rightIdx = ((y + 1) * width + (x + 1)) * 4;
                        dithered[rightIdx] = Math.max(0, Math.min(255, dithered[rightIdx] + error * 1 / 16));
                        dithered[rightIdx + 1] = Math.max(0, Math.min(255, dithered[rightIdx + 1] + error * 1 / 16));
                        dithered[rightIdx + 2] = Math.max(0, Math.min(255, dithered[rightIdx + 2] + error * 1 / 16));
                    }
                }
            }
        }
        
        // Create new ImageData with dithered result
        const result = new ImageData(dithered, width, height);
        return result;
    }
}

export class AsciiArtGenerator {
    // Character sets for different styles
    private charsets: Record<string, string> = {
        default: '⠀⠁⠂⠃⠄⠅⠆⠇⠈⠉⠊⠋⠌⠍⠎⠏⠐⠑⠒⠓⠔⠕⠖⠗⠘⠙⠚⠛⠜⠝⠞⠟⠠⠡⠢⠣⠤⠥⠦⠧⠨⠩⠪⠫⠬⠭⠮⠯⠰⠱⠲⠳⠴⠵⠶⠷⠸⠹⠺⠻⠼⠽⠾⠿⡀⡁⡂⡃⡄⡅⡆⡇⡈⡉⡊⡋⡌⡍⡎⡏⡐⡑⡒⡓⡔⡕⡖⡗⡘⡙⡚⡛⡜⡝⡞⡟⡠⡡⡢⡣⡤⡥⡦⡧⡨⡩⡪⡫⡬⡭⡮⡯⡰⡱⡲⡳⡴⡵⡶⡷⡸⡹⡺⡻⡼⡽⡾⡿⢀⢁⢂⢃⢄⢅⢆⢇⢈⢉⢊⢋⢌⢍⢎⢏⢐⢑⢒⢓⢔⢕⢖⢗⢘⢙⢚⢛⢜⢝⢞⢟⢠⢡⢢⢣⢤⢥⢦⢧⢨⢩⢪⢫⢬⢭⢮⢯⢰⢱⢲⢳⢴⢵⢶⢷⢸⢹⢺⢻⢼⢽⢾⢿⣀⣁⣂⣃⣄⣅⣆⣇⣈⣉⣊⣋⣌⣍⣎⣏⣐⣑⣒⣓⣔⣕⣖⣗⣘⣙⣚⣛⣜⣝⣞⣟⣠⣡⣢⣣⣤⣥⣦⣧⣨⣩⣪⣫⣬⣭⣮⣯⣰⣱⣲⣳⣴⣵⣶⣷⣸⣹⣺⣻⣼⣽⣾⣿',
        braille: '⠀⠁⠂⠃⠄⠅⠆⠇⠈⠉⠊⠋⠌⠍⠎⠏⠐⠑⠒⠓⠔⠕⠖⠗⠘⠙⠚⠛⠜⠝⠞⠟⠠⠡⠢⠣⠤⠥⠦⠧⠨⠩⠪⠫⠬⠭⠮⠯⠰⠱⠲⠳⠴⠵⠶⠷⠸⠹⠺⠻⠼⠽⠾⠿⡀⡁⡂⡃⡄⡅⡆⡇⡈⡉⡊⡋⡌⡍⡎⡏⡐⡑⡒⡓⡔⡕⡖⡗⡘⡙⡚⡛⡜⡝⡞⡟⡠⡡⡢⡣⡤⡥⡦⡧⡨⡩⡪⡫⡬⡭⡮⡯⡰⡱⡲⡳⡴⡵⡶⡷⡸⡹⡺⡻⡼⡽⡾⡿⢀⢁⢂⢃⢄⢅⢆⢇⢈⢉⢊⢋⢌⢍⢎⢏⢐⢑⢒⢓⢔⢕⢖⢗⢘⢙⢚⢛⢜⢝⢞⢟⢠⢡⢢⢣⢤⢥⢦⢧⢨⢩⢪⢫⢬⢭⢮⢯⢰⢱⢲⢳⢴⢵⢶⢷⢸⢹⢺⢻⢼⢽⢾⢿⣀⣁⣂⣃⣄⣅⣆⣇⣈⣉⣊⣋⣌⣍⣎⣏⣐⣑⣒⣓⣔⣕⣖⣗⣘⣙⣚⣛⣜⣝⣞⣟⣠⣡⣢⣣⣤⣥⣦⣧⣨⣩⣪⣫⣬⣭⣮⣯⣰⣱⣲⣳⣴⣵⣶⣷⣸⣹⣺⣻⣼⣽⣾⣿',
        block: '░▒▓█',
        standard: '@%#*+=-:. '
    };

    private ditherer = new DithererFloydSteinberg();

    /**
     * Convert image to ASCII art using Braille character mapping
     * Each Braille character maps 2×4 pixels (8 dots), providing high spatial resolution
     */
    public generateAscii(
        imageData: ImageData,
        options: GenerateOptions
    ): { ascii: string; adjustedWidth?: number } {
        const { charset, invert, width, steam } = options;

        // For Braille mode, use 2×4 pixel blocks
        if (charset === 'default' || charset === 'braille') {
            const result = this.generateBrailleAscii(imageData, invert, width, !!steam);
            // Debug: count characters (exclude newlines) and estimate bytes (3 bytes per Braille char)
            const charCount = result.ascii.replace(/\n/g, '').length;
            console.log(`DEBUG: generated chars=${charCount}, estBytes=${charCount * 3}`);
            return result;
        }

        // For other charsets, use the traditional approach
        const ascii = this.generateTraditionalAscii(imageData, options);
        // Debug: count characters (exclude newlines) and estimate bytes (approx 1 byte per char for simple ASCII)
        const charCount = ascii.replace(/\n/g, '').length;
        console.log(`DEBUG: generated chars=${charCount}, estBytes~${charCount}`);
        return { ascii };
    }

    /**
     * Calculate adjusted Braille char width to satisfy Steam byte limit (<1000 bytes).
     * Returns the adjusted width (never below UI minimum of 5).
     */
    public calculateSteamAdjustedWidth(imageData: ImageData, targetCharWidth: number): number {
        const imageWidth = imageData.width;
        const imageHeight = imageData.height;
        const aspectRatio = imageHeight / imageWidth;

        const maxBytes = 999; // must be < 1000
        const maxChars = Math.floor(maxBytes / 3);
    const minCharWidth = 1;

        let charWidth = targetCharWidth;
        while (charWidth > minCharWidth) {
            const pixelW = charWidth * 2;
            const pixelH = Math.round(pixelW * aspectRatio);
            const rows = Math.ceil(pixelH / 4);
            const charCount = charWidth * rows;
            if (charCount <= maxChars) break;
            charWidth--;
        }

        return charWidth;
    }

    /**
     * Generate ASCII art using Braille characters with dithering
     * Each character represents a 2×4 pixel block
     */
    private generateBrailleAscii(imageData: ImageData, invert: boolean, targetCharWidth: number, steam: boolean): { ascii: string; adjustedWidth?: number } {
        // Step 0: Resize image based on Braille character dimensions
        // Each Braille character represents a 2×4 pixel block
        const imageWidth = imageData.width;
        const imageHeight = imageData.height;
        const aspectRatio = imageHeight / imageWidth;
        
        // If Steam mode is on, attempt to compute an adjusted width that satisfies the byte cap
        let adjustedWidth: number | undefined;
        if (steam) {
            try {
                // First try the helper which computes a reasonable reduction
                adjustedWidth = this.calculateSteamAdjustedWidth(imageData, targetCharWidth);
                if (adjustedWidth !== targetCharWidth) {
                    console.log(`Steam mode: adjusted char width from ${targetCharWidth} -> ${adjustedWidth}`);
                    targetCharWidth = adjustedWidth;
                }

                // As a stronger safeguard, iteratively reduce targetCharWidth until estimated charCount fits
                const maxBytes = 999;
                const maxChars = Math.floor(maxBytes / 3);
                let charWidth = targetCharWidth;
                let iter = 0;
                while (iter < 200) {
                    const pixelW = charWidth * 2;
                    const pixelH = Math.round(pixelW * aspectRatio);
                    const rows = Math.max(1, Math.ceil(pixelH / 4));
                    const charCount = charWidth * rows;
                    if (charCount <= maxChars) break;
                    charWidth = Math.max(1, charWidth - 1);
                    iter++;
                }

                if (charWidth !== targetCharWidth) {
                    console.log(`Steam safeguard: reduced char width from ${targetCharWidth} -> ${charWidth} after ${iter} iterations`);
                    targetCharWidth = charWidth;
                    adjustedWidth = charWidth;
                }
            } catch (err) {
                console.error('Error calculating steam adjusted width', err);
            }
        }

        // targetCharWidth = number of Braille characters in one row
        // Each character is 2 pixels wide, 4 pixels tall
        // So actual pixel dimensions:
        const pixelWidth = targetCharWidth * 2;  // 2 pixels per character width
        const pixelHeight = Math.round(pixelWidth * aspectRatio);  // Maintain aspect ratio
        
        // Resize to pixel dimensions first
        const resizedImage = this.resizeImage(imageData, pixelWidth, pixelHeight);
        const width = resizedImage.width;
        const height = resizedImage.height;
        const data = resizedImage.data;
        
        // Step 1: Convert image to grayscale
        const grayData = new Uint8ClampedArray(width * height * 4);
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];
            
            // Use luminosity method for grayscale
            const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
            
            // Set all RGB channels to gray value
            grayData[i] = gray;
            grayData[i + 1] = gray;
            grayData[i + 2] = gray;
            grayData[i + 3] = a;
        }
        
        const grayImageData = new ImageData(grayData, width, height);

        // Step 2: Apply dithering
        const ditheredData = this.ditherer.dither(grayImageData, 128);
        const ditheredPixels = ditheredData.data;

        // Step 3: Generate Braille characters from 2×4 pixel blocks
        const asciiXDots = 2;
        const asciiYDots = 4;
        
        let ascii = '';

        for (let y = 0; y < height; y += asciiYDots) {
            for (let x = 0; x < width; x += asciiXDots) {
                // Helper function to get pixel value (R channel as grayscale)
                const getPixel = (px: number, py: number): number => {
                    if (px >= width || py >= height) return 255;
                    return ditheredPixels[(py * width + px) * 4]; // Use R channel
                };

                // Map 8 pixels to Braille dots according to standard encoding
                // Braille base code point is 0x2800 (10240 decimal)
                let brailleCode = 0x2800;
                
                // A pixel is "dark" if grayscale < 128, "light" if >= 128
                // We show the dots where pixels are DARK (< 128)
                // invert flips this logic
                const isDark = (pixel: number) => invert ? (pixel >= 128) : (pixel < 128);

                // bit0: (x+0, y+0) - dot1
                brailleCode += isDark(getPixel(x + 0, y + 0)) ? (1 << 0) : 0;
                // bit1: (x+0, y+1) - dot2
                brailleCode += isDark(getPixel(x + 0, y + 1)) ? (1 << 1) : 0;
                // bit2: (x+0, y+2) - dot3
                brailleCode += isDark(getPixel(x + 0, y + 2)) ? (1 << 2) : 0;
                // bit3: (x+1, y+0) - dot4
                brailleCode += isDark(getPixel(x + 1, y + 0)) ? (1 << 3) : 0;
                // bit4: (x+1, y+1) - dot5
                brailleCode += isDark(getPixel(x + 1, y + 1)) ? (1 << 4) : 0;
                // bit5: (x+1, y+2) - dot6
                brailleCode += isDark(getPixel(x + 1, y + 2)) ? (1 << 5) : 0;
                // bit6: (x+0, y+3) - dot7
                brailleCode += isDark(getPixel(x + 0, y + 3)) ? (1 << 6) : 0;
                // bit7: (x+1, y+3) - dot8
                brailleCode += isDark(getPixel(x + 1, y + 3)) ? (1 << 7) : 0;

                ascii += String.fromCharCode(brailleCode);
            }
            ascii += '\n';
        }

        // If steam mode is enabled, ensure final byte size < 1000 by truncating rows if necessary
        if (steam) {
            const maxBytes = 999;
            const maxChars = Math.floor(maxBytes / 3);

            // Split into lines and count printable Braille characters (exclude newline)
            let lines = ascii.split('\n');
            // Remove possible trailing empty line from split
            if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();

            let totalChars = lines.reduce((s, l) => s + l.length, 0);

            // If still over the limit, remove lines from the end until it fits
            while (totalChars > maxChars && lines.length > 0) {
                const removed = lines.pop();
                totalChars = lines.reduce((s, l) => s + l.length, 0);
            }

            ascii = lines.join('\n') + (lines.length > 0 ? '\n' : '');

            // If we truncated lines, log it and return adjustedWidth so UI can reflect the change
            if (totalChars > maxChars) {
                // As a last resort, if even removing all lines didn't help (very unlikely), empty the output
                ascii = '';
            }
        }

        return { ascii, adjustedWidth: adjustedWidth !== undefined ? adjustedWidth : targetCharWidth };
    }

    /**
     * Generate ASCII art using traditional approach (for non-Braille charsets)
     */
    private generateTraditionalAscii(imageData: ImageData, options: GenerateOptions): string {
        const { width, charset, invert } = options;
        const chars = this.getCharset(charset);

        // Calculate dimensions
        const imageWidth = imageData.width;
        const imageHeight = imageData.height;
        const aspectRatio = imageHeight / imageWidth;
        const height = Math.round(width * aspectRatio * 0.5);

        // Resize and convert image to grayscale
        const resizedCanvas = this.resizeImage(imageData, width, height);
        const grayPixels = this.toGrayscale(resizedCanvas);

        // Convert to ASCII
        let ascii = '';
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const pixelIndex = y * width + x;
                const grayValue = grayPixels[pixelIndex];

                let charIndex = Math.floor((grayValue / 255) * (chars.length - 1));
                charIndex = chars.length - 1 - charIndex;
                if (invert) {
                    charIndex = chars.length - 1 - charIndex;
                }

                ascii += chars[charIndex];
            }
            ascii += '\n';
        }

        return ascii;
    }

    /**
     * Get charset by name or custom charset
     */
    private getCharset(charsetName: string): string {
        return this.charsets[charsetName] || this.charsets['default'];
    }

    /**
     * Resize image to target dimensions
     */
    private resizeImage(imageData: ImageData, targetWidth: number, targetHeight: number): ImageData {
        const sourceWidth = imageData.width;
        const sourceHeight = imageData.height;
        const sourceData = imageData.data;

        // Create target canvas
        const targetCanvas = new OffscreenCanvas(targetWidth, targetHeight);
        const targetCtx = targetCanvas.getContext('2d');

        if (!targetCtx) {
            throw new Error('Failed to get 2D context');
        }

        // Simple nearest-neighbor resize
        const xRatio = sourceWidth / targetWidth;
        const yRatio = sourceHeight / targetHeight;

        const targetImageData = targetCtx.createImageData(targetWidth, targetHeight);
        const targetData = targetImageData.data;

        for (let y = 0; y < targetHeight; y++) {
            for (let x = 0; x < targetWidth; x++) {
                const sourceX = Math.floor(x * xRatio);
                const sourceY = Math.floor(y * yRatio);
                const sourceIndex = (sourceY * sourceWidth + sourceX) * 4;
                const targetIndex = (y * targetWidth + x) * 4;

                // Copy RGBA values
                targetData[targetIndex] = sourceData[sourceIndex];
                targetData[targetIndex + 1] = sourceData[sourceIndex + 1];
                targetData[targetIndex + 2] = sourceData[sourceIndex + 2];
                targetData[targetIndex + 3] = sourceData[sourceIndex + 3];
            }
        }

        return targetImageData;
    }

    /**
     * Convert RGB image data to grayscale
     */
    private toGrayscale(imageData: ImageData): Uint8ClampedArray {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        const grayPixels = new Uint8ClampedArray(width * height);

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Use luminosity method for better results
            const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
            grayPixels[i / 4] = gray;
        }

        return grayPixels;
    }

    /**
     * Process image from file
     */
    public async processImageFile(file: File): Promise<ImageData> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const img = new Image();

                img.onload = () => {
                    const canvas = new OffscreenCanvas(img.width, img.height);
                    const ctx = canvas.getContext('2d');

                    if (!ctx) {
                        reject(new Error('Failed to get 2D context'));
                        return;
                    }

                    ctx.drawImage(img, 0, 0);
                    const imageData = ctx.getImageData(0, 0, img.width, img.height);
                    resolve(imageData);
                };

                img.onerror = () => {
                    reject(new Error('Failed to load image'));
                };

                if (e.target?.result) {
                    img.src = e.target.result as string;
                }
            };

            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };

            reader.readAsDataURL(file);
        });
    }

    /**
     * Validate image file
     */
    public validateImageFile(file: File): { valid: boolean; error?: string } {
        const validTypes = ['image/jpeg', 'image/png'];
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (!validTypes.includes(file.type)) {
            return { valid: false, error: '仅支持 JPG 和 PNG 格式的图片' };
        }

        if (file.size > maxSize) {
            return { valid: false, error: '图片大小不能超过 10MB' };
        }

        return { valid: true };
    }

    /**
     * Update custom charset
     */
    public setCustomCharset(charset: string, charsetName: string = 'custom'): void {
        if (charset.length > 0) {
            this.charsets[charsetName] = charset;
        }
    }
}
