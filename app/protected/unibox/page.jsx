import { createClient } from "@/utils/supabase/server";
import UniboxClient from "./unibox-client";

export default async function ProtectedPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return <div>No user session found!</div>;
  }

  // Query the inboxes table, joining with backends to get the base_url.
  const { data: inboxes, error: inboxError } = await supabase
    .from("inboxes")
    .select("*, backend:backends(base_url)")
    .eq("user_id", user.id)
    .order("last_message_timestamp", { ascending: false });

  if (inboxError) {
    return <div>Error loading messages: {inboxError.message}</div>;
  }

  const userInboxes = inboxes || [];

  return (
    <section>
      <UniboxClient userInboxes={userInboxes} />
    </section>
  );
}
