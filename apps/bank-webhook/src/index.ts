import express from "express";
import db from "@repo/db/clients";
const app = express();
const PORT = 3002;

app.use(express.json())
console.log('Server is set up and waiting for requests...');
app.get("/", (req, res) => {
    res.send("Server is working");
});


app.post("/hdfcwebhook", async (req, res) => {
    console.log("Received request on /hdfcWebhook");
    //TODO: Add zod validation here?
    //TODO: HDFC bank should ideally send us a secret so we know this is sent by them
    const paymentInformation: {
        token: string;
        userId: string;
        amount: string
    } = {
        token: req.body.token,
        userId: req.body.user_identifier,
        amount: req.body.amount
    };
        
    try {
        await db.$transaction([
            // Upsert the balance record
            db.balance.upsert({
                where: {
                    userId: Number(paymentInformation.userId),
                },
                create: {
                    userId: Number(paymentInformation.userId),
                    amount: Number(paymentInformation.amount), // Start with the transaction amount if it's a new balance
                    locked: 0, // Start with the transaction amount if it's a new balance
                },
                update: {
                    amount: {
                        increment: Number(paymentInformation.amount), // Increment if the balance already exists
                    }
                }
            }),
        
            // Update the onRampTransaction status
            db.onRampTransaction.updateMany({
                where: {
                    token: paymentInformation.token,
                }, 
                data: {
                    status: "Success",
                }
            })
        ]);
        
        res.json({
            message: "Captured",
        });
    } catch(e) {
        console.error(e);
        res.status(411).json({
            message: "Error while processing webhook"
        })
    }

})


app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);  
});