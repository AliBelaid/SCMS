# Visitor Management Styling Reference

## 🎨 Quick Reference Guide

### Color Variables

```scss
// Primary Colors
$primary-gradient-start: #667eea;
$primary-gradient-end: #764ba2;
$primary-color: #667eea;

// Status Colors
$status-active: #4caf50;
$status-blocked: #f44336;
$status-warning: #ff9800;
$status-info: #2196f3;

// Background Colors
$bg-white: #ffffff;
$bg-light: #f8f9ff;
$bg-gradient-light: rgba(102, 126, 234, 0.03);
$bg-gradient-medium: rgba(102, 126, 234, 0.08);

// Text Colors
$text-primary: #333;
$text-secondary: #666;
$text-tertiary: #999;
$text-disabled: #ccc;

// Border Colors
$border-light: rgba(102, 126, 234, 0.1);
$border-medium: rgba(102, 126, 234, 0.2);
$border-heavy: rgba(102, 126, 234, 0.3);
```

### Shadow Presets

```scss
// Light Shadow
box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);

// Medium Shadow
box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);

// Heavy Shadow
box-shadow: 0 12px 48px rgba(102, 126, 234, 0.3);

// Hover Shadow (for cards)
box-shadow: 0 12px 48px rgba(102, 126, 234, 0.2);

// Image Shadow
box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
```

### Border Radius

```scss
$radius-small: 8px;
$radius-medium: 12px;
$radius-large: 16px;
$radius-xlarge: 20px;
$radius-pill: 24px;
$radius-circle: 50%;
```

### Spacing System (8px grid)

```scss
$spacing-xs: 8px;
$spacing-sm: 16px;
$spacing-md: 24px;
$spacing-lg: 32px;
$spacing-xl: 48px;
```

### Typography

```scss
// Font Sizes
$font-xs: 11px;
$font-sm: 13px;
$font-base: 15px;
$font-md: 16px;
$font-lg: 18px;
$font-xl: 24px;
$font-2xl: 28px;
$font-3xl: 32px;
$font-4xl: 40px;

// Font Weights
$weight-normal: 400;
$weight-medium: 500;
$weight-semibold: 600;
$weight-bold: 700;
$weight-extrabold: 800;
```

### Transition Presets

```scss
// Standard Transition
transition: all 0.3s ease;

// Fast Transition
transition: all 0.2s ease;

// Slow Transition
transition: all 0.5s ease;

// Transform Only (better performance)
transition: transform 0.3s ease;

// Opacity Only
transition: opacity 0.3s ease;

// Multiple Properties
transition: transform 0.3s ease, box-shadow 0.3s ease;
```

### Gradient Backgrounds

```scss
// Primary Gradient (Horizontal)
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

// Light Gradient Background
background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);

// Overlay Gradient (for images)
background: linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.7) 50%, transparent 100%);

// Radial Gradient (for effects)
background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);

// Gradient Border
border: 1px solid transparent;
background: linear-gradient(white, white) padding-box,
            linear-gradient(135deg, #667eea 0%, #764ba2 100%) border-box;
```

### Hover Effects

```scss
// Scale Up
&:hover {
  transform: scale(1.05);
}

// Scale and Rotate
&:hover {
  transform: scale(1.1) rotate(5deg);
}

// Lift Up
&:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.3);
}

// Slide Right
&:hover {
  transform: translateX(4px);
}

// Glow Effect
&:hover {
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
}
```

### Common Component Styles

#### Button

```scss
.custom-button {
  padding: 12px 32px;
  border-radius: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
  }
}
```

#### Card

```scss
.custom-card {
  border-radius: 20px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.15);
  border: 1px solid rgba(102, 126, 234, 0.1);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 12px 48px rgba(102, 126, 234, 0.2);
    transform: translateY(-4px);
  }
}
```

#### Profile Image

```scss
.profile-image {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid transparent;
  background: linear-gradient(white, white) padding-box,
              linear-gradient(135deg, #667eea 0%, #764ba2 100%) border-box;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: scale(1.15) rotate(5deg);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.3);
  }
}
```

#### Status Chip

```scss
.status-chip {
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 700;
  transition: all 0.3s ease;

  &.active {
    background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
    color: #2e7d32;
    border: 1px solid #4caf50;
  }

  &.blocked {
    background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
    color: #c62828;
    border: 1px solid #f44336;
  }

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}
```

#### Progress Bar

```scss
.progress-bar {
  height: 10px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
  }
}
```

### Animation Classes

```scss
// Fade In
.fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

// Slide Up
.slide-up {
  animation: slideUp 0.5s ease-out;
}

// Scale In
.scale-in {
  animation: scaleIn 0.6s ease-out;
}

// Pulse
.pulse {
  animation: pulse 2s ease-in-out infinite;
}

// Bounce
.bounce {
  animation: bounce 2s ease-in-out infinite;
}

// Float
.float {
  animation: float 3s ease-in-out infinite;
}
```

### Utility Classes

```scss
// Gradient Text
.gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

// Glass Effect
.glass-effect {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

// Elevated Shadow
.elevated {
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.15);
}

// Rounded
.rounded-lg {
  border-radius: 16px;
}

.rounded-xl {
  border-radius: 20px;
}
```

### Loading States

```scss
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120px;
  gap: 28px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%);
  border-radius: 16px;

  p {
    color: #667eea;
    font-size: 18px;
    font-weight: 600;
    animation: pulse 1.5s ease-in-out infinite;
  }
}
```

### Empty States

```scss
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px;
  text-align: center;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%);
  border-radius: 16px;

  mat-icon {
    font-size: 96px;
    width: 96px;
    height: 96px;
    color: #ddd;
    margin-bottom: 24px;
    animation: float 3s ease-in-out infinite;
  }

  h3 {
    color: #667eea;
    font-size: 24px;
    font-weight: 700;
  }

  p {
    color: #999;
    font-size: 16px;
  }
}
```

## 🎯 Usage Tips

1. **Always use the gradient for primary actions**
2. **Maintain consistent spacing with the 8px grid**
3. **Use transitions for smooth interactions**
4. **Apply shadows to create depth hierarchy**
5. **Use animations sparingly for important elements**
6. **Keep hover states consistent across similar elements**
7. **Test animations on lower-end devices**
8. **Ensure sufficient color contrast for accessibility**

## 📱 Responsive Breakpoints

```scss
// Mobile
@media (max-width: 768px) {
  // Adjust font sizes, spacing, and layouts
}

// Tablet
@media (min-width: 769px) and (max-width: 1024px) {
  // Medium screen adjustments
}

// Desktop
@media (min-width: 1025px) {
  // Large screen enhancements
}
```

---

**Quick Copy-Paste Ready!** 🚀

