"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  AnnouncementInsert,
  DonationTierInsert,
  DonationTierRow,
  PrayerRequestStatus,
  ProductInsert,
  ProductOrderStatus,
  ProductRow,
  TestimonialInsert,
  TestimonialStatus,
  VideoSourceType,
} from "@/lib/types/database";
import type { SiteContent } from "@/lib/content/site-content";

/** Every page whose text/media comes from Supabase; revalidated after an edit. */
const CONTENT_DEPENDENT_PATHS = ["/", "/about", "/contact"] as const;

async function assertAuthenticated() {
  const supabase = createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/admin/login");
  }

  return session;
}

/**
 * Flips a prayer request between 'pending' and 'answered'. Runs under the
 * service role key because the public RLS policy intentionally grants no
 * SELECT/UPDATE to anonymous or authenticated site visitors -- only this
 * server action, gated by `assertAuthenticated`, can mutate the table.
 */
export async function updatePrayerRequestStatus(
  id: string,
  status: PrayerRequestStatus
) {
  await assertAuthenticated();

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("prayer_requests")
    .update({ status })
    .eq("id", id);

  if (error) {
    throw new Error("Failed to update prayer request status.");
  }

  revalidatePath("/admin");
}

export async function signOutAdmin() {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

/**
 * Upserts one or more site_content rows (homepage hero, About text,
 * contact details) and revalidates every public page that reads them.
 */
export async function updateSiteContent(entries: Partial<SiteContent>) {
  await assertAuthenticated();

  const admin = createSupabaseAdminClient();
  const rows = Object.entries(entries).map(([key, value]) => ({
    key,
    value: value ?? "",
  }));

  if (rows.length === 0) return;

  const { error } = await admin.from("site_content").upsert(rows, { onConflict: "key" });

  if (error) {
    throw new Error("Failed to save site content.");
  }

  for (const path of CONTENT_DEPENDENT_PATHS) {
    revalidatePath(path);
  }
  revalidatePath("/admin");
}

/**
 * Publishes a new video message (already uploaded to Supabase Storage by
 * the client) and deactivates every previous one, so the homepage always
 * shows exactly one -- the most recent.
 */
export async function publishVideoMessage(
  videoUrl: string,
  sourceType: VideoSourceType,
  caption: string
) {
  await assertAuthenticated();

  const admin = createSupabaseAdminClient();

  const { error: deactivateError } = await admin
    .from("video_messages")
    .update({ is_active: false })
    .eq("is_active", true);

  if (deactivateError) {
    throw new Error("Failed to retire the previous video message.");
  }

  const { error: insertError } = await admin.from("video_messages").insert({
    video_url: videoUrl,
    source_type: sourceType,
    caption,
    is_active: true,
  });

  if (insertError) {
    throw new Error("Failed to publish the video message.");
  }

  revalidatePath("/");
  revalidatePath("/admin");
}

/** Hides the current video message from the homepage without deleting it. */
export async function removeActiveVideoMessage() {
  await assertAuthenticated();

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("video_messages")
    .update({ is_active: false })
    .eq("is_active", true);

  if (error) {
    throw new Error("Failed to remove the video message.");
  }

  revalidatePath("/");
  revalidatePath("/admin");
}

/** Creates a new announcement (poster). Image, if any, is already uploaded. */
export async function createAnnouncement(input: AnnouncementInsert) {
  await assertAuthenticated();

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("announcements").insert(input);

  if (error) {
    throw new Error("Failed to create the announcement.");
  }

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function setAnnouncementActive(id: string, isActive: boolean) {
  await assertAuthenticated();

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("announcements")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) {
    throw new Error("Failed to update the announcement.");
  }

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deleteAnnouncement(id: string) {
  await assertAuthenticated();

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("announcements").delete().eq("id", id);

  if (error) {
    throw new Error("Failed to delete the announcement.");
  }

  revalidatePath("/");
  revalidatePath("/admin");
}

/**
 * Adds a testimony typed directly by a ministry operator. Defaults to
 * 'approved' since a staff-authored entry needs no separate moderation
 * step -- it shows on the public Testimonials Wall immediately.
 */
export async function createTestimonial(input: TestimonialInsert) {
  await assertAuthenticated();

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("testimonials").insert({
    status: "approved",
    ...input,
  });

  if (error) {
    throw new Error("Failed to save the testimony.");
  }

  revalidatePath("/testimonials");
  revalidatePath("/admin");
}

export async function setTestimonialStatus(id: string, status: TestimonialStatus) {
  await assertAuthenticated();

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("testimonials").update({ status }).eq("id", id);

  if (error) {
    throw new Error("Failed to update the testimony's status.");
  }

  revalidatePath("/testimonials");
  revalidatePath("/admin");
}

export async function deleteTestimonial(id: string) {
  await assertAuthenticated();

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("testimonials").delete().eq("id", id);

  if (error) {
    throw new Error("Failed to delete the testimony.");
  }

  revalidatePath("/testimonials");
  revalidatePath("/admin");
}

/** Creates a new donation tier shown as a card on /giving. */
export async function createDonationTier(input: DonationTierInsert) {
  await assertAuthenticated();

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("donation_tiers").insert(input);

  if (error) {
    throw new Error(
      error.code === "23505"
        ? "A tier with that label already exists."
        : "Failed to create the donation tier."
    );
  }

  revalidatePath("/giving");
  revalidatePath("/admin");
}

/** Edits an existing tier's label, amount, and/or description. */
export async function updateDonationTier(
  id: string,
  updates: Partial<Pick<DonationTierRow, "label" | "amount" | "description">>
) {
  await assertAuthenticated();

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("donation_tiers").update(updates).eq("id", id);

  if (error) {
    throw new Error(
      error.code === "23505"
        ? "A tier with that label already exists."
        : "Failed to update the donation tier."
    );
  }

  revalidatePath("/giving");
  revalidatePath("/admin");
}

export async function setDonationTierActive(id: string, isActive: boolean) {
  await assertAuthenticated();

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("donation_tiers")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) {
    throw new Error("Failed to update the donation tier.");
  }

  revalidatePath("/giving");
  revalidatePath("/admin");
}

export async function deleteDonationTier(id: string) {
  await assertAuthenticated();

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("donation_tiers").delete().eq("id", id);

  if (error) {
    throw new Error("Failed to delete the donation tier.");
  }

  revalidatePath("/giving");
  revalidatePath("/admin");
}

/** Creates a new topic tag (e.g. "Prophecy") for the /teachings video library. */
export async function createVideoCategory(label: string) {
  await assertAuthenticated();

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("video_categories").insert({ label: label.trim() });

  if (error) {
    throw new Error(
      error.code === "23505" ? "A category with that name already exists." : "Failed to create the category."
    );
  }

  revalidatePath("/teachings");
  revalidatePath("/admin");
}

export async function renameVideoCategory(id: string, label: string) {
  await assertAuthenticated();

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("video_categories")
    .update({ label: label.trim() })
    .eq("id", id);

  if (error) {
    throw new Error(
      error.code === "23505" ? "A category with that name already exists." : "Failed to rename the category."
    );
  }

  revalidatePath("/teachings");
  revalidatePath("/admin");
}

/** Deleting a category also removes its video tag assignments (ON DELETE CASCADE). */
export async function deleteVideoCategory(id: string) {
  await assertAuthenticated();

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("video_categories").delete().eq("id", id);

  if (error) {
    throw new Error("Failed to delete the category.");
  }

  revalidatePath("/teachings");
  revalidatePath("/admin");
}

/** Tags or untags a single YouTube video with a category. */
export async function setVideoCategoryAssignment(
  videoId: string,
  categoryId: string,
  assigned: boolean
) {
  await assertAuthenticated();

  const admin = createSupabaseAdminClient();

  if (assigned) {
    const { error } = await admin
      .from("video_category_assignments")
      .upsert({ video_id: videoId, category_id: categoryId }, { onConflict: "video_id,category_id" });

    if (error) {
      throw new Error("Failed to tag the video.");
    }
  } else {
    const { error } = await admin
      .from("video_category_assignments")
      .delete()
      .eq("video_id", videoId)
      .eq("category_id", categoryId);

    if (error) {
      throw new Error("Failed to untag the video.");
    }
  }

  revalidatePath("/teachings");
  revalidatePath("/admin");
}

/**
 * Creates a new /admin operator account directly via Supabase's Admin
 * API -- equivalent to Authentication -> Users -> Add user in the
 * Supabase dashboard, but reachable without leaving this app.
 */
export async function createAdminUser(email: string, password: string) {
  await assertAuthenticated();

  const admin = createSupabaseAdminClient();
  const { error } = await admin.auth.admin.createUser({
    email: email.trim(),
    password,
    email_confirm: true,
  });

  if (error) {
    throw new Error(error.message || "Failed to create the operator account.");
  }

  revalidatePath("/admin");
}

/** Sets a new password for an existing operator account -- no email round trip. */
export async function resetAdminUserPassword(userId: string, newPassword: string) {
  await assertAuthenticated();

  const admin = createSupabaseAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, {
    password: newPassword,
  });

  if (error) {
    throw new Error(error.message || "Failed to reset the password.");
  }

  revalidatePath("/admin");
}

/**
 * Removes an operator account. Refuses to delete your own currently
 * signed-in account, or the last remaining operator -- either would lock
 * every ministry staff member out of /admin.
 */
export async function deleteAdminUser(userId: string) {
  const session = await assertAuthenticated();

  if (userId === session.user.id) {
    throw new Error("You can't delete the account you're currently signed in as.");
  }

  const admin = createSupabaseAdminClient();
  const { data: usersList, error: listError } = await admin.auth.admin.listUsers();

  if (listError) {
    throw new Error("Failed to verify remaining operators.");
  }

  if (usersList.users.length <= 1) {
    throw new Error("Can't delete the last remaining operator account.");
  }

  const { error } = await admin.auth.admin.deleteUser(userId);

  if (error) {
    throw new Error(error.message || "Failed to delete the operator account.");
  }

  revalidatePath("/admin");
}

/** Creates a new digital product (e-book, music, etc). The file is already uploaded. */
export async function createProduct(input: ProductInsert) {
  await assertAuthenticated();

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("products").insert(input);

  if (error) {
    throw new Error("Failed to create the product.");
  }

  revalidatePath("/store");
  revalidatePath("/admin");
}

export async function updateProduct(
  id: string,
  updates: Partial<
    Pick<ProductRow, "title" | "description" | "category" | "price" | "cover_image_url">
  >
) {
  await assertAuthenticated();

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("products").update(updates).eq("id", id);

  if (error) {
    throw new Error("Failed to update the product.");
  }

  revalidatePath("/store");
  revalidatePath("/admin");
}

/**
 * Swaps a product's underlying file for a newly-uploaded one (already
 * uploaded to the private digital-products bucket by the caller) and
 * removes the old file so it doesn't linger in storage unused.
 */
export async function replaceProductFile(id: string, newFilePath: string) {
  await assertAuthenticated();

  const admin = createSupabaseAdminClient();

  const { data: existing } = await admin
    .from("products")
    .select("file_path")
    .eq("id", id)
    .maybeSingle();

  const { error } = await admin.from("products").update({ file_path: newFilePath }).eq("id", id);

  if (error) {
    throw new Error("Failed to update the product's file.");
  }

  if (existing?.file_path && existing.file_path !== newFilePath) {
    await admin.storage.from("digital-products").remove([existing.file_path]);
  }

  revalidatePath("/store");
  revalidatePath("/admin");
}

export async function setProductActive(id: string, isActive: boolean) {
  await assertAuthenticated();

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("products").update({ is_active: isActive }).eq("id", id);

  if (error) {
    throw new Error("Failed to update the product.");
  }

  revalidatePath("/store");
  revalidatePath("/admin");
}

export async function deleteProduct(id: string) {
  await assertAuthenticated();

  const admin = createSupabaseAdminClient();

  const { data: product } = await admin
    .from("products")
    .select("file_path")
    .eq("id", id)
    .maybeSingle();

  const { error } = await admin.from("products").delete().eq("id", id);

  if (error) {
    throw new Error("Failed to delete the product.");
  }

  if (product?.file_path) {
    await admin.storage.from("digital-products").remove([product.file_path]);
  }

  revalidatePath("/store");
  revalidatePath("/admin");
}

export async function setProductOrderStatus(id: string, status: ProductOrderStatus) {
  await assertAuthenticated();

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("product_orders").update({ status }).eq("id", id);

  if (error) {
    throw new Error("Failed to update the order.");
  }

  revalidatePath("/admin");
}

/**
 * Generates a time-limited signed URL for a product's file so the
 * operator can send it to a customer once payment is confirmed in
 * PayPal. Expires in 7 days -- long enough to deliver, short enough
 * that an old link floating in an inbox doesn't stay valid forever.
 */
export async function generateProductDownloadLink(productId: string): Promise<string> {
  await assertAuthenticated();

  const admin = createSupabaseAdminClient();
  const { data: product, error: productError } = await admin
    .from("products")
    .select("file_path")
    .eq("id", productId)
    .maybeSingle();

  if (productError || !product) {
    throw new Error("Product not found.");
  }

  const SEVEN_DAYS_IN_SECONDS = 60 * 60 * 24 * 7;
  const { data, error } = await admin.storage
    .from("digital-products")
    .createSignedUrl(product.file_path, SEVEN_DAYS_IN_SECONDS);

  if (error || !data) {
    throw new Error("Failed to generate a download link.");
  }

  return data.signedUrl;
}
