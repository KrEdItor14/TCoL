# Android icon & splash

**Source of truth (JPG):**

- `resources/icon.jpg` — официальный логотип TCoL (JPEG)
- `resources/logo.jpg` — копия того же файла

`@capacitor/assets` / Android mipmap работают с PNG, поэтому перед генерацией:

```bash
# из resources/icon.jpg собирается resources/icon.png (1024) при необходимости
convert resources/icon.jpg -resize 1024x1024 resources/icon.png
convert resources/icon.jpg -resize 2732x2732 -gravity center -background '#050e08' -extent 2732x2732 resources/splash.png

npm run generate:assets
npx cap sync android
```

Boot-экран приложения **не** использует картинку логотипа — только CSS-прицел + текст TCoL.
