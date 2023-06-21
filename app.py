from flask import Flask, request, jsonify, render_template
import easyocr
import cv2

app = Flask(__name__)
reader = easyocr.Reader(['en'])
IMAGE_PATH = './templates/input-image.jpg'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/process_image', methods=['POST'])
def process_image():
    if 'image' in request.files:
        image = request.files['image']
        image.save(IMAGE_PATH)

        img = cv2.imread(IMAGE_PATH)
        img = cv2.resize(img, (500, 300))
        result = reader.readtext(img)

        output = []
        for detection in result:
            top_left = tuple(detection[0][0])
            bottom_right = tuple(detection[0][2])
            text = detection[1]
            cv2.rectangle(img, top_left, bottom_right, (0, 255, 0), 3)
            cv2.putText(
                img,
                text,
                (20, 100),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (0, 98, 255),
                2,
                cv2.LINE_AA
            )
            output.append(text)

        cv2.imwrite('./static/output_image.jpg', img)  # Save the image with bounding boxes

        return jsonify({'result': output})

    return jsonify({'error': 'Image not provided'})

if __name__ == '__main__':
    app.run()