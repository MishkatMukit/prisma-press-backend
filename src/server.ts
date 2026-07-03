import app from "./app"
import config from "./config"
import { prisma } from "./lib/prisma"

const PORT = config.port

const main = async()=>{
    try {
        await prisma.$connect()
        console.log("prisma connected");
        app.listen(PORT, ()=>{
            console.log(`server is listening on port ${PORT}`);
        })
    } catch (error) {
        console.log("Error starting the server : ", error);
        await prisma.$disconnect();
        process.exit(1);
    }
}
main()