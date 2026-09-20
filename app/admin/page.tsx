import { redirect } from "next/navigation";

/**
 * The owner area moved to /owner. This stub exists only so the owner's old
 * bookmark (/admin) still lands on the login screen. It carries no admin
 * functionality — every real page and server action lives under /owner and
 * is authenticated there.
 */
export default function AdminRedirectPage() {
  redirect("/owner");
}
