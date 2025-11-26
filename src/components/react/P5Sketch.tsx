import React, { useRef, useEffect } from 'react';

interface Props {
  sketchName?: string;
  width?: number;
  height?: number;
  className?: string;
}

export default function P5Sketch({ sketchName = 'bouncingBall', width = 600, height = 300, className }: Props) {
  const elRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let p5Instance: any;
    let mounted = true;

    const sketches = import.meta.glob('/src/components/react/p5-sketches/*.{ts,js,tsx,jsx}', { eager: false });

    async function init() {
      if (!elRef.current) return;

      // 1. Załaduj p5 dynamicznie (TS: rzutujemy na konstruktora)
      const p5module = await import('p5');
      type P5Constructor = new (sketch: any, parent?: HTMLElement | string) => any;
      // p5 can be imported as a module namespace or as a default export, both need to be supported
      const p5Ctor = ((p5module as any).default || (p5module as any)) as P5Constructor;

      // 2. Znajdź i załaduj moduł sketch przez import.meta.glob
      const keys = Object.keys(sketches);
      // dopasuj końcówkę do sketchName (e.g. 'bouncingBall')
      const keyMatch = keys.find(k => k.endsWith(`/${sketchName}.ts`) || k.endsWith(`/${sketchName}.js`) || k.endsWith(`/${sketchName}.tsx`));
      let sketchFn: any = undefined;

      if (keyMatch) {
        const loader: any = sketches[keyMatch];
        const mod = await loader();
        sketchFn = mod && mod.default ? mod.default : undefined;
      }

      // 3. Jeśli znaleziono sketch - użyj go, w przeciwnym razie stwórz fallback
      if (sketchFn) {
        p5Instance = new p5Ctor(sketchFn, elRef.current as any);
      } else {
        // fallback - prosty komunikat
        p5Instance = new p5Ctor((p: any) => {
          p.setup = () => p.createCanvas(width, height);
          p.draw = () => {
            p.background(245);
            p.textSize(14);
            p.fill(0);
            p.text(`Sketch not found: ${sketchName}`, 10, 20);
          };
        }, elRef.current);
      }
    }

    init();

    return () => {
      mounted = false;
      if (p5Instance && p5Instance.remove) {
        try {
          p5Instance.remove();
        } catch (e) {
          // ignore cleanup errors
        }
      }
    };
  }, [sketchName, width, height]);

  return <div ref={elRef} className={className} style={{ width, height }} />;
}