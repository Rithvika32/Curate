import cv2

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Camera not working")
    exit()

while True:
    ret, frame = cap.read()

    if not ret:
        print("Failed to grab frame")
        break

    cv2.imshow("AI Camera Coach - Step 1", frame)

    # press q to quit
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()