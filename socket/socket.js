import io from '../index'
import User from '../models/usermodel.js'
import Chat from '../models/chat.js'




const activeUsers = {};

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Listen for user login and store socket ID
    socket.on("email", (useremail) => {
        activeUsers[useremail] = socket.id;
        console.log(`User ${useremail} mapped to socket ${socket.id}`);
    });

    io.emit('userlist',Object.key(activeUsers))

    socket.on("message", async ({ useremail, message }) => {
        try {
            // Check if receiver exists in DB
            const receiverExists = await User.findOne({ email: receiveremail });
            if (!receiverExists) {
                socket.emit("errormessage", { error: "User not registered" });
                return;
            }

            // Save chat message in DB
            const data = new Chat({ useremail, receiveremail, message });
            await data.save();

            // Send message to receiver if online
            if (activeUsers[receiveremail]) {
                io.to(activeUsers[receiveremail]).emit("receivedmessage", { useremail, message });
            }

            // Confirm to sender
            socket.emit("usermessage", { message: "Message sent successfully" });
        } catch (error) {
            console.error("Message sending error:", error);
            socket.emit("errormessage", { error: "Something went wrong" });
        }
    });

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);

        // Remove disconnected user from active users
        for (let email in activeUsers) {
            if (activeUsers[email] === socket.id) {
                delete activeUsers[email];
                break;
            }
        }
    });
});
