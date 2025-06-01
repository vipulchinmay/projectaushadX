import easyocr
import cv2
import numpy as np

# Load the image
image_path = r'C:\Users\spent\Desktop\aushadx_all\projectaushadX25\testing\zerodol.jpg'
image = cv2.imread(image_path)

# Create EasyOCR reader with GPU support (if available)
reader = easyocr.Reader(['en'], gpu=True)

# Perform OCR
results = reader.readtext(image)

# Loop over each result
for bbox, text, confidence in results:
    # Convert bbox to integer coordinates
    pts = np.array([bbox], dtype=np.int32)

    # Draw the bounding box
    cv2.polylines(image, [pts], isClosed=True, color=(0, 255, 0), thickness=2)

    # Get the top-left corner to place text
    top_left = tuple(pts[0][0])

    # Draw the detected text above the box
    cv2.putText(image, text, (top_left[0], top_left[1] - 10), 
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2)

# Show the image
cv2.imshow("OCR Results", image)
cv2.waitKey(0)
cv2.destroyAllWindows()
