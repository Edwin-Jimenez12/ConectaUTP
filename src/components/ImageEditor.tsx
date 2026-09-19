import { Check, Move, RotateCcw, X, ZoomIn } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';

const WORKSPACE_WIDTH = 900;
const WORKSPACE_HEIGHT = 700;
const CROP_WIDTH = 840;
const CROP_HEIGHT = 560;
const CROP_X = (WORKSPACE_WIDTH - CROP_WIDTH) / 2;
const CROP_Y = (WORKSPACE_HEIGHT - CROP_HEIGHT) / 2;
const OUTPUT_WIDTH = 900;
const OUTPUT_HEIGHT = 600;
const MIN_ZOOM = 0.55;
const MAX_ZOOM = 3;

interface ImageEditorProps {
  source: File | string;
  title?: string;
  onCancel: () => void;
  onSave: (file: File) => void;
}

interface ImageState {
  element: HTMLImageElement;
  name: string;
}

interface Offset {
  x: number;
  y: number;
}

function loadImage(source: File | string) {
  return new Promise<ImageState>((resolve, reject) => {
    const objectUrl = source instanceof File ? URL.createObjectURL(source) : source;
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      if (source instanceof File) URL.revokeObjectURL(objectUrl);
      resolve({ element: image, name: source instanceof File ? source.name : 'imagen-ajustada' });
    };
    image.onerror = () => {
      if (source instanceof File) URL.revokeObjectURL(objectUrl);
      reject(new Error('No se pudo cargar la imagen para editarla.'));
    };
    image.src = objectUrl;
  });
}

function drawImageInRegion(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  region: { x: number; y: number; width: number; height: number },
  zoom: number,
  offset: Offset,
) {
  const scale = Math.max(region.width / image.naturalWidth, region.height / image.naturalHeight) * zoom;
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  const x = region.x + region.width / 2 - width / 2 + offset.x;
  const y = region.y + region.height / 2 - height / 2 + offset.y;
  context.drawImage(image, x, y, width, height);
}

function drawPreview(canvas: HTMLCanvasElement, image: HTMLImageElement, zoom: number, offset: Offset) {
  const context = canvas.getContext('2d');
  if (!context) return;
  context.clearRect(0, 0, WORKSPACE_WIDTH, WORKSPACE_HEIGHT);
  context.fillStyle = '#171b2d';
  context.fillRect(0, 0, WORKSPACE_WIDTH, WORKSPACE_HEIGHT);
  drawImageInRegion(context, image, { x: CROP_X, y: CROP_Y, width: CROP_WIDTH, height: CROP_HEIGHT }, zoom, offset);

  context.fillStyle = 'rgba(0, 0, 0, 0.56)';
  context.fillRect(0, 0, WORKSPACE_WIDTH, CROP_Y);
  context.fillRect(0, CROP_Y + CROP_HEIGHT, WORKSPACE_WIDTH, WORKSPACE_HEIGHT - CROP_Y - CROP_HEIGHT);
  context.fillRect(0, CROP_Y, CROP_X, CROP_HEIGHT);
  context.fillRect(CROP_X + CROP_WIDTH, CROP_Y, WORKSPACE_WIDTH - CROP_X - CROP_WIDTH, CROP_HEIGHT);

  context.strokeStyle = '#c09bff';
  context.lineWidth = 4;
  context.strokeRect(CROP_X, CROP_Y, CROP_WIDTH, CROP_HEIGHT);
  context.fillStyle = '#edf1fb';
  context.font = '600 22px Inter, sans-serif';
  context.fillText('Área final 3:2', CROP_X + 16, CROP_Y - 22);
}

function createOutputCanvas(image: HTMLImageElement, zoom: number, offset: Offset) {
  const canvas = document.createElement('canvas');
  canvas.width = OUTPUT_WIDTH;
  canvas.height = OUTPUT_HEIGHT;
  const context = canvas.getContext('2d');
  if (!context) return canvas;
  context.fillStyle = '#171b2d';
  context.fillRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);
  drawImageInRegion(context, image, { x: 0, y: 0, width: OUTPUT_WIDTH, height: OUTPUT_HEIGHT }, zoom, {
    x: offset.x * OUTPUT_WIDTH / CROP_WIDTH,
    y: offset.y * OUTPUT_HEIGHT / CROP_HEIGHT,
  });
  return canvas;
}

export function ImageEditor({ source, title = 'Ajustar imagen', onCancel, onSave }: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);
  const [image, setImage] = useState<ImageState | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    void loadImage(source).then((loaded) => {
      if (active) setImage(loaded);
    }).catch(() => {
      if (active) setError('No se pudo abrir esta imagen.');
    });
    return () => { active = false; };
  }, [source]);

  useEffect(() => {
    if (image && canvasRef.current) drawPreview(canvasRef.current, image.element, zoom, offset);
  }, [image, offset, zoom]);

  function handlePointerDown(event: PointerEvent<HTMLCanvasElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, y: event.clientY, offsetX: offset.x, offsetY: offset.y };
  }

  function handlePointerMove(event: PointerEvent<HTMLCanvasElement>) {
    if (!dragRef.current || !canvasRef.current) return;
    const bounds = canvasRef.current.getBoundingClientRect();
    setOffset({
      x: dragRef.current.offsetX + (event.clientX - dragRef.current.x) * WORKSPACE_WIDTH / bounds.width,
      y: dragRef.current.offsetY + (event.clientY - dragRef.current.y) * WORKSPACE_HEIGHT / bounds.height,
    });
  }

  function reset() {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }

  function save() {
    if (!image) return;
    const canvas = createOutputCanvas(image.element, zoom, offset);
    canvas.toBlob((blob) => {
      if (!blob) {
        setError('No se pudo guardar el ajuste.');
        return;
      }
      onSave(new File([blob], `${image.name.replace(/\.[^.]+$/, '')}.webp`, { type: 'image/webp' }));
    }, 'image/webp', 0.86);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700">
        <div className="flex items-center justify-between gap-4"><div><h2 className="text-lg font-semibold">{title}</h2><p className="mt-1 text-xs text-[#676878]">Aleja, acerca o arrastra la imagen. El marco púrpura muestra exactamente el área que se guardará.</p></div><button className="cursor-pointer rounded-md p-2 text-[#676878] hover:bg-[#f4f1ff]" type="button" onClick={onCancel} aria-label="Cerrar editor"><X className="h-5 w-5" /></button></div>
        <div className="mt-5 overflow-hidden rounded-lg bg-[#171b2d] p-2"><canvas className="block aspect-[9/7] h-auto w-full cursor-move touch-none rounded-md" ref={canvasRef} width={WORKSPACE_WIDTH} height={WORKSPACE_HEIGHT} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={() => { dragRef.current = null; }} onPointerCancel={() => { dragRef.current = null; }} aria-label="Vista previa ajustable con marco de recorte" /></div>
        {error && <p className="mt-3 rounded-md bg-[#fff0f0] p-3 text-sm text-[#b42318]">{error}</p>}
        <div className="mt-4 flex flex-wrap items-center gap-3"><label className="flex min-w-56 flex-1 items-center gap-2 text-sm"><ZoomIn className="h-4 w-4 text-[#7b32ca]" /><span className="sr-only">Zoom</span><input className="w-full accent-[#7b32ca]" type="range" min={MIN_ZOOM} max={MAX_ZOOM} step="0.01" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} /></label><button className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-[#d9d2eb] px-3 py-2 text-sm text-[#5420a8]" type="button" onClick={reset}><RotateCcw className="h-4 w-4" />Restablecer</button></div>
        <p className="mt-3 inline-flex items-center gap-2 text-xs text-[#676878]"><Move className="h-4 w-4" />El área marcada se guardará en WebP con proporción 3:2. El margen oscuro solo es una guía.</p>
        <div className="mt-5 flex justify-end gap-3 border-t border-slate-100 pt-4"><button className="cursor-pointer rounded-md border border-[#d9d2eb] px-4 py-2 text-sm font-semibold text-[#5420a8]" type="button" onClick={onCancel}>Cancelar</button><button className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-[#7b32ca] px-4 py-2 text-sm font-semibold text-white" type="button" onClick={save} disabled={!image}><Check className="h-4 w-4" />Guardar ajuste</button></div>
      </div>
    </div>
  );
}
