# VidTube - Backend Project

Welcome! This is the backend for **VidTube**, a simple video sharing platform. This project uses JavaScript and Node.js.

## What does VidTube do?

- Lets people sign up and log in
- Allows users to upload and watch videos
- Users can comment and like videos
- Everyone has a profile

## What is it built with?

- Node.js & Express.js for the server
- MongoDB for the database
- JWT for login security

## How to run it

1. **Install Node.js** (if you don’t have it)
2. **Clone this repo:**

    ```bash
    git clone https://github.com/chmp0940/VidTube---Backend-Project.git
    cd VidTube---Backend-Project
    ```

3. **Install dependencies:**

    ```bash
    npm install
    ```

4. **Set up your environment variables:**  
   Create a file named `.env` and add these lines (fill with your values):

    ```
    MONGODB_URI=your_mongodb_link
    JWT_SECRET=your_jwt_secret
    PORT=5000
    ```

5. **Start the server:**

    ```bash
    npm start
    ```

Server will run at [http://localhost:5000](http://localhost:5000)

## Main API Endpoints

- `POST /api/auth/register` – Create a new user
- `POST /api/auth/login` – Log in
- `GET /api/videos` – See all videos
- `POST /api/videos` – Upload a video

## Want to help or learn more?

- Contributions are welcome!
- For questions, open an issue or contact [chmp0940](https://github.com/chmp0940).

## License

MIT

---
Simple. Clear. Happy coding!
