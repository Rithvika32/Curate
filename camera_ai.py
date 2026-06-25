import cv2
from ultralytics import YOLO

def score_scene(goal, detected_labels, brightness):

    score = 0

    if "plant" in goal:
        if "potted plant" in detected_labels:
            score += 30

    if "person" in goal:
        if "person" in detected_labels:
            score += 30

    if 70 <= brightness <= 200:
        score += 20

    if len(detected_labels) >= 3:
        score += 20

    return min(score, 100)

# -----------------------------
# Setup
# -----------------------------

model = YOLO("yolov8n.pt")

goal = input("Describe the photo you want: ").lower()

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Could not open camera.")
    exit()

# -----------------------------
# Main Loop
# -----------------------------

while True:

    ret, frame = cap.read()

    if not ret:
        break

    frame_height, frame_width = frame.shape[:2]

    # Run YOLO
    results = model(frame)

    names = results[0].names
    boxes = results[0].boxes

    detected_labels = []

    # Extract labels
    for box in boxes:
        cls_id = int(box.cls[0])
        label = names[cls_id]
        detected_labels.append(label)

    # Draw YOLO boxes
    annotated_frame = results[0].plot()

    # -----------------------------
    # Lighting Analysis
    # -----------------------------

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    brightness = gray.mean()

    score = score_scene(
    goal,
    detected_labels,
    brightness
    )

    if brightness < 70:
        lighting_feedback = "Lighting: Too Dark"
    elif brightness > 200:
        lighting_feedback = "Lighting: Too Bright"
    else:
        lighting_feedback = "Lighting: Good"

    # -----------------------------
    # Goal Matching
    # -----------------------------

    feedback = []

    if "person" in detected_labels:
        feedback.append("Subject detected")
    else:
        feedback.append("No person detected")

    if "plant" in goal or "plants" in goal:
        if "potted plant" in detected_labels:
            feedback.append("Plant detected")
        else:
            feedback.append("Need more plants")

    if "dog" in goal:
        if "dog" in detected_labels:
            feedback.append("Dog detected")
        else:
            feedback.append("Need a dog in frame")

    if "cat" in goal:
        if "cat" in detected_labels:
            feedback.append("Cat detected")
        else:
            feedback.append("Need a cat in frame")

    # -----------------------------
    # Subject Positioning
    # -----------------------------

    for box in boxes:

        cls_id = int(box.cls[0])
        label = names[cls_id]

        if label == "person":

            x1, y1, x2, y2 = box.xyxy[0]

            center_x = (x1 + x2) / 2

            area = (x2 - x1) * (y2 - y1)
            frame_area = frame_width * frame_height

            area_ratio = area / frame_area

            if center_x < frame_width * 0.35:
                feedback.append("Move camera slightly right")

            elif center_x > frame_width * 0.65:
                feedback.append("Move camera slightly left")

            if area_ratio < 0.10:
                feedback.append("Move closer to subject")

            break

    # -----------------------------
    # Display Feedback
    # -----------------------------

    cv2.putText(
        annotated_frame,
        f"Goal: {goal}",
        (10, 30),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.6,
        (0, 255, 0),
        2
    )

    cv2.putText(
        annotated_frame,
        lighting_feedback,
        (10, 60),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.6,
        (0, 255, 0),
        2
    )

    y = 90

    for item in feedback:

        cv2.putText(
            annotated_frame,
            item,
            (10, y),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (0, 255, 0),
            2
        )

        y += 30

    cv2.putText(
    annotated_frame,
    f"Score: {score}/100",
    (10, frame_height - 20),
    cv2.FONT_HERSHEY_SIMPLEX,
    0.8,
    (0, 255, 0),
    2
    )

    cv2.imshow("Camera Coach", annotated_frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()