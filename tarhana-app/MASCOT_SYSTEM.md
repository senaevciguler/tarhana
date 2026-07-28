# Ella's Pantry — Mascot Character & Premium Animation System

Welcome to the **Ella's Pantry Brand Character System**. This system provides a clean, highly modular, and future-proof mascot infrastructure for our brand character, **Ella**.

By decoupling the animation states into distinct DOM layers, the component prevents CSS keyframe collisions and allows viewport entrance transitions, continuous looping behaviors, and subtle cursor hover reactions to occur concurrently and smoothly.

---

## 1. How the EllaCharacter Component Works

The `<app-ella-character>` component is designed as a standalone, self-contained Angular component that avoids hardcoded dependencies on any specific page. It utilizes an HTML element hierarchy corresponding to separate concerns of movement and appearance:

```html
<div [class]="getContainerClasses()"> <!-- Layer 1: Sizing & Alignment Layout -->
  <div [class]="getEntryClasses()">   <!-- Layer 2: Viewport-triggered Entrance Transition -->
    <div [class]="getLoopingClasses()"> <!-- Layer 3: Continuous Looping Idle Animation -->
      <img [src]="getImageSrc()" />      <!-- Layer 4: Graphic Layer (Hover & Micro-interactions) -->
    </div>
  </div>
</div>
```

### The 4 Decoupled Layers:
1. **Layout / Container Layer:** Manages size presets (`small`, `medium`, `large` or custom classes), flexbox alignments, responsive viewport adjustments, and padding bounds.
2. **Viewport Entrance Layer:** Uses an internal Angular `signal` triggered by an `IntersectionObserver` to trigger a premium, soft viewport fade-in animation (`ella-fade` or `ella-fade-in`) when the mascot scrolls into view.
3. **Looping Animation Layer:** Runs high-end, slow, looping animations (`ella-float`, `ella-idle`, `ella-breath`, `ella-rotate`) in a separate element layer, eliminating interference with viewport entry or cursor hover transitions.
4. **Interactive Image Layer:** Binds the corresponding mascot pose image URL and handles smooth transition-based micro-interactions (such as the premium `hover:scale-[1.02] hover:rotate-[1deg]`) with long, luxurious, ease-out durations (700ms).

---

## 2. Component Properties (API Reference)

The component exposes the following `@Input` parameters to customize its presentation dynamically:

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `size` | `'small' \| 'medium' \| 'large' \| string` | `'medium'` | Selects a standard responsive size preset or takes custom classes. |
| `alignment` | `'left' \| 'right' \| 'center' \| 'none'` | `'none'` | Controls the flex-based horizontal alignment within its parent. |
| `animation` | `'float' \| 'idle' \| 'fade' \| 'fade-in' \| 'breath' \| 'rotate' \| 'none'` | `'none'` | Selects the active looping animation or entrance effect combination. |
| `floating` | `boolean` | `false` | Quick legacy toggle helper to force the float looping animation. |
| `hoverEffect` | `boolean` | `true` | When true, enables the premium, subtle hover scale & rotation effect. |
| `lazy` | `boolean` | `true` | Controls image asset preloading/deferral behavior (`lazy` or `eager`). |
| `pose` | `'default' \| 'cooking' \| 'stirring' \| 'waving' \| 'wave' \| 'shopping' \| 'reading' \| string` | `'default'` | Configures the pose variation to render. |
| `altText` | `string` | `'Ella Mascot'` | Accessible text label bound to the image tag. |

### Code Usage Examples

**Elegant Small Floating Mascot aligned Right:**
```html
<app-ella-character
  size="small"
  alignment="right"
  animation="float"
  [hoverEffect]="true">
</app-ella-character>
```

**Large Mascot in "Cooking" Pose, fading in upon scroll with subtle idle breathing:**
```html
<app-ella-character
  size="large"
  alignment="center"
  animation="idle"
  pose="cooking">
</app-ella-character>
```

---

## 3. How to Add a New Mascot Pose

The mascot infrastructure is designed to decouple layout from illustration updates. When a new SVG/PNG illustration for an Ella pose (e.g., cooking, reading, stirring) is finalized, you can integrate it instantly without modifying page templates:

1. **Save the New Asset:** Put the transparent PNG or SVG illustration into the `/assets/` directory (e.g. `/assets/ella-cooking.png`).
2. **Register the Pose in the Component:** Open `tarhana-app/src/app/components/ella-character/ella-character.ts` and locate the `poseMap` dictionary.
3. **Map the Enum to the Asset Path:** Add the key-value pair mapping your new pose ID to the asset path:

```typescript
private poseMap: Record<string, string> = {
  'default': '/assets/ella-character.png',
  'cooking': '/assets/ella-cooking.png', // <-- Simply point the pose to the new file path!
  'stirring': '/assets/ella-stirring.png',
  'waving': '/assets/ella-waving.png',
  'wave': '/assets/ella-waving.png',
  'shopping': '/assets/ella-shopping.png',
  'reading': '/assets/ella-reading.png'
};
```

---

## 4. How to Choose an Animation Variant

All animations have been calibrated to feel elegant, minimal, and premium (resembling Apple, Notion, or Linear). Avoid cartoonish, hyperactive, or fast-bouncing configurations.

### 1. Viewport Entrance Animation (`animation="fade"`)
* **Visual Feel:** Smooth fade combined with an organic, subtle upward lift upon reaching the viewport.
* **Duration/Easing:** 1.2s driven by `cubic-bezier(0.16, 1, 0.3, 1)` (Power4/Quintic ease-out style).
* **When to use:** On landing, about, or story sections where the mascot scrolls in as a supporting editorial element.

### 2. Gentle Floating Loop (`animation="float"`)
* **Visual Feel:** An extremely slow, continuous vertical translation.
* **Keyframes:** `0% { transform: translateY(0); } 50% { transform: translateY(-3px); } 100% { transform: translateY(0); }`
* **Duration:** 9 seconds.
* **When to use:** Floating or standalone promo blocks, empty cart drawers, or success banners where the mascot should feel weightless.

### 3. Subtle Breeding/Idle Loop (`animation="idle"`)
* **Visual Feel:** A near-unnoticeable, micro-pulsing scaling effect mimicking organic breathing.
* **Keyframes:** `0% { transform: scale(1.0); } 50% { transform: scale(1.008); } 100% { transform: scale(1.0); }`
* **Duration:** 10 seconds.
* **When to use:** Embedded inline inside paragraphs, text columns, form-adjacent containers, or card headers where a floating movement would distract the user.

---

## 5. Visual Guidelines & Asset Storage

To maintain brand consistency:
* **Assets Location:** All mascot illustrations must be placed under `tarhana-app/public/assets/` (or `/assets/` alias path inside the Angular app), alongside our main transparent `ella-character.png` file.
* **Format:** Use high-resolution, transparent PNGs with cropped margins, or vector SVGs.
* **Sizing Principle:** Standardize assets such that the mascot is vertically centered and elements (spatulas, soup pots, books) do not overflow bounds unevenly.
* **Colors:** Illustrations should stay consistent with Ella's core brand palette: Forest Green (`#23452E`), Warm Ochre/Gold, Soft Indigo, and Cream.
