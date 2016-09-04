# Whiteboard test case app
This app is created for showing of my skills.

# Requirements
- Node 4+

# Usage for development
    npm i
    npm run static
    npm run start

# Build for production
    npm i
    npm run build
    npm run start

# Where look
http://127.0.0.1:9999

# Development
## NPM scripts
- ```test``` run tests
- ```start``` start server
- ```static``` build static and watch changes in source files
- ```build``` build static for deploy (with optimizations)

## Gulp tasks
### Client scripts
- ```js``` make app.js file
- ```js:watch``` make app.js file and watch changes in source js files
- ```js:build``` build minified app.js file

### Client styles
- ```sass``` make index.css file
- ```sass:watch``` make index.css file and watch changes in source scss files
- ```sass:build``` build prefixed and minified index.css file from sources

### Client HTML
- ```html``` copy index.html file from sources to app folder
- ```html:build``` minify html files in app folder

### Images
- ```images``` copy images file from sources folder to app folder
- ```svgo``` minify and optimize svg files in app folder

### Series
- ```default``` async execute sequence ```cleanup, js:watch, sass, sass:watch, html, html:watch, images, images:watch``` (for development)
- ```build``` sync execute sequence ```cleanup, sass, sass:build, js:build, images, svgo, html, html:build``` (for production)
