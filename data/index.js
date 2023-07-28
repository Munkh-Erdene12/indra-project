const mongoose = require("mongoose");
const connect = async () => {
  const conn = await mongoose.connect(process.env.MONGODB__URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log(
    `MongoDB холбогдолоо: ${conn.connection.host}`.cyan.underline.bold
  );
};
module.exports = connect;
