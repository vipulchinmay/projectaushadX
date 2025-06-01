import easyocr

# Initialize reader for English, using CPU
reader = easyocr.Reader(['en'], gpu=True)

# Path to the image
image_path = r'C:\Users\spent\Desktop\aushadx_all\projectaushadX25\testing\zerodol.jpg'

# Run OCR
results = reader.readtext(image_path)

# Print the extracted text
for result in results:
    print(result)  # result[1] is the detected text

# easyocr.test_easyocr_basic(image_path)

if __name__=='__main__':
    image_path = r'C:\Users\spent\Desktop\aushadx_all\projectaushadX25\testing\zerodol.jpg'
    test_easyocr_basic(image_path)
    