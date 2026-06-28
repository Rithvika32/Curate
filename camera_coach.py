import cv2
from ultralytics import YOLO

# load YOLO
model = YOLO("yolov8n.pt")
goal = {
  "objects": ["person", "laptop", "plant"],
  "lighting": "soft",
  "composition": "centered",
  "mood": "casual"
}

def get_detected_objects(results):
    labels = []
    for box in results[0].boxes:
        cls_id = int(box.cls[0])
        labels.append(results[0].names[cls_id])
    return labels

def compare(goal, detected):
    feedback = []

    for obj in goal["objects"]:
        if obj not in detected:
            feedback.append(f"Add {obj} to frame")

    if len(detected) > 5:
        feedback.append("Too many objects — simplify composition")

    return feedback

cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    results = model(frame)
    detected = get_detected_objects(results)

    feedback = compare(goal, detected)

    annotated = results[0].plot()

    y = 30
    for f in feedback:
        cv2.putText(
            annotated,
            f,
            (10, y),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (0, 255, 0),
            2
        )
        y += 25

    cv2.imshow("Curate Camera Coach", annotated)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()