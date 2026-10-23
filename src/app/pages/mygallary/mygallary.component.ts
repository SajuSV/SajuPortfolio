// GALLERY PAGE (/projects/gallery)
// Two parts live in this file:
//   1. InfiniteGalleryRenderer - draws an endless wall of photos on a <canvas> using WebGL.
//      (Advanced graphics code. You normally don't need to edit it.)
//   2. MygallaryComponent - the Angular component: loading text, the featured center card,
//      next/previous buttons, drag + scroll controls and the fullscreen button.
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { GALLERY_IMAGES } from './mygallary.data';


export interface InfiniteGalleryOptions {
  canvas: HTMLCanvasElement;
  images: string[];
  onProgress?: (percent: number) => void;
  onReady?: () => void;
}

/**
 * Draws the endless photo wall on a canvas.
 * - The canvas comes from the component's HTML (passed in through the options).
 * - Every event listener it adds is removed again in destroy(), so call destroy()
 *   when leaving the page (the component does this in ngOnDestroy).
 */
export class InfiniteGalleryRenderer {
  private gl: WebGLRenderingContext | null;
  private canvas: HTMLCanvasElement;

  private images: HTMLImageElement[] = [];
  private textures: WebGLTexture[] = [];
  private imageMetaData: { width: number; height: number; aspectRatio: number }[] = [];
  private layoutPositions: { x: number; y: number; width: number; height: number }[] = [];

  private targetRowWidth = 800;
  private itemsPerRow = 5;

  private gridWidth = 0;
  private gridHeight = 0;

  private autoSpeedX = 1.5;
  private autoSpeedY = 1;

  private viewOffset = { x: 0, y: 0 };
  private drag = {
    isDragging: false,
    lastX: 0,
    lastY: 0,
    velocityX: 0,
    velocityY: 0
  };

  private inertia = 0.95;
  private bulgeStrength = 0.6;
  private bulgeRadius = 1.5;
  private adjustedBulgeRadius = this.bulgeRadius;

  private program: WebGLProgram | null = null;
  private indexCount = 0;
  private positionBuffer: WebGLBuffer | null = null;
  private texCoordBuffer: WebGLBuffer | null = null;
  private indexBuffer: WebGLBuffer | null = null;

  private rafId: number | null = null;
  private destroyed = false;

  // bound handlers, stored so they can be removed in destroy()
  private onResize = () => this.resizeCanvas();
  private onMouseDown = (e: MouseEvent) => {
    this.drag.isDragging = true;
    this.drag.lastX = e.clientX;
    this.drag.lastY = e.clientY;
  };
  private onMouseMove = (e: MouseEvent) => {
    if (!this.drag.isDragging) return;
    const deltaX = e.clientX - this.drag.lastX;
    const deltaY = e.clientY - this.drag.lastY;
    this.drag.velocityX = 0.3 * deltaX + 0.7 * this.drag.velocityX;
    this.drag.velocityY = 0.3 * deltaY + 0.7 * this.drag.velocityY;
    this.viewOffset.x -= this.drag.velocityX;
    this.viewOffset.y -= this.drag.velocityY;
    this.drag.lastX = e.clientX;
    this.drag.lastY = e.clientY;
  };
  private onMouseUp = () => { this.drag.isDragging = false; };
  private onTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    this.drag.isDragging = true;
    this.drag.lastX = e.touches[0].clientX;
    this.drag.lastY = e.touches[0].clientY;
  };
  private onTouchMove = (e: TouchEvent) => {
    if (!this.drag.isDragging) return;
    e.preventDefault();
    const deltaX = e.touches[0].clientX - this.drag.lastX;
    const deltaY = e.touches[0].clientY - this.drag.lastY;
    this.drag.velocityX = 0.3 * deltaX + 0.7 * this.drag.velocityX;
    this.drag.velocityY = 0.3 * deltaY + 0.7 * this.drag.velocityY;
    this.viewOffset.x -= this.drag.velocityX;
    this.viewOffset.y -= this.drag.velocityY;
    this.drag.lastX = e.touches[0].clientX;
    this.drag.lastY = e.touches[0].clientY;
  };
  private onTouchEnd = () => { this.drag.isDragging = false; };
  private onClick = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    this.handleClick(e.clientX - rect.left, e.clientY - rect.top);
  };
  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    this.drag.velocityX += 0.3 * e.deltaX;
    this.drag.velocityY += 0.3 * e.deltaY;
  };
  private onKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case '+':
      case '=':
        this.bulgeStrength = Math.min(1, this.bulgeStrength + 0.1);
        break;
      case '-':
      case '_':
        this.bulgeStrength = Math.max(0.48, this.bulgeStrength - 0.1);
        break;
      case 'ArrowLeft':
        this.bulgeRadius = Math.max(0.1, this.bulgeRadius - 0.05);
        this.resizeCanvas();
        break;
      case 'ArrowRight':
        this.bulgeRadius = Math.min(3, this.bulgeRadius + 0.05);
        this.resizeCanvas();
        break;
    }
  };

  constructor(private options: InfiniteGalleryOptions) {
    this.canvas = options.canvas;
    this.gl = this.canvas.getContext('webgl');

    if (!this.gl) {
      console.error('WebGL not supported');
      return;
    }

    this.resizeCanvas();
    window.addEventListener('resize', this.onResize);
    this.init();
    this.loadPortraitImages();
    this.setupEventListeners();
    this.animate();
  }

  private resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    const t = Math.sqrt(
      Math.pow(this.canvas.width / Math.min(this.canvas.width, this.canvas.height), 2) +
      Math.pow(this.canvas.height / Math.min(this.canvas.width, this.canvas.height), 2)
    );
    this.adjustedBulgeRadius = Math.max(this.bulgeRadius, 0.6 * t * 1.2);
    if (this.gl) this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  private init() {
    const vsSource = `
    attribute vec2 aPosition;
    attribute vec2 aTexCoord;
    varying vec2 vTexCoord;

    uniform vec2 uResolution;
    uniform vec2 uOffset;
    uniform float uRotation;
    uniform vec2 uImagePosition;
    uniform vec2 uImageSize;
    uniform float uBulgeStrength;
    uniform float uBulgeRadius;

    vec2 applyBulgeEffect(vec2 pos){
        vec2 normalizedPos = pos / uResolution;
        vec2 center = vec2(0.5, 0.5);
        vec2 delta = normalizedPos - center;

        float aspect = uResolution.x / uResolution.y;
        delta.x *= aspect;

        float dist = length(delta);

        if(dist < uBulgeRadius){
            float t = dist / uBulgeRadius;
            float z = sqrt(1.5 - t*t);
            delta *= 0.35 + uBulgeStrength * z;
            delta.x /= aspect;

            normalizedPos = center + delta;
            pos = normalizedPos * uResolution;
        }
        return pos;
    }

    void main(){
        vec2 pos = aPosition * uImageSize;
        pos += uImagePosition;
        pos -= uOffset;

        vec2 center = uImagePosition + (uImageSize * 0.5) - uOffset;
        pos -= center;
        float cosR = cos(uRotation);
        float sinR = sin(uRotation);
        pos = vec2(pos.x * cosR - pos.y * sinR, pos.x * sinR + pos.y * cosR);
        pos += center;

        pos = applyBulgeEffect(pos);

        vec2 clip = pos / uResolution * 2.0 - 1.0;
        gl_Position = vec4(clip, 0.0, 1.0);
        vTexCoord = aTexCoord;
    }
    `;

    const fsSource = `
    precision mediump float;
    varying vec2 vTexCoord;
    uniform sampler2D uSampler;
    void main(){
        vec2 uv = vec2(vTexCoord.x, 1.0 - vTexCoord.y);
        vec4 color = texture2D(uSampler, uv);
        if(color.a < 0.01) discard;
        gl_FragColor = color;
    }
    `;

    this.program = this.createProgram(vsSource, fsSource);

    const SUBDIV = 24;
    const positions: number[] = [];
    const texCoords: number[] = [];
    const indices: number[] = [];

    for (let y = 0; y <= SUBDIV; y++) {
      for (let x = 0; x <= SUBDIV; x++) {
        positions.push(x / SUBDIV, y / SUBDIV);
        texCoords.push(x / SUBDIV, y / SUBDIV);
      }
    }

    for (let y = 0; y < SUBDIV; y++) {
      for (let x = 0; x < SUBDIV; x++) {
        const i = y * (SUBDIV + 1) + x;
        indices.push(i, i + 1, i + SUBDIV + 1, i + 1, i + SUBDIV + 2, i + SUBDIV + 1);
      }
    }

    this.indexCount = indices.length;

    const gl = this.gl!;
    this.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    this.texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  private async loadPortraitImages() {
    const imagesToLoad = this.options.images?.length ? this.options.images : this.getDefaultImages();
    const loadPromises: Promise<void>[] = [];
    let loaded = 0;

    for (let i = 0; i < imagesToLoad.length; i++) {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      const promise = new Promise<void>((resolve) => {
        img.onload = () => {
          this.images.push(img);
          this.textures.push(this.createTexture(img)!);
          this.imageMetaData.push({
            width: img.naturalWidth || 100,
            height: img.naturalHeight || 100,
            aspectRatio: (img.naturalWidth || 1) / (img.naturalHeight || 1)
          });
          loaded++;
          this.options.onProgress?.(Math.round((loaded / imagesToLoad.length) * 100));
          resolve();
        };
        img.onerror = () => resolve();
        img.src = imagesToLoad[i];
      });

      loadPromises.push(promise);
    }

    await Promise.all(loadPromises);
    if (this.destroyed) return;
    this.computeLayout();
    this.options.onReady?.();
  }

  private computeLayout() {
    this.layoutPositions = [];
    let currentY = 0;

    for (let i = 0; i < this.images.length; i += this.itemsPerRow) {
      const rowItems: number[] = [];
      let rowAspectSum = 0;

      for (let j = 0; j < this.itemsPerRow && (i + j) < this.images.length; j++) {
        const index = i + j;
        const meta = this.imageMetaData[index];
        rowItems.push(index);
        rowAspectSum += meta.aspectRatio;
      }

      const rowHeight = this.targetRowWidth / rowAspectSum;
      let currentX = 0;

      for (const index of rowItems) {
        const meta = this.imageMetaData[index];
        const width = rowHeight * meta.aspectRatio;

        this.layoutPositions[index] = { x: currentX, y: currentY, width, height: rowHeight };
        currentX += width;
      }

      currentY += rowHeight;
    }

    this.gridWidth = this.targetRowWidth;
    this.gridHeight = currentY;
  }

  private getDefaultImages(): string[] {
    return [1011, 1015, 1018, 1020, 1023, 1025, 1029, 1031, 1033, 1035].map(
      (t) => `https://picsum.photos/id/${t}/100/100`
    );
  }

  private createTexture(t: HTMLImageElement): WebGLTexture | null {
    const gl = this.gl!;
    const s = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, s);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return s;
  }

  private getVisibleTiles() {
    if (!this.gridWidth || !this.gridHeight) return [];

    const tiles: { x: number; y: number; width: number; height: number; imageIndex: number }[] = [];
    const minX = this.viewOffset.x - this.canvas.width;
    const maxX = this.viewOffset.x + 2 * this.canvas.width;
    const minY = this.viewOffset.y - this.canvas.height;
    const maxY = this.viewOffset.y + 2 * this.canvas.height;

    const startCol = Math.floor(minX / this.gridWidth) - 1;
    const endCol = Math.ceil(maxX / this.gridWidth) + 1;
    const startRow = Math.floor(minY / this.gridHeight) - 1;
    const endRow = Math.ceil(maxY / this.gridHeight) + 1;

    for (let gy = startRow; gy <= endRow; gy++) {
      for (let gx = startCol; gx <= endCol; gx++) {
        for (let i = 0; i < this.images.length; i++) {
          const item = this.layoutPositions[i];
          const posX = gx * this.gridWidth + item.x;
          const posY = gy * this.gridHeight + item.y;

          if (posX + item.width >= minX && posX <= maxX &&
              posY + item.height >= minY && posY <= maxY) {
            tiles.push({ x: posX, y: posY, width: item.width, height: item.height, imageIndex: i });
          }
        }
      }
    }
    return tiles;
  }

  private render() {
    const gl = this.gl;
    if (!gl || !this.program || this.images.length === 0) return;

    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0.08, 0.08, 0.1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(this.program);

    const aPosition = gl.getAttribLocation(this.program, 'aPosition');
    gl.enableVertexAttribArray(aPosition);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const aTexCoord = gl.getAttribLocation(this.program, 'aTexCoord');
    gl.enableVertexAttribArray(aTexCoord);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    const uResolution = gl.getUniformLocation(this.program, 'uResolution');
    gl.uniform2f(uResolution, this.canvas.width, this.canvas.height);

    const uOffset = gl.getUniformLocation(this.program, 'uOffset');
    const uImagePosition = gl.getUniformLocation(this.program, 'uImagePosition');
    const uImageSize = gl.getUniformLocation(this.program, 'uImageSize');
    const uSampler = gl.getUniformLocation(this.program, 'uSampler');
    const uBulgeStrength = gl.getUniformLocation(this.program, 'uBulgeStrength');
    const uBulgeRadius = gl.getUniformLocation(this.program, 'uBulgeRadius');

    gl.uniform1f(uBulgeStrength, this.bulgeStrength);
    gl.uniform1f(uBulgeRadius, this.adjustedBulgeRadius);

    const visibleTiles = this.getVisibleTiles();

    for (const tile of visibleTiles) {
      gl.uniform2f(uOffset, this.viewOffset.x, this.viewOffset.y);
      gl.uniform2f(uImagePosition, tile.x, tile.y);
      gl.uniform2f(uImageSize, tile.width, tile.height);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.textures[tile.imageIndex]);
      gl.uniform1i(uSampler, 0);

      gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
    }
  }

  private handleClick(clientX: number, clientY: number) {
    const worldX = clientX + this.viewOffset.x;
    const worldY = clientY + this.viewOffset.y;
    const visibleTiles = this.getVisibleTiles();

    for (const tile of visibleTiles) {
      if (worldX >= tile.x && worldX <= tile.x + tile.width &&
          worldY >= tile.y && worldY <= tile.y + tile.height) {
        console.log('📸 Image clicked', tile.imageIndex, tile.x, tile.y);
        return;
      }
    }
  }

  private setupEventListeners() {
    this.canvas.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);

    this.canvas.addEventListener('touchstart', this.onTouchStart);
    window.addEventListener('touchmove', this.onTouchMove);
    window.addEventListener('touchend', this.onTouchEnd);

    this.canvas.addEventListener('click', this.onClick);
    this.canvas.addEventListener('wheel', this.onWheel);
    window.addEventListener('keydown', this.onKeyDown);
  }

  private teardownEventListeners() {
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);

    this.canvas.removeEventListener('touchstart', this.onTouchStart);
    window.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('touchend', this.onTouchEnd);

    this.canvas.removeEventListener('click', this.onClick);
    this.canvas.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('resize', this.onResize);
  }

  private animate = () => {
    if (this.destroyed) return;

    if (!this.drag.isDragging) {
      this.viewOffset.x += this.autoSpeedX;
      this.viewOffset.y += this.autoSpeedY;

      this.viewOffset.x -= this.drag.velocityX;
      this.viewOffset.y -= this.drag.velocityY;
      this.drag.velocityX *= this.inertia;
      this.drag.velocityY *= this.inertia;

      if (Math.abs(this.drag.velocityX) < 0.1) this.drag.velocityX = 0;
      if (Math.abs(this.drag.velocityY) < 0.1) this.drag.velocityY = 0;
    }

    if (this.gridWidth > 0) this.viewOffset.x %= this.gridWidth;
    if (this.gridHeight > 0) this.viewOffset.y %= this.gridHeight;

    this.render();
    this.rafId = requestAnimationFrame(this.animate);
  };

  private createProgram(vsSource: string, fsSource: string): WebGLProgram | null {
    const gl = this.gl!;
    const vs = this.loadShader(gl.VERTEX_SHADER, vsSource);
    const fs = this.loadShader(gl.FRAGMENT_SHADER, fsSource);
    const program = gl.createProgram()!;

    gl.attachShader(program, vs!);
    gl.attachShader(program, fs!);
    gl.linkProgram(program);

    if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
      return program;
    }
    console.error('Program Link Error:', gl.getProgramInfoLog(program));
    return null;
  }

  private loadShader(type: number, source: string): WebGLShader | null {
    const gl = this.gl!;
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      return shader;
    }
    console.error('Shader Compile Error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  /** Call from ngOnDestroy to stop the render loop and remove all listeners. */
  destroy() {
    this.destroyed = true;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.teardownEventListeners();
  }
}


@Component({
  selector: 'app-mygallary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mygallary.component.html',
  styleUrl: './mygallary.component.css'
})
export class MygallaryComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvasRef', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('cardRef', { static: true }) cardRef!: ElementRef<HTMLDivElement>;

  // ---- values the HTML reads ----
  loading = true; // true while images load (shows "Loading... %")
  loadingPercent = 0;
  isFullscreen = false;

  // ---- featured center card ----
  slides: { bg: string; fg: string }[] = [];
  activeIndex = 0;
  dragging = false;

  private renderer!: InfiniteGalleryRenderer; // draws the background wall

  private autoplayTimer: any = null; // timer that moves to the next slide automatically
  private readonly autoplayMs = 2000; // change slide every 2 seconds

  // card drag-to-move state
  private startX = 0;
  private startY = 0;
  private dragBaseX = 0;
  private dragBaseY = 0;
  dragOffsetX = 0;
  dragOffsetY = 0;

  // background scroll/drag -> slide advance state
  private readonly scrollStep = 90;
  private scrollAccum = 0;
  private bgDragging = false;
  private bgLastX = 0;
  private bgLastY = 0;

  // Event handlers stored as fields: removeEventListener needs the SAME function that was added
  private onCardMoveBound = (e: MouseEvent | TouchEvent) => this.onCardMove(e);
  private onCardUpBound = () => this.onCardUp();
  private onBgMoveBound = (e: MouseEvent | TouchEvent) => this.onBgMove(e);
  private onBgUpBound = () => this.onBgUp();
  private onWheelBound = (e: WheelEvent) => this.onWheel(e);

  // Runs once the HTML exists: build the slides, start the renderer and the autoplay.
  ngAfterViewInit(): void {
    // Full-resolution copies of the same images the background gallery uses,
    // so the two stay visually in sync without duplicating the asset list.
    this.slides = GALLERY_IMAGES.map((src) => {
      const big = src.replace(/w=\d+/, 'w=1000&q=80&auto=format&fit=crop');
      return { bg: big, fg: big };
    });

    this.renderer = new InfiniteGalleryRenderer({
      canvas: this.canvasRef.nativeElement,
      images: GALLERY_IMAGES,
      onProgress: (percent) => (this.loadingPercent = percent),
      onReady: () => (this.loading = false)
    });

    this.startAutoplay();
    this.setupBackgroundSync();

    document.addEventListener('fullscreenchange', this.onFullscreenChange);
  }

  // Runs when leaving the page: stop everything we started.
  ngOnDestroy(): void {
    this.renderer?.destroy();
    this.stopAutoplay();
    this.teardownBackgroundSync();
    document.removeEventListener('fullscreenchange', this.onFullscreenChange);
  }

  // ---------------------------------------------------------------------
  // Slideshow
  // ---------------------------------------------------------------------

  // Show slide number `index`. The maths makes it wrap around (after the last comes the first).
  private showSlide(index: number): void {
    const len = this.slides.length;
    this.activeIndex = ((index % len) + len) % len;
  }

  goNext(): void {
    this.showSlide(this.activeIndex + 1);
    this.startAutoplay();
  }

  goPrev(): void {
    this.showSlide(this.activeIndex - 1);
    this.startAutoplay();
  }

  private startAutoplay(): void {
    this.stopAutoplay();
    this.autoplayTimer = setInterval(() => this.showSlide(this.activeIndex + 1), this.autoplayMs);
  }

  private stopAutoplay(): void {
    if (this.autoplayTimer) clearInterval(this.autoplayTimer);
  }

  // ---------------------------------------------------------------------
  // Card drag-to-move (grabbing the card itself repositions it, then it
  // eases back to center on release)
  // ---------------------------------------------------------------------

  onCardDown(e: MouseEvent | TouchEvent): void {
    this.dragging = true;
    const point = 'touches' in e ? e.touches[0] : e;
    this.startX = point.clientX;
    this.startY = point.clientY;
    this.dragBaseX = this.dragOffsetX;
    this.dragBaseY = this.dragOffsetY;

    window.addEventListener('mousemove', this.onCardMoveBound);
    window.addEventListener('mouseup', this.onCardUpBound);
    window.addEventListener('touchmove', this.onCardMoveBound, { passive: true });
    window.addEventListener('touchend', this.onCardUpBound);
  }

  private onCardMove(e: MouseEvent | TouchEvent): void {
    if (!this.dragging) return;
    const point = 'touches' in e ? e.touches[0] : e;
    this.dragOffsetX = this.dragBaseX + (point.clientX - this.startX);
    this.dragOffsetY = this.dragBaseY + (point.clientY - this.startY);
  }

  private onCardUp(): void {
    if (!this.dragging) return;
    this.dragging = false;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;

    window.removeEventListener('mousemove', this.onCardMoveBound);
    window.removeEventListener('mouseup', this.onCardUpBound);
    window.removeEventListener('touchmove', this.onCardMoveBound);
    window.removeEventListener('touchend', this.onCardUpBound);
  }

  // The HTML binds this to the card's style so the card follows the mouse while dragging
  get cardTransform(): string {
    return `translate(calc(-50% + ${this.dragOffsetX}px), calc(-50% + ${this.dragOffsetY}px))`;
  }

  // ---------------------------------------------------------------------
  // Background scroll/drag -> advances the card's slide too. Read-only
  // listeners on the canvas; never touches the renderer's own drag/pan logic.
  // ---------------------------------------------------------------------

  private setupBackgroundSync(): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.addEventListener('mousedown', this.onBgDown);
    canvas.addEventListener('touchstart', this.onBgDown, { passive: true });
    canvas.addEventListener('wheel', this.onWheelBound, { passive: true });
  }

  private teardownBackgroundSync(): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.removeEventListener('mousedown', this.onBgDown);
    canvas.removeEventListener('touchstart', this.onBgDown);
    canvas.removeEventListener('wheel', this.onWheelBound);
    window.removeEventListener('mousemove', this.onBgMoveBound);
    window.removeEventListener('mouseup', this.onBgUpBound);
    window.removeEventListener('touchmove', this.onBgMoveBound);
    window.removeEventListener('touchend', this.onBgUpBound);
  }

  private onBgDown = (e: MouseEvent | TouchEvent) => {
    this.bgDragging = true;
    const point = 'touches' in e ? e.touches[0] : e;
    this.bgLastX = point.clientX;
    this.bgLastY = point.clientY;

    window.addEventListener('mousemove', this.onBgMoveBound);
    window.addEventListener('mouseup', this.onBgUpBound);
    window.addEventListener('touchmove', this.onBgMoveBound, { passive: true });
    window.addEventListener('touchend', this.onBgUpBound);
  };

  private onBgMove(e: MouseEvent | TouchEvent): void {
    if (!this.bgDragging) return;
    const point = 'touches' in e ? e.touches[0] : e;
    this.onBgMovement(point.clientX - this.bgLastX, point.clientY - this.bgLastY);
    this.bgLastX = point.clientX;
    this.bgLastY = point.clientY;
  }

  private onBgUp(): void {
    this.bgDragging = false;
    window.removeEventListener('mousemove', this.onBgMoveBound);
    window.removeEventListener('mouseup', this.onBgUpBound);
    window.removeEventListener('touchmove', this.onBgMoveBound);
    window.removeEventListener('touchend', this.onBgUpBound);
  }

  private onWheel(e: WheelEvent): void {
    this.onBgMovement(-e.deltaX, -e.deltaY);
  }

  private onBgMovement(deltaX: number, deltaY: number): void {
    this.scrollAccum += deltaX + deltaY;
    while (this.scrollAccum >= this.scrollStep) {
      this.goNext();
      this.scrollAccum -= this.scrollStep;
    }
    while (this.scrollAccum <= -this.scrollStep) {
      this.goPrev();
      this.scrollAccum += this.scrollStep;
    }
  }

  // ---------------------------------------------------------------------
  // Fullscreen toggle button
  // ---------------------------------------------------------------------

  toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) =>
        console.error(`Fullscreen error: ${err.message}`)
      );
    } else {
      document.exitFullscreen().catch((err) =>
        console.error(`Exit fullscreen error: ${err.message}`)
      );
    }
  }

  private onFullscreenChange = () => {
    this.isFullscreen = !!document.fullscreenElement;
  };
}