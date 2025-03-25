"use server";
import User from "@/models/userModel";
import Conference from "@/models/conferenceModel";
import connectDB from "@/lib/connectDB";
import Paper from "@/models/paperModel";
import {signIn} from "@/lib/auth";

export async function handleSignUpForm(formData) {
  const fullName = formData.get("fullName");
  const email = formData.get("email");
  const password = formData.get("password");
  const role = formData.get("role");
  console.log(fullName, email, password, role);
  await connectDB();
  try {
    const user = await User.create({
      name: fullName,
      role,
      email,
      password,
    });
    console.log(user.name, "created successfully");
  } catch (e) {
    console.log("Error creating user");
  }
}

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

export async function handlePaperSubmission(formData) {
  const title = formData.get("title");
  const abstract = formData.get("abstract");
  const conferenceId = formData.get("conferenceId");
  await connectDB();
  try {
    const paper = await Paper.create({
      title,
      abstract,
    //   conferenceId,
    //   author: "Default Author",
      fileUrl: "Default File URL",
    });
    console.log("paper created successfully with title of ", paper.title);
  } catch (e) {
    console.log("Error creating paper",e);
  }
}

