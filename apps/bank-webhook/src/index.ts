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
            db.balance.updateMany({
                where: {
                    userId: Number(paymentInformation.userId)
                },
                data: {
                    amount: {
                        // You can also get this from your DB
                        increment: Number(paymentInformation.amount)
                    }
                }
            }),
            db.onRampTransaction.updateMany({
                where: {
                    token: paymentInformation.token
                }, 
                data: {
                    status: "Success",
                }
            })
        ]);

        res.json({
            message: "Captured"
        })
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