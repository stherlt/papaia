import requests

# Replace with your Ngrok URL
server_url = "https://eedd-142-244-6-66.ngrok-free.app/upload"  

def send_image(image_path):
    # Open the image file you want to send
    with open(image_path, "rb") as img_file:
        files = {"image": img_file}  # Add the image file to the request
        # Send the POST request to the Flask server through Ngrok
        response = requests.post(server_url, files=files)

    # Print the response from the Flask server
    print(response.json())

# Test it
send_image("path/to/your/image.jpg")