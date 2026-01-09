#!/usr/bin/env python3
"""
Generate PWA icons for NeuroPlan
Creates PNG icons in various sizes from an SVG base
"""

import os
from pathlib import Path

# SVG icon template - Brain icon with NeuroPlan branding
SVG_TEMPLATE = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0F172A"/>
      <stop offset="100%" style="stop-color:#1E293B"/>
    </linearGradient>
  </defs>
  <rect width="{size}" height="{size}" rx="{radius}" fill="url(#bg)"/>
  <g transform="translate({offset}, {offset}) scale({scale})">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#22C55E"/>
    <circle cx="12" cy="8" r="2" fill="#22C55E"/>
    <path d="M12 4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 10c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#22C55E" opacity="0.7"/>
    <path d="M9 9c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1zm6 0c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1z" fill="#22C55E"/>
  </g>
</svg>'''

# Brain icon SVG - more detailed
BRAIN_SVG = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0F172A"/>
      <stop offset="100%" style="stop-color:#1E293B"/>
    </linearGradient>
  </defs>
  <rect width="{size}" height="{size}" rx="{radius}" fill="url(#bg)"/>
  <g transform="translate({center}, {center})">
    <g transform="scale({icon_scale}) translate(-12, -12)">
      <!-- Brain outline -->
      <path d="M12 2C8.5 2 5.5 4.5 5 8c-2 .5-3 2.5-3 4.5 0 2.5 2 4.5 4.5 4.5h11c2.5 0 4.5-2 4.5-4.5 0-2-1-4-3-4.5-.5-3.5-3.5-6-7-6z" 
            fill="none" stroke="#22C55E" stroke-width="1.5"/>
      <!-- Brain details -->
      <path d="M9 8c0-1.5 1.5-3 3-3s3 1.5 3 3" fill="none" stroke="#22C55E" stroke-width="1" opacity="0.8"/>
      <path d="M8 12h8" fill="none" stroke="#22C55E" stroke-width="1" opacity="0.6"/>
      <path d="M9 15c1 1 2 1 3 0s2-1 3 0" fill="none" stroke="#22C55E" stroke-width="1" opacity="0.6"/>
      <!-- Neural connections -->
      <circle cx="9" cy="9" r="1" fill="#22C55E"/>
      <circle cx="15" cy="9" r="1" fill="#22C55E"/>
      <circle cx="12" cy="12" r="1.5" fill="#22C55E"/>
      <circle cx="9" cy="14" r="0.8" fill="#22C55E" opacity="0.7"/>
      <circle cx="15" cy="14" r="0.8" fill="#22C55E" opacity="0.7"/>
    </g>
  </g>
</svg>'''

SIZES = [72, 96, 128, 144, 152, 192, 384, 512]

def generate_svg(size: int) -> str:
    """Generate SVG for a given size"""
    radius = size * 0.15  # 15% corner radius
    center = size / 2
    icon_scale = size / 24 * 0.6  # Scale to fit with padding
    
    return BRAIN_SVG.format(
        size=size,
        radius=radius,
        center=center,
        icon_scale=icon_scale
    )

def main():
    icons_dir = Path("/home/ubuntu/neuroplan/client/public/icons")
    icons_dir.mkdir(parents=True, exist_ok=True)
    
    for size in SIZES:
        svg_content = generate_svg(size)
        svg_path = icons_dir / f"icon-{size}x{size}.svg"
        
        # Write SVG file
        with open(svg_path, 'w') as f:
            f.write(svg_content)
        
        print(f"Generated: {svg_path}")
    
    # Also create a favicon.svg
    favicon_svg = generate_svg(32)
    with open(icons_dir / "favicon.svg", 'w') as f:
        f.write(favicon_svg)
    print("Generated: favicon.svg")

if __name__ == "__main__":
    main()
