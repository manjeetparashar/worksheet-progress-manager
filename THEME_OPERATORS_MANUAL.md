# 🎨 Theme Operator's Manual (Earth & Ochre Edition)

This manual documents the "Zenith" visual engine of the **Worksheet Manager**. The current theme, **"Earth & Ochre"**, is designed for a soothing, non-glaring experience using a "Muted Stone & Espresso" palette.

---

## 🛠️ The Global Dial: `src/index.css`

All colors are controlled via CSS Variables. Changing a hex code here updates the entire system instantly.

### **1. Primary Surface & Text Palette**
| Variable | Light Hex | Dark Hex | UI Role | Code Usage |
| :--- | :--- | :--- | :--- | :--- |
| `--bg-app` | `#F1F0E8` | `#1C1917` | Main page background | `body`, `KeyboardHelp.jsx`, `App.jsx` (fallback) |
| `--bg-class` | `#F8F7F2` | `#292524` | Class & Topic Cards, Modals | `ClassComponent.jsx`, `Modal.jsx`, `QuickCapture.jsx` |
| `--bg-subject` | `#E9E7DE` | `#1C1917` | Subject indent areas, Headers | `App.jsx` (sticky nav), `Modal.jsx` (header), `SubjectComponent.jsx` |
| `--text-main` | `#2C2724` | `#F5F5F4` | Primary titles, names, body text | `App.jsx`, `EditableText.jsx`, `TopicComponent.jsx`, `ClassComponent.jsx` |
| `--text-muted` | `#44403C` | `#D6D3D1` | Secondary info, inactive buttons | `App.jsx` (nav), `SubjectComponent.jsx` (icons), `AnalyticsDashboard.jsx` |
| `--text-accent`| `#92400E` | `#F59E0B` | Action links, focus rings, hover | `App.jsx` (+Class btn), `MarkdownEditor.jsx` (links), `AutoResizeTextarea.jsx` |
| `--text-danger`| `#991B1B` | `#EF4444` | Delete buttons (hover), High Prio | `ClassComponent.jsx`, `SubjectComponent.jsx`, `TopicComponent.jsx` |

### **2. Border & Structure**
| Variable | Light Hex | Dark Hex | UI Role | Code Usage |
| :--- | :--- | :--- | :--- | :--- |
| `--border-subtle`| `#DCD9D0` | `#44403C` | Card edges, internal dividers | `ClassComponent.jsx`, `App.jsx` (filters), `MarkdownEditor.jsx` |
| `--border-strong`| `#C9C6BC` | `#57534E` | Scrollbars, Key borders, Modal edges | `index.css` (scrollbar), `KeyboardHelp.jsx` (kbd), `SubjectComponent.jsx` |
| `--border-focus` | `#B45309` | `#F59E0B` | Active input outlines | `MarkdownEditor.jsx` (editing), `EditableText.jsx` |

### **3. Progress Spectrum**
These colors represent topic completion percentages across the UI.
*   **Done (`--status-done`)**: Light Green BG / Deep Green Text.
*   **Mid (`--status-mid`)**: Warm Amber BG / Deep Ochre Text.
*   **Low (`--status-low`)**: Soft Orange BG / Deep Rust Text.
*   **Zero (`--status-zero`)**: Muted Stone BG / Charcoal Text.

---

## 🏗️ Detailed Code Mapping

### **Navigation & Global UI (`src/App.jsx`)**
*   **Header Bar**: Uses `text-[var(--text-main)]` for title and `text-[var(--text-muted)]` for versioning.
*   **Navigation Buttons**: Inactive state uses `text-[var(--text-muted)]` and `hover:bg-[var(--bg-subject)]`.
*   **Active View**: Uses `bg-[var(--text-main)]` with `text-[var(--bg-app)]` for maximum distinction.
*   **Sticky Header**: Uses `bg-[var(--bg-app)]/95` with `backdrop-blur-md` to remain readable while scrolling.

### **Hierarchical Cards**
*   **Classes (`src/components/ClassComponent.jsx`)**: Background is `var(--bg-class)`. Header uses `border-b border-[var(--border-subtle)]`. Metadata badges use `bg-[var(--bg-app)]`.
*   **Subjects (`src/components/SubjectComponent.jsx`)**: Uses a `border-l-2 border-[var(--border-strong)]` to create vertical visual indentation.
*   **Topics (`src/components/TopicComponent.jsx`)**: Row backgrounds are `var(--bg-topic)`. Interactive headers use `bg-[var(--bg-topic-hover)]`.

### **Destructive Actions**
*   **Cross Signs (×)**: All delete buttons use `text-[var(--text-muted)]` by default. On hover, they switch to `text-white bg-[var(--text-danger)]`. This pattern is consistent in:
    *   `ClassComponent.jsx` (Class header)
    *   `SubjectComponent.jsx` (Subject row)
    *   `TopicComponent.jsx` (Topic header and Item rows)

### **Content Editing**
*   **Markdown Editor (`src/components/MarkdownEditor.jsx`)**: Rendered view uses `text-[var(--text-main)]` with links in `text-[var(--text-accent)]`. Editing view switches background to `var(--bg-app)`.
*   **Editable Text (`src/components/EditableText.jsx`)**: Selection focus uses `ring-[var(--selection-bg)]` and `border-[var(--text-accent)]`.

---

## 💡 Maintenance Tip
Redefining the entire system's palette only requires modifying the `:root` (Light) and `.dark` (Dark) sections in `src/index.css`. The components will automatically adapt as they are strictly mapped to these variables.
