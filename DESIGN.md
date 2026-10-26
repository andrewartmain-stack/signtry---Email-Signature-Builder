# DESIGN.md — Fonts and Colors

Read this before writing any UI. Use only the fonts and colors below. The page is always light (`color-scheme: light`); do not add a dark mode.

---

## Fonts

| Role                 | Family                               | Weights       |
| -------------------- | ------------------------------------ | ------------- |
| Headings (`h1`–`h3`) | **TT Neoris**, falling back to Geist | 500           |
| Body and UI          | **Geist** (Geist Sans)               | 400, 500, 600 |

TT Neoris is a licensed font. If the font files are available, load them with `@font-face`; otherwise headings fall back to Geist.

```html
<link
  href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&display=swap"
  rel="stylesheet"
/>
```

```css
body {
  font-family: 'Geist', system-ui, sans-serif;
}
h1,
h2,
h3 {
  font-family: 'TT Neoris', 'Geist', system-ui, sans-serif;
  font-weight: 500;
  letter-spacing: -0.03em;
  line-height: 1.08;
}
```

Tailwind:

```js
fontFamily:{
  sans:['Geist','system-ui','sans-serif'],
  display:['TT Neoris','Geist','system-ui','sans-serif']
}
```

---

## Colors

### Brand palette

| Name   | Hex       | Use                                                                                    |
| ------ | --------- | -------------------------------------------------------------------------------------- |
| Ink    | `#061b31` | Text, dark buttons, footer background, top of the customer-stories gradient            |
| Teal   | `#5edfd7` | Gradient accent                                                                        |
| Blue   | `#6cb0ff` | Gradient accent, main stage color                                                      |
| Violet | `#b89ffa` | Gradient accent (recaps, stories)                                                      |
| Lime   | `#dbee9f` | Section tag pill (with Ink text), bottom of the assistant gradient, calendar day hover |

Blue, Teal, Violet and Lime are used in gradients, tags and highlights only. Never use them as text or button colors.

### Neutrals and utility

| Name            | Value               | Use                                                                           |
| --------------- | ------------------- | ----------------------------------------------------------------------------- |
| Page background | `#f7f5ef`           | Page and cream sections                                                       |
| Soft surface    | `#fcfbf8`           | "AI meeting manager" section                                                  |
| Card            | `#ffffff`           | Cards, panels, outlined buttons                                               |
| Muted text      | `#4a5d72`           | Subheads, descriptions                                                        |
| Line            | `rgba(6,27,49,.12)` | Borders and dividers                                                          |
| Footer muted    | `#9db3c9`           | Small text on the navy footer                                                 |
| Action blue     | `#0b5cff`           | Primary blue button, selected calendar day, time slots, toggle on, focus ring |

### CSS variables

```css
:root {
  --ink: #061b31;
  --teal: #5edfd7;
  --blue: #6cb0ff;
  --violet: #b89ffa;
  --lime: #dbee9f;
  --bg: #f7f5ef;
  --card: #fff;
  --muted: #4a5d72;
  --line: rgba(6, 27, 49, 0.12);
  color-scheme: light;
}
```

Tailwind:

```js
colors:{ ink:'#061b31', teal:'#5edfd7', brand:'#6cb0ff', violet:'#b89ffa', lime:'#dbee9f',
         cream:'#f7f5ef', muted:'#4a5d72', action:'#0b5cff' }
```

### Gradients

```css
/* Hero stage */
radial-gradient(70% 90% at 15% 20%,#eaf3ff,transparent 60%),
radial-gradient(60% 80% at 90% 85%,var(--blue),transparent 70%),
radial-gradient(40% 60% at 5% 95%,var(--teal),transparent 70%),#c5deff

/* Booking stage */      linear-gradient(160deg,var(--blue),#a9d4ff 55%,var(--teal))
/* Assistant stage */    linear-gradient(180deg,var(--blue),var(--teal) 62%,var(--lime))
/* Recaps stage */       linear-gradient(160deg,var(--blue),var(--violet) 70%,#f3c8f0)
/* Payments stage */     linear-gradient(160deg,var(--blue),#b9d8ff 60%,var(--teal))
/* Customer stories */   linear-gradient(180deg,#061b31 0,#123f9c 20%,var(--blue) 50%,var(--violet) 78%,var(--bg))
```
