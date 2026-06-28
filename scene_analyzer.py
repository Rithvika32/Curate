import cv2
from ultralytics import YOLO

# ----------------------------------------
# Load YOLO once when the file is imported
# ----------------------------------------

model = YOLO("yolov8n.pt")


# ----------------------------------------
# Analyze one camera frame
# ----------------------------------------

def analyze_scene(frame):

    results = model(frame)

    names = results[0].names
    boxes = results[0].boxes

    height, width = frame.shape[:2]

    objects = []

    person = None

    # ----------------------------------------
    # Detect objects
    # ----------------------------------------

    for box in boxes:

        cls = int(box.cls[0])
        label = names[cls]

        objects.append(label)

        if label == "person" and person is None:

            x1, y1, x2, y2 = box.xyxy[0]

            center_x = float((x1 + x2) / 2 / width)
            center_y = float((y1 + y2) / 2 / height)

            area = float((x2 - x1) * (y2 - y1))
            frame_area = width * height

            person = {
                "center_x": center_x,
                "center_y": center_y,
                "size": area / frame_area
            }

    # ----------------------------------------
    # Brightness
    # ----------------------------------------

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    brightness = float(gray.mean())

    # ----------------------------------------
    # Scene dictionary
    # ----------------------------------------

    scene = {

        "objects": sorted(list(set(objects))),

        "object_count": len(objects),

        "brightness": brightness,

        "person": person,

        "frame": {
            "width": width,
            "height": height
        }

    }

    return scene


# ----------------------------------------
# Simple test
# ----------------------------------------

if __name__ == "__main__":

    cap = cv2.VideoCapture(0)

    while True:

        ret, frame = cap.read()

        if not ret:
            break

        scene = analyze_scene(frame)

        print(scene)

        annotated = model(frame)[0].plot()

        cv2.imshow("Scene Analyzer", annotated)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()