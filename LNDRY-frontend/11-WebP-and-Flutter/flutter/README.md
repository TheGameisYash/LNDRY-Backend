# LNDRY Flutter Raster Assets

The `illustrations/` folder uses Flutter's resolution-aware asset convention:

- Base folder: 256 px maximum edge
- `2.0x/`: 512 px maximum edge
- `3.0x/`: 768 px maximum edge

Declare the base asset path in `pubspec.yaml`; Flutter selects the appropriate density variant automatically.

Use the original transparent PNG masters under `assets/brand/v2/illustrations/` when a larger composition requires them. Service icons remain SVG masters and should be rendered through the project's approved SVG package.

The promotional banner WebP exports live under `assets/brand/v2/webp/banners/`.
