from PIL import Image, ImageDraw, ImageFont
import os

# Create a simple icon with gradient background
def create_icon(size, filename):
    # Create image with dark background
    img = Image.new('RGB', (size, size), color='#1a1625')
    draw = ImageDraw.Draw(img)
    
    # Draw a purple circle
    margin = size // 8
    draw.ellipse([margin, margin, size-margin, size-margin], 
                 fill='#a855f7', outline='#ec4899', width=size//40)
    
    # Draw a pen/quill symbol (simplified)
    pen_width = size // 20
    pen_start_x = size // 2 - pen_width
    pen_start_y = size // 3
    pen_end_x = size // 2 + pen_width
    pen_end_y = size * 2 // 3
    
    draw.line([pen_start_x, pen_start_y, pen_end_x, pen_end_y], 
              fill='#ffffff', width=pen_width)
    
    img.save(filename, 'PNG')
    print(f'Created {filename}')

# Create icons
create_icon(192, 'icon-192.png')
create_icon(512, 'icon-512.png')
