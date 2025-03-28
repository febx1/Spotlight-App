import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Webhook } from "svix";
import { api } from "./_generated/api";

export const http = httpRouter();

// - This route is used to receive webhooks from Clerk
// - It verifies the webhook signature and creates a user in the database
// - The webhook secret is stored in the environment variable CLERK_WEBHOOK_SECRET
// - The webhook secret is used to verify the webhook signature
// - The webhook payload is parsed and the user is created in the database
// - The user is created with the email, name, image, and Clerk ID
// - The username is extracted from the email
// - The webhook is verified using the Clerk Webhook Secret

// 1 Make sure webhook isfrom clerk
// 2 Parse the webhook payload, by listening to user.created event
// 3 Add user to db

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("Missing CLERK_WEBHOOK_SECRET");
    }

    const svix_id = request.headers.get("svix-id");
    const svix_signature = request.headers.get("svix-signature");
    const svix_timestamp = request.headers.get("svix-timestamp");

    if (!svix_id || !svix_signature || !svix_timestamp) {
      throw new Response("Error occured -- no svix headers", { status: 400 });
    }

    const payload = await request.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(webhookSecret);
    let evt: any;
    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as any;
    } catch (error) {
      console.error("Error verifying webhook", error);
      return new Response("Error verifying webhook", { status: 400 });
    }

    const eventType = evt.type;
    if (eventType === "user.created") {
      const { id, email_addresses, first_name, last_name, image_url } =
        evt.data;

      const email = email_addresses[0].email_addresses;
      const name = `${first_name || ""} ${last_name || ""}.trim()`;

      try {
        await ctx.runMutation(api.users.createUser, {
          email,
          fullname: name,
          image: image_url,
          clerkId: id,
          username: email.split("@")[0],
        });
      } catch (error) {
        console.log("Error creating user", error);
        return new Response("Error creating user", { status: 500 });
      }
    }
    return new Response("Webhook received", { status: 200 });
  }),
});

export default http;
