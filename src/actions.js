"use server";
import User from "@/models/userModel";
import Conference from "@/models/conferenceModel";
import connectDB from "@/lib/connectDB";
import Paper from "@/models/paperModel";
import bcrypt from "bcryptjs";

export async function handleConferenceCreation(formData) {
  const name = formData.get("name");
  const submissionDeadline = formData.get("submissionDeadline");
  const location = formData.get("location");
  const description = formData.get("description");
  console.log(formData);
  await connectDB();
  try {
    const conference = await Conference.create({
      name,
      submissionDeadline,
      location,
      description,
    });
    console.log(conference.name, "created successfully");
  } catch (e) {
    console.log("Error creating conference");
  }
}


