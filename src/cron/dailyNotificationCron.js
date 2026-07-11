const cron = require("node-cron");
const User = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");
const { sendEmail } = require("../utils/sendEmail");

const startDailyNotificationCron = () => {
   console.log("Cron initialized");
  cron.schedule(
    "0 8 * * *",
    
    async () => {

      console.log("Running Daily Notification Cron...");

      try {

        // Last 24 hours
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const users = await User.find({});

        for (const user of users) {

          const newRequests = await ConnectionRequest.find({
            toUserId: user._id,
            status: "interested",
            createdAt: {
              $gte: yesterday,
            },
          }).populate("fromUserId", "firstName");

          if (newRequests.length === 0) continue;

          let requestList = "";

          newRequests.forEach((request) => {
            requestList += `
              <li>
                ${request.fromUserId.firstName}
              </li>
            `;
          });

          const html = `
          <div
            style="
              font-family:Arial;
              max-width:600px;
              margin:auto;
              padding:20px;
              border:1px solid #ddd;
              border-radius:8px;
            "
          >

          <h2>
            Good Morning ${user.firstName} 👋
          </h2>

          <p>
            You have
            <b>${newRequests.length}</b>
            new connection request(s) today.
          </p>

          <ul>
            ${requestList}
          </ul>

          <a
            href="${process.env.FRONTEND_URL}"
            style="
              display:inline-block;
              margin-top:20px;
              background:#2563eb;
              color:white;
              padding:12px 18px;
              text-decoration:none;
              border-radius:6px;
            "
          >
            Open DevNexus
          </a>

          <hr>

          <small>
            You're receiving this email because you have new activity on DevNexus.
          </small>

          </div>
          `;

          await sendEmail({
            to: user.emailId,
            subject: `You have ${newRequests.length} new connection request(s)`,
            html,
          });

        //   console.log(`Email sent to ${user.emailId}`);

        }

      } catch (err) {

        console.log(err);

      }

    },
    {
      timezone: "Asia/Kolkata",
    }
  );
};

module.exports = startDailyNotificationCron;